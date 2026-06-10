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

function getPeriodStart(periodo: string): string {
  const now = new Date();
  if (periodo === "hoje") return `${now.toISOString().slice(0, 10)} 00:00:00`;
  if (periodo === "semana") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1;
    const d = new Date(now);
    d.setDate(d.getDate() - diff);
    return `${d.toISOString().slice(0, 10)} 00:00:00`;
  }
  if (periodo === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return `${d.toISOString().slice(0, 10)} 00:00:00`;
  }
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return `${d.toISOString().slice(0, 10)} 00:00:00`;
}

// GET /api/admin/lead-events
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  console.log("[api/admin/lead-events] GET chamado");

  try {
    const db = await getDb();
    if (!db) {
      console.error("[api/admin/lead-events] Base de dados indisponível");
      return NextResponse.json({ events: [], totals: {}, error: "Base de dados indisponível" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "7d";
    const eventType = searchParams.get("eventType") || "";
    const startDate = getPeriodStart(periodo);
    const hoje = new Date().toISOString().slice(0, 10);

    // Garantir que a tabela leadEvents existe (nome consistente com o que está na BD)
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

    const conditions: string[] = ["createdAt >= ?"];
    const params: unknown[] = [startDate];
    if (eventType) {
      conditions.push("eventType = ?");
      params.push(eventType);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const [events] = await (db as any).execute(
      `SELECT id, eventType, pagePath, serviceType, location, contactPreference,
              utmSource, utmMedium, utmCampaign, createdAt
       FROM leadEvents ${where}
       ORDER BY createdAt DESC
       LIMIT 500`,
      params,
    );

    // Totais por tipo de evento hoje
    const [[totals]] = await (db as any).execute(
      `SELECT
        SUM(CASE WHEN eventType LIKE '%whatsapp%' AND DATE(createdAt) = ? THEN 1 ELSE 0 END) AS whatsappHoje,
        SUM(CASE WHEN (eventType LIKE '%call%' OR eventType LIKE '%ligar%') AND DATE(createdAt) = ? THEN 1 ELSE 0 END) AS ligarHoje,
        SUM(CASE WHEN eventType LIKE '%quero_contratar%' AND DATE(createdAt) = ? THEN 1 ELSE 0 END) AS ctaHoje,
        SUM(CASE WHEN eventType LIKE '%form_submit%' AND DATE(createdAt) = ? THEN 1 ELSE 0 END) AS formHoje,
        SUM(CASE WHEN eventType LIKE '%email%' AND DATE(createdAt) = ? THEN 1 ELSE 0 END) AS emailHoje,
        COUNT(*) AS total
       FROM leadEvents`,
      [hoje, hoje, hoje, hoje, hoje],
    );

    const eventsArr = Array.isArray(events) ? events : [];
    console.log("[api/admin/lead-events] Devolvidos:", eventsArr.length, "eventos. Totais hoje:", totals);

    return NextResponse.json({ events: eventsArr, totals });
  } catch (error) {
    console.error("[api/admin/lead-events] GET error:", error);
    return NextResponse.json({ events: [], totals: {}, error: "Erro ao carregar eventos" }, { status: 500 });
  }
}
