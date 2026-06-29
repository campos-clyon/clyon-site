import { NextRequest, NextResponse } from "next/server";
import {
  getSimulatorOrderById,
  updateSimulatorOrder,
  appendOrderHistory,
  getColaboradorById,
  getPool,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/pedidos/[id]/accept
 *
 * Permite a uma assistente aceitar um pedido da fila geral.
 * Regras:
 *   - JWT válido obrigatório.
 *   - Colaborador tem de ser assistente activo OU admin.
 *   - O pedido deve estar sem assistente ou já atribuído ao mesmo colaborador.
 *   - Se outro assistente já aceitou, devolve 409.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = req.headers.get("authorization");
  console.log("[v0/accept] authHeader presente:", !!authHeader, "| starts Bearer:", authHeader?.startsWith("Bearer "));

  const jwt = await verifyColaboradorAuthHeader(authHeader);
  console.log("[v0/accept] jwt verificado:", jwt ? { id: jwt.id, nome: jwt.nome, funcao: jwt.funcao } : null);

  if (!jwt) {
    console.log("[v0/accept] 401 — token inválido ou ausente");
    return NextResponse.json({ ok: false, message: "Não autorizado." }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  console.log("[v0/accept] orderId:", orderId);

  const [order, colabFromDb] = await Promise.all([
    getSimulatorOrderById(orderId),
    getColaboradorById(jwt.id),
  ]);

  console.log("[v0/accept] order:", order ? { id: order.id, status: order.status, assignedToId: order.assignedToId } : null);
  console.log("[v0/accept] colabFromDb:", colabFromDb ? { id: colabFromDb.id, funcao: colabFromDb.funcao, active: colabFromDb.active } : null);

  if (!order) {
    console.log("[v0/accept] 404 — pedido não encontrado");
    return NextResponse.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 });
  }

  // Usar dados da DB se disponíveis; caso contrário usar JWT como fallback
  const colab = colabFromDb ?? {
    id: jwt.id,
    nome: jwt.nome,
    funcao: jwt.funcao ?? null,
    isAdmin: jwt.isAdmin ?? 0,
    active: 1 as number | null,
  };

  const isAdmin = Number(colab.isAdmin) === 1;
  const isAssistente = colab.funcao === "assistente";

  // Auto-activar canReceiveSimulatorRequests=1 para assistentes que têm 0 por defeito antigo
  if (isAssistente && colabFromDb && Number(colabFromDb.canReceiveSimulatorRequests) === 0) {
    try {
      const pool = await getPool();
      if (pool) {
        await pool.execute(
          `UPDATE colaboradores SET canReceiveSimulatorRequests = 1 WHERE id = ? AND funcao = 'assistente'`,
          [colab.id]
        );
      }
    } catch { /* silencioso — não impede o accept */ }
  }

  // Apenas assistentes activos e admins podem aceitar pedidos
  if (!isAdmin && !isAssistente) {
    return NextResponse.json(
      { ok: false, message: "Apenas assistentes podem aceitar pedidos." },
      { status: 403 }
    );
  }
  if (!isAdmin && colab.active != null && Number(colab.active) === 0) {
    return NextResponse.json(
      { ok: false, message: "A sua conta está inativa." },
      { status: 403 }
    );
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

  const nowIso = new Date().toISOString();
  const updatePayload = {
    assignedToId: colab.id,
    assignedToName: colab.nome,
    assignedAt: nowIso as unknown as null,
    status: "atribuido",
    acceptedAt: nowIso,
  };
  console.log("[v0/accept] updatePayload:", updatePayload);
  try {
    await updateSimulatorOrder(orderId, updatePayload);
    console.log("[v0/accept] updateSimulatorOrder OK");
  } catch (updateErr) {
    console.error("[v0/accept] updateSimulatorOrder ERRO:", updateErr);
    return NextResponse.json({ ok: false, message: `Erro ao actualizar pedido: ${updateErr instanceof Error ? updateErr.message : String(updateErr)}` }, { status: 500 });
  }

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
