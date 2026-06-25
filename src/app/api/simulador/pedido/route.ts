import { NextRequest, NextResponse } from "next/server";
import {
  createSimulatorOrder,
  appendOrderHistory,
  calculateOrderPriority,
} from "@/lib/db";
import type { InsertSimulatorOrder } from "../../../../../drizzle/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    console.log("[v0] POST /api/simulador/pedido: Iniciando...");
    const { order, estimate, chatHistory } = await req.json();
    if (!order) {
      console.log("[v0] POST /api/simulador/pedido: Erro - order ausente");
      return NextResponse.json({ error: "order required" }, { status: 400 });
    }
    console.log("[v0] POST /api/simulador/pedido: Dados recebidos - serviceType=", order.serviceType, ", contactName=", order.receiver?.name);

    const priority = calculateOrderPriority({
      urgency: order.urgency,
      description: order.description,
      estimateTotal: estimate?.estimatedPriceWithVat?.toString() ?? null,
    });
    console.log("[v0] POST /api/simulador/pedido: Prioridade calculada=", priority);

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
    console.log("[v0] POST /api/simulador/pedido: ✓ Pedido #", id, " CRIADO com status 'pendente', insertId=", id, ", tipo=", typeof id);

    // Registar no histórico que o pedido foi criado
    await appendOrderHistory(id, {
      type: "created",
      by: null,
      message: `Pedido criado via simulador. Serviço: ${order.serviceType ?? "—"}. Prioridade: ${priority}.`,
    });
    console.log("[v0] POST /api/simulador/pedido: ✓ Histórico registado para pedido #", id);

    // Pedidos enviados para fila geral (não atribuídos automaticamente)
    // Os assistentes podem aceitar/rejeitar pedidos da fila geral
    console.log("[v0] POST /api/simulador/pedido: ✓ Pedido #", id, " enviado para fila geral - assistentes podem aceitar/rejeitar");
    return NextResponse.json({
      ok: true,
      id,
      priority,
      status: "pendente",
      assignedTo: null,
      assignedToId: null,
      message: `Pedido #${id} enviado para análise geral. Os assistentes podem aceitar ou rejeitar este pedido.`,
    });
  } catch (err: any) {
    console.error("[v0] POST /api/simulador/pedido: ❌ Erro:", err.message, err.stack);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
