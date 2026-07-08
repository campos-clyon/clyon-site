import { NextRequest, NextResponse } from "next/server";
import {
  getSimulatorOrderById,
  updateSimulatorOrder,
  appendOrderHistory,
  getColaboradorById,
  toMySQLDateTime,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * POST /api/admin/pedidos/[id]/cancel
 *
 * Permite cancelar um pedido (apenas admins e assistentes com permissão).
 * Regras:
 *   - JWT válido obrigatório.
 *   - Pedido não pode estar em estado terminal (cancelado, concluído, arquivado, etc).
 *   - Atualiza status para "cancelado" e adiciona motivo ao histórico.
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

  // Ler body com motivo (opcional)
  let reason = "Cancelado pelo utilizador";
  try {
    const body = await req.json() as { reason?: string };
    if (body.reason) reason = body.reason;
  } catch {
    // body vazio ou JSON inválido — usar motivo padrão
  }

  const [order, colabFromDb] = await Promise.all([
    getSimulatorOrderById(orderId),
    getColaboradorById(jwt.id),
  ]);

  if (!order) {
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

  // Apenas admins podem cancelar (restricção de segurança)
  if (!isAdmin) {
    return NextResponse.json(
      { ok: false, message: "Apenas administradores podem cancelar pedidos." },
      { status: 403 }
    );
  }

  // Não permitir cancelamento de pedidos em estado terminal
  const terminalStatuses = ["cancelado", "concluido", "arquivado", "rejeitado"];
  if (terminalStatuses.includes(order.status)) {
    return NextResponse.json(
      { ok: false, message: `Pedido com status "${order.status}" não pode ser cancelado.` },
      { status: 409 }
    );
  }

  // Formato MySQL DATETIME: 'YYYY-MM-DD HH:mm:ss'
  const nowMySQL = toMySQLDateTime();

  try {
    await updateSimulatorOrder(orderId, {
      status: "cancelado",
      cancelledAt: nowMySQL,
      cancelladoPeloCliente: 0,
    });
  } catch (updateErr) {
    return NextResponse.json(
      { ok: false, message: `Erro ao actualizar pedido: ${updateErr instanceof Error ? updateErr.message : String(updateErr)}` },
      { status: 500 }
    );
  }

  await appendOrderHistory(orderId, {
    type: "cancelled",
    by: { id: colab.id, nome: colab.nome, role: colab.funcao ?? "admin" },
    message: `Pedido cancelado por ${colab.nome}. Motivo: ${reason}`,
  });

  const updated = await getSimulatorOrderById(orderId);

  return NextResponse.json({
    ok: true,
    message: "Pedido cancelado com sucesso.",
    order: updated,
  });
}
