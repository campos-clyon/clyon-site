import { NextRequest, NextResponse } from "next/server";
import { getPool, ensureSimulatorOrdersTable } from "@/lib/db";

/**
 * Endpoint de diagnóstico detalhado para debug de problemas com pedidos.
 * Mostra: total de pedidos, schema da tabela, sample de pedidos.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const isDev = process.env.NODE_ENV === "development";

  // Proteção básica em produção (exigir um token simples)
  if (!isDev) {
    const token = new URL(request.url).searchParams.get("token");
    if (token !== process.env.DEBUG_TOKEN && !authHeader?.includes("Bearer")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
  }

  try {
    await ensureSimulatorOrdersTable();
    const pool = await getPool();
    if (!pool) throw new Error("Pool não disponível");

    // Test 1: Total de pedidos
    const [totalResult] = await pool.execute(
      "SELECT COUNT(*) AS total, COUNT(DISTINCT contactEmail) AS distinctEmails FROM simulatorOrders"
    ) as [Array<{ total: number; distinctEmails: number }>, unknown];

    // Test 2: Amostra de emails únicos
    const [emailsResult] = await pool.execute(
      "SELECT DISTINCT LOWER(TRIM(contactEmail)) AS email, COUNT(*) AS cnt FROM simulatorOrders WHERE contactEmail IS NOT NULL GROUP BY LOWER(TRIM(contactEmail)) LIMIT 10"
    ) as [Array<{ email: string; cnt: number }>, unknown];

    // Test 3: Amostra dos últimos 5 pedidos
    const [ordersResult] = await pool.execute(
      "SELECT id, contactName, contactEmail, status, createdAt FROM simulatorOrders ORDER BY id DESC LIMIT 5"
    ) as [Array<any>, unknown];

    // Test 4: Verificar se a coluna updatedAt existe e está a funcionar
    const [updateAtResult] = await pool.execute(
      "SELECT id, createdAt, updatedAt FROM simulatorOrders LIMIT 1"
    ) as [Array<any>, unknown];

    return NextResponse.json({
      ok: true,
      summary: {
        totalOrders: totalResult[0]?.total ?? 0,
        distinctEmails: totalResult[0]?.distinctEmails ?? 0,
      },
      emailDistribution: emailsResult.map(r => ({ email: r.email, count: r.cnt })),
      recentOrders: ordersResult.map(o => ({
        id: o.id,
        name: o.contactName,
        email: o.contactEmail,
        status: o.status,
        createdAt: o.createdAt,
      })),
      columnTest: {
        hasUpdatedAt: !!updateAtResult[0]?.updatedAt,
        sample: updateAtResult[0] ? {
          id: updateAtResult[0].id,
          createdAt: updateAtResult[0].createdAt,
          updatedAt: updateAtResult[0].updatedAt,
        } : null,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Erro desconhecido",
        ...(isDev && { stack: err?.stack }),
      },
      { status: 500 }
    );
  }
}
