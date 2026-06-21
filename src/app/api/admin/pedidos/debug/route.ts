import { NextRequest, NextResponse } from "next/server";
import {
  getAllSimulatorOrders,
  getActiveAssistants,
  countActiveOrdersByAssistant,
  getPool,
} from "@/lib/db";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";

export const runtime = "nodejs";

/**
 * Debug endpoint: GET /api/admin/pedidos/debug
 * Only accessible to admin (isAdmin=1)
 * Returns debugging information about simulator orders
 */
export async function GET(req: NextRequest) {
  const colab = await verifyColaboradorAuthHeader(req.headers.get("authorization"));
  if (!colab || colab.isAdmin !== 1) {
    return NextResponse.json({ error: "Admin only" }, { status: 403 });
  }

  try {
    console.log("[v0] DEBUG: Iniciando coleta de dados de debug");

    // Get all simulator orders (últimos 20)
    const allOrders = await getAllSimulatorOrders();
    const recentOrders = allOrders.slice(0, 20);

    // Get active assistants
    const assistants = await getActiveAssistants();

    // Get order counts by assistant
    const counts = countActiveOrdersByAssistant();

    // Get Miriam's ID
    const miriam = assistants.find((a) => a.nome === "Miriam");

    // Get database schema info
    const pool = await getPool();
    let schemaInfo: any = null;
    if (pool) {
      try {
        const [columns] = await pool.execute(
          `SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_KEY
           FROM INFORMATION_SCHEMA.COLUMNS
           WHERE TABLE_NAME = 'simulatorOrders'
           ORDER BY ORDINAL_POSITION`
        ) as any[];
        schemaInfo = columns;
      } catch (e) {
        console.error("[v0] DEBUG: Error getting schema:", e);
      }
    }

    console.log("[v0] DEBUG: Dados coletados com sucesso");

    return NextResponse.json({
      ok: true,
      debug: {
        timestamp: new Date().toISOString(),
        summary: {
          totalOrders: allOrders.length,
          recentOrdersCount: recentOrders.length,
          activeAssistantsCount: assistants.length,
          miriamFound: !!miriam,
          miriamId: miriam?.id ?? null,
        },
        recentOrders: recentOrders.map((o) => ({
          id: o.id,
          contactName: o.contactName,
          serviceType: o.serviceType,
          status: o.status,
          assignedToId: o.assignedToId,
          assignedToName: o.assignedToName,
          createdAt: o.createdAt,
          updatedAt: o.updatedAt,
        })),
        assistants: assistants.map((a) => ({
          id: a.id,
          nome: a.nome,
          funcao: a.funcao,
          isAdmin: a.isAdmin,
        })),
        orderCountsByAssistant: counts,
        miriamOrders: recentOrders.filter((o) => o.assignedToId === miriam?.id),
        pendingOrders: recentOrders.filter((o) => o.status === "pendente"),
        attributedOrders: recentOrders.filter((o) => o.status === "atribuido"),
        schemaColumns: schemaInfo
          ? schemaInfo.map((c: any) => ({
              name: c.COLUMN_NAME,
              type: c.COLUMN_TYPE,
              nullable: c.IS_NULLABLE,
              key: c.COLUMN_KEY,
            }))
          : null,
      },
    });
  } catch (err: any) {
    console.error("[v0] DEBUG: Error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
