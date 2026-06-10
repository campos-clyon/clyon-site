import { NextRequest, NextResponse } from "next/server";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest) {
  const colaborador = await verifyColaboradorAuthHeader(request.headers.get("authorization"));
  if (!colaborador) return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  if (!colaborador.isAdmin) return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  return { colaborador };
}

// GET /api/admin/lead-events — eventos de contacto com filtros e totais
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ events: [], totals: {} });

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "7d";
    const eventType = searchParams.get("eventType") || "";
    const canal = searchParams.get("canal") || "";

    const now = new Date();
    let startDate: string;
    if (periodo === "hoje") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    } else if (periodo === "semana") {
      const day = now.getDay();
      const diff = now.getDate() - (day === 0 ? 6 : day - 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff).toISOString().slice(0, 10);
    } else if (periodo === "7d") {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    } else {
      const d = new Date(now); d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    }

    const conditions: string[] = [`createdAt >= '${startDate} 00:00:00'`];
    if (eventType) conditions.push(`eventType = '${eventType.replace(/'/g, "''")}'`);
    if (canal) conditions.push(`contactPreference = '${canal.replace(/'/g, "''")}'`);

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    // Garantir tabela existe
    await (db as any).execute(`
      CREATE TABLE IF NOT EXISTS leadEvents (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        eventType varchar(80) NOT NULL,
        pagePath varchar(255) NULL,
        pageUrl varchar(500) NULL,
        serviceType varchar(80) NULL,
        location varchar(120) NULL,
        contactPreference varchar(30) NULL,
        utmSource varchar(120) NULL,
        utmMedium varchar(120) NULL,
        utmCampaign varchar(120) NULL,
        gclid varchar(255) NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const [events] = await (db as any).execute(
      `SELECT id, eventType, pagePath, serviceType, location, contactPreference,
              utmSource, utmMedium, utmCampaign, createdAt
       FROM leadEvents ${where}
       ORDER BY createdAt DESC
       LIMIT 300`
    );

    // Totais por tipo de evento
    const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    const [[totals]] = await (db as any).execute(`
      SELECT
        SUM(CASE WHEN eventType LIKE '%whatsapp%' AND DATE(createdAt) = '${hoje}' THEN 1 ELSE 0 END) AS whatsappHoje,
        SUM(CASE WHEN (eventType LIKE '%call%' OR eventType LIKE '%ligar%') AND DATE(createdAt) = '${hoje}' THEN 1 ELSE 0 END) AS ligarHoje,
        SUM(CASE WHEN eventType LIKE '%quero_contratar%' AND DATE(createdAt) = '${hoje}' THEN 1 ELSE 0 END) AS ctaHoje,
        SUM(CASE WHEN (eventType LIKE '%form_submit%') AND DATE(createdAt) = '${hoje}' THEN 1 ELSE 0 END) AS formHoje,
        SUM(CASE WHEN eventType LIKE '%email%' AND DATE(createdAt) = '${hoje}' THEN 1 ELSE 0 END) AS emailHoje,
        COUNT(*) AS total
      FROM leadEvents
    `);

    return NextResponse.json({ events: Array.isArray(events) ? events : [], totals });
  } catch (error) {
    console.error("[api/admin/lead-events] GET error:", error);
    return NextResponse.json({ events: [], totals: {} });
  }
}
