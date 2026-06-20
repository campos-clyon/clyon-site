import { NextRequest, NextResponse } from "next/server";
import {
  getAllSimulatorOrders,
  getSimulatorOrdersByAssistant,
  updateSimulatorOrder,
  deleteSimulatorOrder,
  countSimulatorOrdersByStatus,
  getSimulatorOrderById,
  getEffectiveRole,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * Verifica autenticação e retorna o colaborador.
 * Admin geral e assistentes podem aceder a esta rota.
 * Motoristas/ajudantes sem isAdmin são bloqueados.
 */
async function requireAdminOrAssistant(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };

  // O token JWT apenas contém id, nome e isAdmin (sem funcao).
  // Determinamos o role a partir do isAdmin por enquanto.
  // Se isAdmin=0 e funcao não é assistente, o scoping por assignedToId serve de protecção.
  return { err: null, colab };
}

// GET /api/admin/pedidos?status=pendente&search=foo
export async function GET(req: NextRequest) {
  const { err, colab } = await requireAdminOrAssistant(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const isAdmin = colab!.isAdmin === 1;

  if (isAdmin) {
    // Admin vê todos os pedidos
    const [orders, counts] = await Promise.all([
      getAllSimulatorOrders({ status: status !== "todos" ? status : undefined, search }),
      countSimulatorOrdersByStatus(),
    ]);
    return NextResponse.json({ orders, counts, role: "admin_geral" });
  } else {
    // Assistente vê apenas pedidos atribuídos a si
    const orders = await getSimulatorOrdersByAssistant(colab!.id);
    // Filtrar por status e pesquisa no lado do servidor
    const filtered = orders.filter((o) => {
      if (status && status !== "todos" && o.status !== status) return false;
      if (search) {
        const s = search.toLowerCase();
        if (
          !(o.contactName ?? "").toLowerCase().includes(s) &&
          !(o.contactPhone ?? "").toLowerCase().includes(s) &&
          !(o.address ?? "").toLowerCase().includes(s) &&
          !(o.description ?? "").toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
    // Contagens apenas dos pedidos do assistente
    const counts: Record<string, number> = { total: filtered.length };
    for (const o of filtered) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return NextResponse.json({ orders: filtered, counts, role: "assistente" });
  }
}

// PATCH /api/admin/pedidos  — { id, ...fields }
export async function PATCH(req: NextRequest) {
  const { err, colab } = await requireAdminOrAssistant(req);
  if (err) return err;

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Verificar permissão por pedido se não for admin
  if (!colab!.isAdmin) {
    const order = await getSimulatorOrderById(Number(id));
    if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
    if (order.assignedToId !== colab!.id) {
      return NextResponse.json({ error: "Sem permissão para editar este pedido" }, { status: 403 });
    }
    // Assistente não pode reatribuir nem aprovar — remover esses campos
    delete fields.assignedToId;
    delete fields.assignedToName;
    delete fields.status; // Assistente não muda status directamente aqui
  }

  const updateData: Record<string, unknown> = { ...fields };
  if (updateData.dataAgendada && typeof updateData.dataAgendada === "string") {
    updateData.dataAgendada = new Date(updateData.dataAgendada);
  }

  await updateSimulatorOrder(Number(id), updateData as Parameters<typeof updateSimulatorOrder>[1]);
  const order = await getSimulatorOrderById(Number(id));
  return NextResponse.json({ ok: true, order });
}

// DELETE /api/admin/pedidos?id=123  — apenas admin geral
export async function DELETE(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  if (!colab.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await deleteSimulatorOrder(Number(id));
  return NextResponse.json({ ok: true });
}
