import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";
import { withConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Verificar autenticação
    const session = await getServerSession(authOptionsCliente);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const emailNorm = session.user.email.trim().toLowerCase();

    // 2. Extrair parâmetros com validação
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
    const status = (searchParams.get("status") ?? "todos").trim();
    
    const limit = 20;
    const offset = (page - 1) * limit;

    // 3. Executar query mínima e estável
    const result = await withConnection(async (conn) => {
      // Query de resumo — TODOS os pedidos do cliente, sem filtro de status
      const [summaryRows] = await conn.execute(
        `SELECT
           COUNT(*) AS totalOrders,
           SUM(CASE WHEN status NOT IN ('concluido','cancelado','rejeitado') THEN 1 ELSE 0 END) AS activeOrders,
           MAX(createdAt) AS lastOrderDate
         FROM simulatorOrders
         WHERE LOWER(TRIM(contactEmail)) = ?`,
        [emailNorm]
      ) as [Array<{ totalOrders: number; activeOrders: number | null; lastOrderDate: string | null }>, unknown];

      const summary = {
        totalOrders: Number(summaryRows[0]?.totalOrders ?? 0),
        activeOrders: Number(summaryRows[0]?.activeOrders ?? 0),
        lastOrderDate: summaryRows[0]?.lastOrderDate ? new Date(summaryRows[0].lastOrderDate).toISOString() : null,
      };

      // Query de lista — com filtro de status se fornecido
      let whereClause = "LOWER(TRIM(contactEmail)) = ?";
      const queryParams: unknown[] = [emailNorm];

      if (status && status !== "todos") {
        whereClause += " AND status = ?";
        queryParams.push(status);
      }

      // Contar total
      const [countRows] = await conn.execute(
        `SELECT COUNT(*) AS total FROM simulatorOrders WHERE ${whereClause}`,
        queryParams
      ) as [Array<{ total: number }>, unknown];
      const total = Number(countRows[0]?.total ?? 0);

      // Seleccionar apenas colunas que existem e são seguras
      const [rows] = await conn.execute(
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
           estimateMin,
           estimateMax,
           estimateTotal,
           precoFinal,
           precoFinalIva,
           mensagemCliente,
           description,
           scheduledDate,
           scheduledStartTime,
           confirmadoPeloCliente,
           canceladoPeloCliente,
           createdAt
         FROM simulatorOrders
         WHERE ${whereClause}
         ORDER BY id DESC
         LIMIT ? OFFSET ?`,
        [...queryParams, limit, offset]
      ) as [Array<Record<string, unknown>>, unknown];

      // 4. Serializar datas — VARCHAR e DATE ficam como string
      const serializedOrders = rows.map((row: any) => ({
        id: row.id,
        contactName: row.contactName,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        serviceType: row.serviceType,
        address: row.address,
        city: row.city,
        postalCode: row.postalCode,
        status: row.status,
        estimateMin: row.estimateMin,
        estimateMax: row.estimateMax,
        estimateTotal: row.estimateTotal,
        precoFinal: row.precoFinal,
        precoFinalIva: row.precoFinalIva,
        mensagemCliente: row.mensagemCliente,
        description: row.description,
        scheduledDate: row.scheduledDate ? String(row.scheduledDate) : null,
        scheduledStartTime: row.scheduledStartTime ? String(row.scheduledStartTime) : null,
        confirmadoPeloCliente: row.confirmadoPeloCliente ? Boolean(row.confirmadoPeloCliente) : false,
        canceladoPeloCliente: row.canceladoPeloCliente ? Boolean(row.canceladoPeloCliente) : false,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      }));

      return {
        ok: true,
        summary,
        orders: serializedOrders,
        total,
        page,
        pages: Math.ceil(total / limit),
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[api/users/me/orders] ERROR:", {
      message: err?.message,
      code: err?.code,
      sqlMessage: err?.sqlMessage,
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
