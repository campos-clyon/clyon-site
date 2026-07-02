import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";
import { withConnection } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // 1. Validar autenticação
    const session = await getServerSession(authOptionsCliente);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const emailNorm = session.user.email.trim().toLowerCase();

    // 2. Executar query mínima com conexão isolada
    const result = await withConnection(async (conn) => {
      // Query MÍNIMA: apenas colunas essenciais, sem joins, sem funções complexas
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
         WHERE LOWER(TRIM(contactEmail)) = LOWER(TRIM(?))
         ORDER BY id DESC
         LIMIT 50`,
        [emailNorm]
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
