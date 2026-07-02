import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";
import { getPool, ensureSimulatorOrdersTable } from "@/lib/db";

/**
 * Endpoint de diagnóstico temporário — mostra exactamente porque os pedidos não aparecem.
 * 
 * Apenas para cliente autenticado, e mostra:
 * 1. Email da sessão (normalizado)
 * 2. Total de pedidos na tabela
 * 3. Emails únicos guardados
 * 4. Quantos pedidos correspondem ao email da sessão (com diferentes estratégias)
 * 5. Detalhe dos primeiros 5 pedidos
 * 
 * Remover este endpoint após diagnóstico.
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  try {
    await ensureSimulatorOrdersTable();
    const pool = await getPool();
    if (!pool) throw new Error("Pool indisponível");

    const emailNorm = session.user.email.trim().toLowerCase();

    // 1. Total de pedidos na tabela
    const [totalTest] = await pool.execute(
      `SELECT COUNT(*) AS total FROM simulatorOrders`
    ) as [Array<{ total: number }>, unknown];
    const totalOrders = totalTest[0]?.total ?? 0;

    // 2. Mostrar emails únicos (primeiros 10)
    const [emailsTest] = await pool.execute(
      `SELECT DISTINCT contactEmail FROM simulatorOrders LIMIT 10`
    ) as [Array<{ contactEmail: string | null }>, unknown];
    const uniqueEmails = emailsTest.map(r => r.contactEmail);

    // 3. Testar diferentes estratégias de filtragem
    const [exactTest] = await pool.execute(
      `SELECT COUNT(*) AS total FROM simulatorOrders WHERE contactEmail = ?`,
      [emailNorm]
    ) as [Array<{ total: number }>, unknown];

    const [lowerTrimTest] = await pool.execute(
      `SELECT COUNT(*) AS total FROM simulatorOrders WHERE LOWER(TRIM(contactEmail)) = ?`,
      [emailNorm]
    ) as [Array<{ total: number }>, unknown];

    const [likeTest] = await pool.execute(
      `SELECT COUNT(*) AS total FROM simulatorOrders WHERE contactEmail LIKE ?`,
      [`%${emailNorm}%`]
    ) as [Array<{ total: number }>, unknown];

    // 4. Detalhe dos primeiros 5 pedidos do cliente
    const [detailTest] = await pool.execute(
      `SELECT id, contactName, contactEmail, contactPhone, serviceType, status, createdAt 
       FROM simulatorOrders 
       WHERE LOWER(TRIM(contactEmail)) = ?
       ORDER BY createdAt DESC
       LIMIT 5`,
      [emailNorm]
    ) as [Array<Record<string, unknown>>, unknown];

    return NextResponse.json({
      diagnosis: {
        sessionEmail: emailNorm,
        totalOrdersInTable: totalOrders,
        uniqueEmailsInTable: uniqueEmails,
        filteringTests: {
          exactMatch: exactTest[0]?.total ?? 0,
          lowerTrimMatch: lowerTrimTest[0]?.total ?? 0,
          likeMatch: likeTest[0]?.total ?? 0,
        },
        foundOrders: detailTest.length,
        orders: detailTest,
      },
    });
  } catch (err) {
    console.error("[debug/orders-check]:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
