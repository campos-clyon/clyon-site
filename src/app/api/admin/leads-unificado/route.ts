export const dynamic = "force-dynamic";

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
    const estado = searchParams.get("estado") || "enviados"; // "enviados" | "registados"
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const eventTypesEnviados = ['form_submit_contacto', 'form_submit_quero_contratar', 'simulator_order_confirmed', 'simulator_order_saved'];
    const eventTypesRegistados = ['simulator_start', 'simulator_contact', 'simulator_estimate', 'click_whatsapp', 'click_call', 'click_cta', 'click_email'];
    const eventTypesFiltro = estado === "registados" ? eventTypesRegistados : eventTypesEnviados;

    const unificados = await withConnection(async (conn) => {
      let query = "";
      let params: any[] = [];

      if (estado === "registados") {
        // Vista "Registados": só leadEvents
        query = `
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
              WHEN eventType = 'simulator_start' THEN 'simulador'
              WHEN eventType = 'simulator_contact' THEN 'simulador'
              WHEN eventType = 'simulator_estimate' THEN 'simulador'
              WHEN eventType = 'click_whatsapp' THEN 'whatsapp'
              WHEN eventType = 'click_call' THEN 'ligar'
              WHEN eventType = 'click_cta' THEN 'cta'
              WHEN eventType = 'click_email' THEN 'email'
              ELSE eventType
            END AS channel,
            createdAt
          FROM leadEvents
          WHERE createdAt >= ?
            AND eventType IN (${eventTypesFiltro.map(() => '?').join(',')})
          ${canal ? `AND CASE
              WHEN eventType = 'simulator_start' THEN 'simulador'
              WHEN eventType = 'simulator_contact' THEN 'simulador'
              WHEN eventType = 'simulator_estimate' THEN 'simulador'
              WHEN eventType = 'click_whatsapp' THEN 'whatsapp'
              WHEN eventType = 'click_call' THEN 'ligar'
              WHEN eventType = 'click_cta' THEN 'cta'
              WHEN eventType = 'click_email' THEN 'email'
              ELSE eventType
            END = ?` : ""}
          ORDER BY createdAt DESC
          LIMIT 300
        `;
        params = canal ? [startDate, ...eventTypesFiltro, canal] : [startDate, ...eventTypesFiltro];
      } else {
        // Vista "Enviados": UNION das duas tabelas
        query = `
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
              WHEN eventType = 'form_submit_contacto' THEN 'contacto'
              WHEN eventType = 'form_submit_quero_contratar' THEN 'quero_contratar'
              WHEN eventType = 'simulator_order_confirmed' THEN 'simulador'
              WHEN eventType = 'simulator_order_saved' THEN 'simulador'
              ELSE eventType
            END AS channel,
            createdAt
          FROM leadEvents
          WHERE createdAt >= ?
            AND eventType IN (${eventTypesFiltro.map(() => '?').join(',')})
          ${canal ? `AND CASE
              WHEN eventType = 'form_submit_contacto' THEN 'contacto'
              WHEN eventType = 'form_submit_quero_contratar' THEN 'quero_contratar'
              WHEN eventType = 'simulator_order_confirmed' THEN 'simulador'
              WHEN eventType = 'simulator_order_saved' THEN 'simulador'
              ELSE eventType
            END = ?` : ""}
          
          ORDER BY createdAt DESC
          LIMIT 300
        `;
        params = canal ? [startDate, canal, startDate, ...eventTypesFiltro, canal] : [startDate, startDate, ...eventTypesFiltro];
      }

      // UNION das duas tabelas com normalização de campos
      const [rows] = await conn.execute(query, params);

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
