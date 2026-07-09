export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { countSimulatorOrdersByContactEmail } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

// GET /api/admin/order-count?email=foo@bar.com
// Retorna { count: N } de pedidos com esse email
export async function GET(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  // Apenas admin geral e assistentes podem aceder
  if (colab.isAdmin !== 1 && colab.funcao !== "assistente") {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
  }

  try {
    const count = await countSimulatorOrdersByContactEmail(email);
    return NextResponse.json({ count });
  } catch (err) {
    console.error("[v0] order-count error:", err);
    return NextResponse.json({ error: "Erro ao contar pedidos" }, { status: 500 });
  }
}
