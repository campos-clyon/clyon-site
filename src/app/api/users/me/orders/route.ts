export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { withConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Validar autenticação e ler parâmetros
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const userEmail = session.user.email; // Explicit capture before async boundary
    const emailNorm = userEmail.trim().toLowerCase();

    // Ler status e paginação da URL
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") ?? "todos";
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const limit = 10;
    const offset = (page - 1) * limit;

    // 2. Executar query mínima com conexão isolada
    const result = await withConnection(async (conn) => {
      // Obter telefone do utilizador autenticado (da tabela users)
      const [userRows] = await conn.execute(
        `SELECT phone FROM users WHERE email = ?`,
        [userEmail]
      ) as [Array<{ phone?: string | null }>, unknown];

      const userPhone = userRows[0]?.phone;
      
      // Função para normalizar telefone: remover espaços/traços/+351, comparar últimos 9 dígitos
      const normalizePhone = (phone: string | null | undefined): string | null => {
        if (!phone) return null;
        // Remover espaços, traços, +
        const cleaned = phone.replace(/[\s\-+]/g, "");
        // Remover prefixo 351 ou 00351 se existir
        const normalized = cleaned.replace(/^(00)?351/, "");
        // Pegar últimos 9 dígitos
        return normalized.slice(-9);
      };

      const userPhoneNorm = normalizePhone(userPhone);

      // Query MÍNIMA: apenas colunas essenciais, sem joins, sem funções complexas
      // Busca por email OU (se tiver phone) por telefone normalizado
      let whereClause = "LOWER(TRIM(contactEmail)) = LOWER(TRIM(?))";
      const params: any[] = [emailNorm];

      if (userPhoneNorm) {
        whereClause += ` OR SUBSTRING(
          REPLACE(REPLACE(REPLACE(REPLACE(contactPhone, ' ', ''), '-', ''), '+', ''), '351', ''),
          -9
        ) = ?`;
        params.push(userPhoneNorm);
      }

      // Adicionar filtro de status se não for "todos"
      if (status !== "todos") {
        whereClause = `(${whereClause}) AND status = ?`;
        params.push(status);
      }

      // Contar total ANTES de paginar
      const countParams = [...params];
      const [countRows] = await conn.execute(
        `SELECT COUNT(*) as total FROM simulatorOrders WHERE ${whereClause}`,
        countParams
      ) as [Array<{ total: number }>, unknown];
      const total = Number(countRows[0]?.total ?? 0);

      // Contagem geral, sem filtro de estado — para o cabeçalho "X pedidos no total"
      const baseWhereClause = userPhoneNorm
        ? `LOWER(TRIM(contactEmail)) = LOWER(TRIM(?)) OR SUBSTRING(REPLACE(REPLACE(REPLACE(REPLACE(contactPhone, ' ', ''), '-', ''), '+', ''), '351', ''), -9) = ?`
        : "LOWER(TRIM(contactEmail)) = LOWER(TRIM(?))";
      const baseParams = userPhoneNorm ? [emailNorm, userPhoneNorm] : [emailNorm];

      const [grandTotalRows] = await conn.execute(
        `SELECT COUNT(*) as total FROM simulatorOrders WHERE ${baseWhereClause}`,
        baseParams,
      ) as [Array<{ total: number }>, unknown];
      const grandTotal = Number(grandTotalRows[0]?.total ?? 0);

      // Validar LIMIT e OFFSET com Number.isFinite antes de interpolar
      const safeLimit = Number.isFinite(limit) ? Math.floor(limit) : 10;
      const safeOffset = Number.isFinite(offset) ? Math.floor(offset) : 0;

      const [orders] = await conn.execute(
        `SELECT
           id,
           contactName,
           contactEmail,
           contactPhone,
           serviceType,
           address,
           city,
           postalCode,
           status,
           estimateTotal,
           estimateMin,
           estimateMax,
           precoFinal,
           precoFinalIva,
           mensagemCliente,
           description,
           scheduledDate,
           scheduledStartTime,
           scheduledEndTime,
           assignedToName,
           createdAt,
           updatedAt,
           confirmadoPeloCliente,
           canceladoPeloCliente
         FROM simulatorOrders
         WHERE ${whereClause}
         ORDER BY id DESC
         LIMIT ${safeLimit} OFFSET ${safeOffset}`,
        params
      ) as [Array<any>, unknown];

      // 3. Serializar datas para ISO string
      const serializedOrders = orders.map((row) => ({
        id: row.id,
        contactName: row.contactName,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        serviceType: row.serviceType,
        address: row.address,
        city: row.city,
        postalCode: row.postalCode,
        status: row.status,
        estimateTotal: row.estimateTotal,
        estimateMin: row.estimateMin,
        estimateMax: row.estimateMax,
        precoFinal: row.precoFinal,
        precoFinalIva: row.precoFinalIva,
        mensagemCliente: row.mensagemCliente,
        description: row.description,
        assignedToName: row.assignedToName,
        scheduledDate: row.scheduledDate ? new Date(row.scheduledDate).toISOString() : null,
        scheduledStartTime: row.scheduledStartTime,
        scheduledEndTime: row.scheduledEndTime,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
        updatedAt: row.updatedAt ? new Date(row.updatedAt).toISOString() : null,
        confirmadoPeloCliente: row.confirmadoPeloCliente,
        canceladoPeloCliente: row.canceladoPeloCliente,
      }));

      // 4. Retornar resultado com total, pages e dados de paginação
      return {
        ok: true,
        total,        // reflete o filtro atual (usado para paginação)
        grandTotal,   // sempre o total geral, sem filtro (para o cabeçalho)
        pages: Math.ceil(total / limit),
        currentPage: page,
        summary: {
          totalOrders: total,
          activeOrders: orders.length,
          lastOrderDate: orders[0]?.createdAt ? new Date(orders[0].createdAt).toISOString() : null,
        },
        orders: serializedOrders,
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    // Log do erro real para diagnóstico
    console.error("[/api/users/me/orders] ERROR:", {
      message: err?.message,
      code: err?.code,
      sqlMessage: err?.sqlMessage,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        ok: false,
        error: "ORDERS_FETCH_FAILED",
        message: "Não foi possível carregar os pedidos.",
      },
      { status: 500 }
    );
  }
}
