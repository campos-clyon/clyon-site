import { NextRequest, NextResponse } from "next/server";
import { recusarPedido, getSimulatorOrderById, getColaboradorById, appendOrderHistory } from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/pedidos/[id]/recusar
 *
 * Permite a um colaborador recusar pessoalmente um pedido da fila geral.
 * O pedido continua disponível para outros assistentes.
 * Regras:
 *   - JWT válido obrigatório.
 *   - O pedido deve estar sem assistente (assignedToId IS NULL).
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

  const [order, colabFromDb] = await Promise.all([
    getSimulatorOrderById(orderId),
    getColaboradorById(jwt.id),
  ]);

  if (!order) {
    return NextResponse.json({ ok: false, message: "Pedido não encontrado." }, { status: 404 });
  }

  const colab = colabFromDb ?? {
    id: jwt.id,
    nome: jwt.nome,
    funcao: jwt.funcao ?? null,
    isAdmin: jwt.isAdmin ?? 0,
    active: 1 as number | null,
  };

  // Apenas pedidos sem assistente podem ser recusados
  if (order.assignedToId) {
    return NextResponse.json(
      { ok: false, message: "Este pedido já foi aceite por outro colaborador." },
      { status: 409 }
    );
  }

  try {
    await recusarPedido(orderId, colab.id);
  } catch (err) {
    return NextResponse.json(
      { ok: false, message: `Erro ao recusar pedido: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }

  await appendOrderHistory(orderId, {
    type: "declined",
    by: { id: colab.id, nome: colab.nome, role: colab.funcao ?? "colaborador" },
    message: `Pedido recusado por ${colab.nome}. Permanece disponível na fila para outros.`,
  });

  return NextResponse.json({
    ok: true,
    message: "Pedido recusado com sucesso.",
  });
}
