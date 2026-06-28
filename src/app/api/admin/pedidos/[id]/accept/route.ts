import { NextRequest, NextResponse } from "next/server";
import {
  getSimulatorOrderById,
  updateSimulatorOrder,
  appendOrderHistory,
  getColaboradorById,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/pedidos/[id]/accept
 *
 * Permite a uma assistente aceitar um pedido da fila geral (assignedToId IS NULL).
 * Regras:
 *   - JWT válido obrigatório.
 *   - Colaborador tem de ser assistente com active=1 e canReceiveSimulatorRequests=1.
 *   - O pedido deve estar sem assistente ou já atribuído ao mesmo colaborador.
 *   - Admin geral (isAdmin=1) pode forçar sem verificar canReceiveSimulatorRequests.
 *   - Se outro assistente já aceitou, devolve 409 com mensagem amigável.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jwt = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!jwt) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  const [order, colab] = await Promise.all([
    getSimulatorOrderById(orderId),
    getColaboradorById(jwt.id),
  ]);

  if (!order) {
    return NextResponse.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 });
  }
  if (!colab) {
    return NextResponse.json({ ok: false, message: "Colaborador não encontrado." }, { status: 404 });
  }

  const isAdmin = colab.isAdmin === 1;
  const isAssistente = colab.funcao === "assistente";

  // Permission checks for non-admins
  if (!isAdmin) {
    if (!isAssistente) {
      return NextResponse.json(
        { ok: false, message: "Apenas assistentes podem aceitar pedidos." },
        { status: 403 }
      );
    }
    if (!colab.active || colab.active === 0) {
      return NextResponse.json(
        { ok: false, message: "A sua conta está inativa." },
        { status: 403 }
      );
    }
    if (!colab.canReceiveSimulatorRequests || colab.canReceiveSimulatorRequests === 0) {
      return NextResponse.json(
        { ok: false, message: "Não tem permissão para aceitar pedidos do simulador." },
        { status: 403 }
      );
    }
  }

  // Already claimed by someone else?
  if (order.assignedToId && order.assignedToId !== colab.id) {
    return NextResponse.json(
      {
        ok: false,
        message: `Este pedido já foi aceite por ${order.assignedToName ?? "outra assistente"}.`,
      },
      { status: 409 }
    );
  }

  // Status guard — only accept "open" orders unless admin
  const acceptableStatuses = ["sem_assistente", "pendente", "novo"];
  if (!acceptableStatuses.includes(order.status) && !isAdmin) {
    return NextResponse.json(
      {
        ok: false,
        message: `Pedido com status "${order.status}" não pode ser aceite desta forma.`,
      },
      { status: 409 }
    );
  }

  await updateSimulatorOrder(orderId, {
    assignedToId: colab.id,
    assignedToName: colab.nome,
    assignedAt: new Date().toISOString() as unknown as null,
    status: "atribuido",
    acceptedAt: new Date() as unknown as null,
  } as Parameters<typeof updateSimulatorOrder>[1]);

  await appendOrderHistory(orderId, {
    type: "accepted",
    by: { id: colab.id, nome: colab.nome, role: colab.funcao ?? "assistente" },
    message: `Pedido aceite por ${colab.nome}. Status alterado para "Atribuído".`,
  });

  const updated = await getSimulatorOrderById(orderId);

  return NextResponse.json({
    ok: true,
    message: "Pedido aceite com sucesso.",
    order: updated,
  });
}
