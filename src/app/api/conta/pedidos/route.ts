import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";
import { getPool, ensureSimulatorOrdersTable } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const emailNorm = session.user.email.trim().toLowerCase();

  try {
    await ensureSimulatorOrdersTable();
    const pool = await getPool();
    if (!pool) throw new Error("Pool não disponível");

  // Telefone do perfil — permite ligar pedidos criados com o mesmo número antes do login
  // NOTA: A tabela `users` ainda não tem coluna `phone`, portanto este fallback
  // não funciona por enquanto. Fallback desactivado até migração.
  let phone: string | null = null;
  // try {
  //   const [uRows] = await pool.execute(
  //     "SELECT phone FROM users WHERE email = ? AND deletedAt IS NULL LIMIT 1",
  //     [emailNorm],
  //   ) as [Array<{ phone: string | null }>, unknown];
  //   phone = uRows[0]?.phone ?? null;
  // } catch {
  //   phone = null;
  // }

    // Ligação por email (normalizado) OU telefone
    const parts = ["LOWER(TRIM(contactEmail)) = ?"];
    const params: unknown[] = [emailNorm];
    if (phone && phone.trim()) {
      parts.push("REPLACE(contactPhone, ' ', '') = ?");
      params.push(phone.replace(/\s+/g, ""));
    }
    const where = `(${parts.join(" OR ")})`;

    const [rows] = await pool.execute(
      `SELECT
         id, serviceType, address, city, status, estimateTotal, precoFinal,
         precoFinalIva, mensagemCliente, createdAt, scheduledDate,
         scheduledStartTime, scheduledEndTime
       FROM simulatorOrders
       WHERE ${where}
       ORDER BY createdAt DESC
       LIMIT 50`,
      params,
    ) as [Array<Record<string, unknown>>, unknown];

    return NextResponse.json({ pedidos: rows });
  } catch (err) {
    console.error("[api/conta/pedidos] Erro:", err);
    return NextResponse.json({ error: "Erro ao carregar pedidos." }, { status: 500 });
  }
}
