import { NextRequest, NextResponse } from "next/server";
import {
  getSimulatorOrderById,
  updateSimulatorOrder,
  appendOrderHistory,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/pedidos/[id]/accept
 *
 * Permite a uma assistente aceitar um pedido da fila geral.
 * Regras:
 *   - Apenas assistentes activas com canReceiveSimulatorRequests=1 podem aceitar.
 *   - O pedido tem de estar sem assistente (assignedToId IS NULL) e com status
 *     "sem_assistente", "pendente" ou "novo".
 *   - Admin geral (isAdmin=1) pode forçar a aceitação (reatribuição) sem restrições.
 *   - Se outro assistente já aceitou, devolve erro amigável.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) {
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);

  const order = await getSimulatorOrderById(orderId);
  if (!order) {
    return NextResponse.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 });
  }

  const isAdmin = colab.isAdmin === 1;
  const isAssistente = colab.funcao === "assistente";

  // Permissão: admin geral passa sempre; assistente precisa de canReceiveSimulatorRequests=1 e active=1
  if (!isAdmin) {
    if (!isAssistente) {
      return NextResponse.json(
        { ok: false, message: "Apenas assistentes podem aceitar pedidos." },
        { status: 403 }
      );
    }
    if (!colab.active) {
      return NextResponse.json(
        { ok: false, message: "A sua conta está inativa." },
        { status: 403 }
      );
    }
    if (!colab.canReceiveSimulatorRequests) {
      return NextResponse.json(
        { ok: false, message: "Não tem permissão para aceitar pedidos do simulador." },
        { status: 403 }
      );
    }
  }

  // Verificar se o pedido já foi aceite por outra pessoa
  if (order.assignedToId && order.assignedToId !== colab.id) {
    return NextResponse.json(
      {
        ok: false,
        message: `Este pedido já foi aceite por ${order.assignedToName ?? "outra assistente"}.`,
      },
      { status: 409 }
    );
  }

  // Verificar se o pedido está num estado aceitável
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

  // Aceitar o pedido
  await updateSimulatorOrder(orderId, {
    assignedToId: colab.id,
    assignedToName: colab.nome,
    assignedAt: new Date().toISOString() as unknown as null, // cast para o tipo do update
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
