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
 * Admin geral (isAdmin=1) e assistentes (funcao='assistente') podem aceder.
 * Motoristas/ajudantes são explicitamente bloqueados.
 */
async function requireAdminOrAssistant(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return { err: NextResponse.json({ error: "Não autorizado" }, { status: 401 }), colab: null };

  // Admin geral passa sempre
  if (colab.isAdmin === 1) return { err: null, colab };

  // Assistente passa (funcao no JWT, ou fallback: deixar entrar com scoping)
  const funcao = colab.funcao ?? "";
  if (funcao === "assistente") return { err: null, colab };

  // Motorista/ajudante/admin sem isAdmin=1 — bloqueado
  return {
    err: NextResponse.json({ error: "Acesso negado. Esta área é restrita a administradores e assistentes." }, { status: 403 }),
    colab: null,
  };
}

// GET /api/admin/pedidos?status=pendente&search=foo
export async function GET(req: NextRequest) {
  const { err, colab } = await requireAdminOrAssistant(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const isAdmin = colab!.isAdmin === 1;
  console.log("[v0] GET /api/admin/pedidos: Utilizador=", colab!.nome, ", isAdmin=", isAdmin, ", status filter=", status, ", search=", search);

  if (isAdmin) {
    // Admin vê todos os pedidos
    console.log("[v0] GET /api/admin/pedidos: Admin - carregando TODOS os pedidos");
    const [orders, counts] = await Promise.all([
      getAllSimulatorOrders({ status: status !== "todos" ? status : undefined, search }),
      countSimulatorOrdersByStatus(),
    ]);
    console.log("[v0] GET /api/admin/pedidos: Admin - pedidos carregados:", orders.length, "contadores:", counts);
    return NextResponse.json({ orders, counts, role: "admin_geral" });
  } else {
    // Assistente vê apenas pedidos atribuídos a si
    console.log("[v0] GET /api/admin/pedidos: Assistente (id=", colab!.id, ") - carregando seus pedidos");
    const orders = await getSimulatorOrdersByAssistant(colab!.id);
    console.log("[v0] GET /api/admin/pedidos: Assistente - pedidos encontrados:", orders.length);
    
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
    console.log("[v0] GET /api/admin/pedidos: Assistente - após filtro:", filtered.length);
    
    // Contagens apenas dos pedidos do assistente
    const counts: Record<string, number> = {};
    for (const o of filtered) counts[o.status] = (counts[o.status] ?? 0) + 1;
    // "total" explícito para compatibilidade com o frontend
    counts["total"] = filtered.length;
    // "pendente" = não visualizados (viewedAt IS NULL) no subset do assistente
    counts["pendente"] = filtered.filter((o) => !o.viewedAt).length;
    // "sem_assistente" = sem assignedToId no subset
    counts["sem_assistente"] = filtered.filter((o) => !o.assignedToId).length;
    console.log("[v0] GET /api/admin/pedidos: Assistente - contadores:", counts);
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
