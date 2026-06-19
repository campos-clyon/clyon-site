import { NextRequest, NextResponse } from "next/server";
import {
  getAllSimulatorOrders,
  updateSimulatorOrder,
  deleteSimulatorOrder,
  countSimulatorOrdersByStatus,
  getSimulatorOrderById,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

async function requireAdmin(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  if (!colab.isAdmin) return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  return null; // null = ok
}

// GET /api/admin/pedidos?status=pendente&search=foo
export async function GET(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;

  const [orders, counts] = await Promise.all([
    getAllSimulatorOrders({ status: status !== "todos" ? status : undefined, search }),
    countSimulatorOrdersByStatus(),
  ]);

  return NextResponse.json({ orders, counts });
}

// PATCH /api/admin/pedidos  — { id, ...fields }
export async function PATCH(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const body = await req.json();
  const { id, ...fields } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updateData: Record<string, unknown> = { ...fields };
  if (updateData.dataAgendada && typeof updateData.dataAgendada === "string") {
    updateData.dataAgendada = new Date(updateData.dataAgendada);
  }

  await updateSimulatorOrder(Number(id), updateData as Parameters<typeof updateSimulatorOrder>[1]);
  const order = await getSimulatorOrderById(Number(id));
  return NextResponse.json({ ok: true, order });
}

// DELETE /api/admin/pedidos?id=123
export async function DELETE(req: NextRequest) {
  const err = await requireAdmin(req);
  if (err) return err;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await deleteSimulatorOrder(Number(id));
  return NextResponse.json({ ok: true });
}
