import { NextRequest, NextResponse } from "next/server";
import { approveSimulatorOrder, getSimulatorOrderById } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  if (!colab.isAdmin) return { err: NextResponse.json({ error: "Acesso negado" }, { status: 403 }), colab: null };
  return { err: null, colab };
}

// POST /api/admin/pedidos/approve
export async function POST(req: NextRequest) {
  const { err, colab } = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const { id, precoFinal, precoFinalIva, mensagemCliente, notasInternas } = body;
  if (!id || !precoFinal) return NextResponse.json({ error: "id e precoFinal obrigatórios" }, { status: 400 });

  await approveSimulatorOrder(Number(id), {
    precoFinal: Number(precoFinal),
    precoFinalIva: Number(precoFinalIva ?? precoFinal * 1.23),
    mensagemCliente: mensagemCliente ?? "",
    notasInternas: notasInternas ?? undefined,
    reviewedBy: { id: colab!.id, nome: colab!.nome, role: "admin" },
  });

  const order = await getSimulatorOrderById(Number(id));
  return NextResponse.json({ ok: true, order });
}
