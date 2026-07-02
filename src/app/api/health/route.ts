import { NextResponse } from "next/server";
import { getPool, ensureSimulatorOrdersTable } from "@/lib/db";

export async function GET() {
  try {
    await ensureSimulatorOrdersTable();
    const pool = await getPool();
    if (!pool) {
      return NextResponse.json(
        { ok: false, error: "Pool não disponível" },
        { status: 503 }
      );
    }

    // Test: contar todos os pedidos
    const [result] = await pool.execute(
      "SELECT COUNT(*) AS count FROM simulatorOrders"
    ) as [Array<{ count: number }>, unknown];

    return NextResponse.json({
      ok: true,
      timestamp: new Date().toISOString(),
      database: {
        connected: true,
        totalOrders: result[0]?.count ?? 0,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "Erro desconhecido",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
