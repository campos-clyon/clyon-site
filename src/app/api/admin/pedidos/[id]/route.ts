import { NextRequest, NextResponse } from "next/server";
import { getSimulatorOrderById, updateSimulatorOrder } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

async function authenticate(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };
  return { err: null, colab };
}

// GET /api/admin/pedidos/[id]
// Admin vê qualquer pedido; assistente vê apenas os seus.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { err, colab } = await authenticate(req);
  if (err) return err;
  const { id } = await params;

  const order = await getSimulatorOrderById(Number(id));
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  if (!colab!.isAdmin && order.assignedToId !== colab!.id) {
    return NextResponse.json({ error: "Sem permissão para ver este pedido" }, { status: 403 });
  }

  return NextResponse.json({ order });
}

// PATCH /api/admin/pedidos/[id]
// Admin pode alterar qualquer campo; assistente só pode alterar campos permitidos dos seus pedidos.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { err, colab } = await authenticate(req);
  if (err) return err;
  const { id } = await params;

  const order = await getSimulatorOrderById(Number(id));
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  if (!colab!.isAdmin && order.assignedToId !== colab!.id) {
    return NextResponse.json({ error: "Sem permissão para editar este pedido" }, { status: 403 });
  }

  const body = await req.json();

  // Assistente não pode alterar atribuição nem aprovar
  if (!colab!.isAdmin) {
    delete body.assignedToId;
    delete body.assignedToName;
    delete body.assignedAt;
    delete body.precoFinal;
    delete body.precoFinalIva;
    // Assistente pode marcar como em_analise ou precisa_info
    const allowedStatuses = ["em_analise", "precisa_info"];
    if (body.status && !allowedStatuses.includes(body.status)) {
      delete body.status;
    }
  }

  await updateSimulatorOrder(Number(id), body as Parameters<typeof updateSimulatorOrder>[1]);
  const updated = await getSimulatorOrderById(Number(id));
  return NextResponse.json({ ok: true, order: updated });
}
