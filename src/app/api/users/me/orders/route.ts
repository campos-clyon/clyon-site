import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { withConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Validar autenticação
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const userEmail = session.user.email; // Explicit capture before async boundary
    const emailNorm = userEmail.trim().toLowerCase();

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

      const [orders] = await conn.execute(
        `SELECT
           id,
           contactName,
           contactEmail,
           contactPhone,
           serviceType,
           address,
           status,
           estimateTotal,
           createdAt
         FROM simulatorOrders
         WHERE ${whereClause}
         ORDER BY id DESC
         LIMIT 50`,
        params
      ) as [Array<any>, unknown];

      // 3. Serializar createdAt para ISO string (única conversão)
      const serializedOrders = orders.map((row) => ({
        id: row.id,
        contactName: row.contactName,
        contactEmail: row.contactEmail,
        contactPhone: row.contactPhone,
        serviceType: row.serviceType,
        address: row.address,
        status: row.status,
        estimateTotal: row.estimateTotal,
        createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : null,
      }));

      // 4. Retornar resultado mínimo
      return {
        ok: true,
        summary: {
          totalOrders: orders.length,
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
