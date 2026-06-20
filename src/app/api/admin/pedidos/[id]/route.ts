import { NextRequest, NextResponse } from "next/server";
import { getSimulatorOrderById } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!colab.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  return null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const err = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;
  const order = await getSimulatorOrderById(Number(id));
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  return NextResponse.json({ order });
}
