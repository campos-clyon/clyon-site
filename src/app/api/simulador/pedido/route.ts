import { NextRequest, NextResponse } from "next/server";
import {
  createSimulatorOrder,
  getSimulatorOrderById,
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

    // ── Sem atribuição automática ─────────────────────────────────────────────
    // Pedidos entram sempre na fila geral. Uma assistente deve aceitar
    // manualmente via POST /api/admin/pedidos/[id]/accept.

    const row: InsertSimulatorOrder = {
      serviceType: order.serviceType || null,
      description: order.description || null,
      filesJson: order.files?.length
        ? JSON.stringify(
            order.files.map((f: Record<string, unknown>) => ({
              id: f.id, name: f.name, size: f.size, type: f.type, mimeType: f.mimeType,
            }))
          )
        : null,
      // Morada principal: para mudança guardamos a origem; para outros o endereço único
      address:
        order.serviceType === "mudanca"
          ? (order.originAddress?.formattedAddress ?? order.address?.formattedAddress ?? null)
          : (order.address?.formattedAddress ?? null),
      city: order.city || order.address?.city || order.originAddress?.city || null,
      // postalCode: não existe como coluna separada na DB — guardado em rawOrderJson
      floor: (() => {
        const v = order.serviceType === "mudanca"
          ? (order.originAccess?.floor ?? order.floor)
          : order.floor;
        return v || null;
      })(),
      // Converter "" para null — alguns clientes submetem string vazia quando não preenchido
      hasElevator: (() => {
        const v = order.serviceType === "mudanca"
          ? (order.originAccess?.hasElevator ?? order.hasElevator)
          : order.hasElevator;
        return v || null;
      })(),
      parkingDistance: (() => {
        const v = order.serviceType === "mudanca"
          ? (order.originAccess?.parkingDistance ?? order.parkingDistance)
          : order.parkingDistance;
        return v || null;
      })(),
      contactName: order.receiver?.name ?? null,
      contactPhone: order.receiver?.phone ?? null,
      contactEmail: order.receiver?.email ?? null,
      urgency: order.urgency || null,
      estimateMin: estimate?.estimatedPriceWithoutVat?.toString() ?? null,
      estimateMax: estimate?.estimatedPriceWithVat?.toString() ?? null,
      estimateTotal: estimate?.estimatedPriceWithVat?.toString() ?? null,
      estimateJson: estimate ? JSON.stringify(estimate) : null,
      // Guardar análise completa incluindo externalMarketEstimate, analysisSource e confidence
      // Este campo é APENAS para uso interno no backoffice — nunca exposto ao cliente
      analysisJsonExtended: estimate
        ? JSON.stringify({
            analysisSource: estimate.analysisSource ?? null,
            confidence: estimate.confidence ?? null,
            clyonEstimate: {
              status: estimate.status,
              estimatedPriceWithoutVat: estimate.estimatedPriceWithoutVat,
              vatAmount: estimate.vatAmount,
              estimatedPriceWithVat: estimate.estimatedPriceWithVat,
              difficultyLevel: estimate.difficultyLevel,
              summary: estimate.summary,
              assumptions: estimate.assumptions,
              missingFields: estimate.missingFields,
              internalNotes: estimate.internalNotes,
              labor: estimate.labor ?? null,
            },
            externalMarketEstimate: estimate.externalMarketEstimate ?? null,
            savedAt: new Date().toISOString(),
          })
        : null,
      distanceKm: (order.movingDistance?.distanceKm ?? order.distanceFromBase?.distanceKm)?.toString() ?? null,
      distanceText: order.movingDistance?.durationText ?? order.distanceFromBase?.durationText ?? null,
      chatJson: chatHistory ? JSON.stringify(chatHistory) : null,
      priority,
      // Sempre sem assistente — fluxo de aceitação manual obrigatório
      status: "sem_assistente",
      assignedToId: null,
      assignedToName: null,
      assignedAt: null,
      // Guardar todo o JSON do formulário para preservar dados de mudança
      // (originAddress, destinationAddress, originAccess, destinationAccess, movingDistance, heavyItems, etc.)
      rawOrderJson: JSON.stringify(order),
    };

    const id = await createSimulatorOrder(row);

    // Confirmação de escrita
    const created = await getSimulatorOrderById(id);
    if (!created) {
      console.error("[v0] POST /api/simulador/pedido: pedido #", id, " não encontrado após INSERT");
      return NextResponse.json(
        { ok: false, error: `Pedido #${id} não encontrado após criação.` },
        { status: 500 }
      );
    }

    // Histórico
    await appendOrderHistory(id, {
      type: "created",
      by: null,
      message: `Pedido criado via simulador. Fila geral (sem assistente). Serviço: ${order.serviceType ?? "—"}. Prioridade: ${priority}.`,
    });

    return NextResponse.json({
      ok: true,
      id: created.id,
      status: created.status,
      priority: created.priority,
      assignedToId: null,
      assignedToName: null,
      createdAt: created.createdAt,
      queue: "general",
      message: "Pedido enviado com sucesso. A equipa CLYON irá analisar e uma assistente aceitará o pedido em breve.",
    });
  } catch (err: any) {
    console.error("[v0] POST /api/simulador/pedido: erro:", err.message);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
