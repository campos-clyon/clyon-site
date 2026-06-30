import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";
import { getPool } from "@/lib/db";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page    = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const status  = searchParams.get("status") ?? "todos";
  const limit   = 10;
  const offset  = (page - 1) * limit;

  try {
    const pool = await getPool();
    if (!pool) throw new Error("Pool não disponível");

    const conditions = ["contactEmail = ?"];
    const params: unknown[] = [session.user.email];

    if (status !== "todos") {
      conditions.push("status = ?");
      params.push(status);
    }

    const where = conditions.join(" AND ");

    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM simulatorOrders WHERE ${where}`,
      params,
    ) as [Array<{ total: number }>, unknown];
    const total = countRows[0]?.total ?? 0;

    const [rows] = await pool.execute(
      `SELECT
         id, serviceType, address, city, postalCode, status,
         estimateMin, estimateMax, estimateTotal,
         precoFinal, precoFinalIva,
         mensagemCliente, description,
         scheduledDate, scheduledStartTime,
         createdAt, updatedAt, confirmadoPeloCliente,
         canceladoPeloCliente
       FROM simulatorOrders
       WHERE ${where}
       ORDER BY createdAt DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    ) as [Array<Record<string, unknown>>, unknown];

    return NextResponse.json({
      orders: rows,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error("[api/users/me/orders] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar pedidos." }, { status: 500 });
  }
}
