import { NextRequest, NextResponse } from "next/server";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";
import { withConnection } from "@/lib/db";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest) {
  const colaborador = await verifyColaboradorAuthHeader(request.headers.get("authorization"));
  if (!colaborador) return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  if (!colaborador.isAdmin) return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  return { colaborador };
}

export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { searchParams } = new URL(request.url);
    const canal = searchParams.get("canal") || "";
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const unificados = await withConnection(async (conn) => {
      // UNION das duas tabelas com normalização de campos
      const [rows] = await conn.execute(`
        SELECT
          'lead' AS tipo,
          id,
          nome AS name,
          telefone AS phone,
          email,
          localidade AS location,
          tipoServico AS serviceType,
          status,
          origem AS channel,
          createdAt
        FROM leads
        WHERE createdAt >= ?
        ${canal ? "AND canal = ?" : ""}
        
        UNION ALL
        
        SELECT
          'event' AS tipo,
          id,
          name,
          phone,
          email,
          location,
          serviceType,
          'registado' AS status,
          CASE
            WHEN eventType = 'click_whatsapp' THEN 'whatsapp'
            WHEN eventType = 'click_call' THEN 'ligar'
            WHEN eventType = 'click_email' THEN 'email'
            WHEN eventType = 'click_cta' THEN 'cta'
            WHEN action = 'simulador_started' THEN 'simulador'
            ELSE eventType
          END AS channel,
          createdAt
        FROM leadEvents
        WHERE createdAt >= ?
        ${canal ? "AND CASE WHEN eventType = 'click_whatsapp' THEN 'whatsapp' WHEN eventType = 'click_call' THEN 'ligar' WHEN eventType = 'click_email' THEN 'email' WHEN eventType = 'click_cta' THEN 'cta' WHEN action = 'simulador_started' THEN 'simulador' ELSE eventType END = ?" : ""}
        
        ORDER BY createdAt DESC
        LIMIT 300
      `, canal ? [startDate, canal, startDate, canal] : [startDate, startDate]);

      return rows || [];
    });

    return NextResponse.json({ unificados });
  } catch (error) {
    console.error("[api/admin/leads-unificado] GET error:", error);
    return NextResponse.json(
      { unificados: [], error: "Erro ao carregar leads unificados" },
      { status: 500 }
    );
  }
}
