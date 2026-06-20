import { NextRequest, NextResponse } from "next/server";
import {
  createSimulatorOrder,
  assignSimulatorOrder,
  pickLeastLoadedAssistant,
  appendOrderHistory,
  calculateOrderPriority,
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

    const row: InsertSimulatorOrder = {
      serviceType: order.serviceType ?? null,
      description: order.description ?? null,
      filesJson: order.files?.length ? JSON.stringify(order.files) : null,
      address: order.address?.formattedAddress ?? null,
      city: order.city ?? order.address?.city ?? null,
      floor: order.floor ?? null,
      hasElevator: order.hasElevator ?? null,
      parkingDistance: order.parkingDistance ?? null,
      contactName: order.receiver?.name ?? null,
      contactPhone: order.receiver?.phone ?? null,
      contactEmail: order.receiver?.email ?? null,
      urgency: order.urgency ?? null,
      estimateMin: estimate?.estimatedPriceWithoutVat?.toString() ?? null,
      estimateMax: estimate?.estimatedPriceWithVat?.toString() ?? null,
      estimateTotal: estimate?.estimatedPriceWithVat?.toString() ?? null,
      estimateJson: estimate ? JSON.stringify(estimate) : null,
      distanceKm: order.distanceFromBase?.distanceKm?.toString() ?? null,
      distanceText: order.distanceFromBase?.durationText ?? null,
      chatJson: chatHistory ? JSON.stringify(chatHistory) : null,
      priority,
      status: "pendente",
    };

    const id = await createSimulatorOrder(row);

    // Registar no histórico que o pedido foi criado
    await appendOrderHistory(id, {
      type: "created",
      by: null,
      message: `Pedido criado via simulador. Serviço: ${order.serviceType ?? "—"}. Prioridade: ${priority}.`,
    });

    // Atribuição automática ao assistente com menos carga
    const assignee = await pickLeastLoadedAssistant();
    if (assignee) {
      await assignSimulatorOrder(id, assignee, null);
    }

    return NextResponse.json({ ok: true, id, priority, assignedTo: assignee?.nome ?? null });
  } catch (err: any) {
    console.error("[simulador/pedido] Erro ao guardar pedido:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
