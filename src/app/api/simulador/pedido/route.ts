import { NextRequest, NextResponse } from "next/server";
import {
  createSimulatorOrder,
  updateSimulatorOrder,
  getSimulatorOrderById,
  appendOrderHistory,
  calculateOrderPriority,
  pickLeastLoadedAssistant,
} from "@/lib/db";
import type { InsertSimulatorOrder } from "../../../../../drizzle/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { order, estimate, chatHistory } = await req.json();
    if (!order) {
      return NextResponse.json({ error: "order required" }, { status: 400 });
    }

    const priority = calculateOrderPriority({
      urgency: order.urgency,
      description: order.description,
      estimateTotal: estimate?.estimatedPriceWithVat?.toString() ?? null,
    });

    // ── Atribuição automática: assistente com menos pedidos activos ────────
    const assigned = await pickLeastLoadedAssistant();
    console.log("[v0] POST /api/simulador/pedido: pickLeastLoadedAssistant =", assigned ? `${assigned.nome} (id=${assigned.id})` : "null — fila geral");

    const row: InsertSimulatorOrder = {
      serviceType: order.serviceType ?? null,
      description: order.description ?? null,
      filesJson: order.files?.length
        ? JSON.stringify(
            order.files.map((f: Record<string, unknown>) => ({
              id: f.id, name: f.name, size: f.size, type: f.type, mimeType: f.mimeType,
            }))
          )
        : null,
      // Morada: mudança tem origem/destino; outros serviços têm morada única
      address:
        order.serviceType === "mudanca"
          ? (order.originAddress?.formattedAddress ?? order.address?.formattedAddress ?? null)
          : (order.address?.formattedAddress ?? null),
      city: order.city ?? order.address?.city ?? order.originAddress?.city ?? null,
      floor: order.serviceType === "mudanca"
        ? (order.originAccess?.floor ?? order.floor ?? null)
        : (order.floor ?? null),
      hasElevator: order.serviceType === "mudanca"
        ? (order.originAccess?.hasElevator ?? order.hasElevator ?? null)
        : (order.hasElevator ?? null),
      parkingDistance: order.serviceType === "mudanca"
        ? (order.originAccess?.parkingDistance ?? order.parkingDistance ?? null)
        : (order.parkingDistance ?? null),
      contactName: order.receiver?.name ?? null,
      contactPhone: order.receiver?.phone ?? null,
      contactEmail: order.receiver?.email ?? null,
      urgency: order.urgency ?? null,
      estimateMin: estimate?.estimatedPriceWithoutVat?.toString() ?? null,
      estimateMax: estimate?.estimatedPriceWithVat?.toString() ?? null,
      estimateTotal: estimate?.estimatedPriceWithVat?.toString() ?? null,
      estimateJson: estimate ? JSON.stringify(estimate) : null,
      distanceKm: (order.movingDistance?.distanceKm ?? order.distanceFromBase?.distanceKm)?.toString() ?? null,
      distanceText: order.movingDistance?.durationText ?? order.distanceFromBase?.durationText ?? null,
      chatJson: chatHistory ? JSON.stringify(chatHistory) : null,
      priority,
      status: assigned ? "atribuido" : "sem_assistente",
      assignedToId: assigned?.id ?? null,
      assignedToName: assigned?.nome ?? null,
      assignedAt: assigned ? new Date() : null,
    };

    const id = await createSimulatorOrder(row);

    // ── Confirmação de escrita: garantir que a linha existe antes de retornar sucesso
    const created = await getSimulatorOrderById(id);
    if (!created) {
      console.error("[v0] POST /api/simulador/pedido: ❌ Pedido #", id, " não encontrado após INSERT — possível falha de escrita na BD.");
      return NextResponse.json(
        { ok: false, error: `Pedido #${id} não encontrado após criação — erro de escrita na BD.` },
        { status: 500 }
      );
    }
    console.log("[v0] POST /api/simulador/pedido: ✓ Confirmado na BD — id=", created.id, "status=", created.status, "assignedToId=", created.assignedToId, "assignedToName=", created.assignedToName);

    // Histórico
    await appendOrderHistory(id, {
      type: "created",
      by: null,
      message: assigned
        ? `Pedido criado via simulador e atribuído automaticamente a ${assigned.nome}. Serviço: ${order.serviceType ?? "—"}. Prioridade: ${priority}.`
        : `Pedido criado via simulador. Fila geral. Serviço: ${order.serviceType ?? "—"}. Prioridade: ${priority}.`,
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      status: created.status,
      priority: created.priority,
      assignedToId: created.assignedToId ?? null,
      assignedToName: created.assignedToName ?? null,
      createdAt: created.createdAt,
      queue: assigned ? "assigned" : "general",
    });
  } catch (err: any) {
    console.error("[v0] POST /api/simulador/pedido: ❌ Erro:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
