import { NextRequest, NextResponse } from "next/server";
import { createSimulatorOrder } from "@/lib/db";
import type { InsertSimulatorOrder } from "../../../../../drizzle/schema";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { order, estimate } = await req.json();
    if (!order) {
      return NextResponse.json({ error: "order required" }, { status: 400 });
    }

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
      estimateMin: estimate?.minPrice?.toString() ?? null,
      estimateMax: estimate?.maxPrice?.toString() ?? null,
      estimateTotal: estimate?.totalWithTax?.toString() ?? estimate?.total?.toString() ?? null,
      estimateJson: estimate ? JSON.stringify(estimate) : null,
      distanceKm: order.distance?.distanceKm?.toString() ?? null,
      distanceText: order.distance?.durationText ?? null,
      status: "pendente",
    };

    const id = await createSimulatorOrder(row);
    return NextResponse.json({ ok: true, id });
  } catch (err: any) {
    console.error("[simulador/pedido] Erro ao guardar pedido:", err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
