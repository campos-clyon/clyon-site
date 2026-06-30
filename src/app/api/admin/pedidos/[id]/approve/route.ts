import { NextRequest, NextResponse } from "next/server";
import { approveSimulatorOrder, getSimulatorOrderById, updateSimulatorOrder } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  if (!colab.isAdmin) return { err: NextResponse.json({ error: "Acesso negado" }, { status: 403 }), colab: null };
  return { err: null, colab };
}

// POST /api/admin/pedidos/[id]/approve
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { err, colab } = await requireAdmin(req);
  if (err) return err;
  const { id } = await params;

  let body: Record<string, unknown> = {};
  try { body = await req.json(); } catch {}

  const { precoFinal, precoFinalIva, mensagemCliente, notasInternas } = body as Record<string, string | undefined>;

  // Se precoFinal fornecido usa approveSimulatorOrder, senão apenas muda status
  if (precoFinal) {
    await approveSimulatorOrder(Number(id), {
      precoFinal: Number(precoFinal),
      precoFinalIva: Number(precoFinalIva ?? Number(precoFinal) * 1.23),
      mensagemCliente: mensagemCliente ?? "",
      notasInternas: notasInternas ?? undefined,
      reviewedBy: { id: colab!.id, nome: colab!.nome, role: "admin" },
    });
  } else {
    await updateSimulatorOrder(Number(id), { status: "aprovado" } as Parameters<typeof updateSimulatorOrder>[1]);
  }

  const order = await getSimulatorOrderById(Number(id));
  return NextResponse.json({ ok: true, order });
}
