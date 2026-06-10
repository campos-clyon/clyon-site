import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// POST /api/leads/events — registar evento de tracking de lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, pagePath, pageUrl, serviceType, location, contactPreference, utmSource, utmMedium, utmCampaign, gclid } = body;

    if (!eventType) {
      return NextResponse.json({ error: "eventType é obrigatório." }, { status: 400 });
    }

    const db = await getDb();
    if (db) {
      // Garantir que a tabela existe (raw SQL via pool interno — usamos db.execute como fallback)
      try {
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

        await (db as any).execute(
          `INSERT INTO leadEvents (eventType, pagePath, pageUrl, serviceType, location, contactPreference, utmSource, utmMedium, utmCampaign, gclid)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(eventType).slice(0, 80),
            pagePath ? String(pagePath).slice(0, 255) : null,
            pageUrl ? String(pageUrl).slice(0, 500) : null,
            serviceType ? String(serviceType).slice(0, 80) : null,
            location ? String(location).slice(0, 120) : null,
            contactPreference ? String(contactPreference).slice(0, 30) : null,
            utmSource ? String(utmSource).slice(0, 120) : null,
            utmMedium ? String(utmMedium).slice(0, 120) : null,
            utmCampaign ? String(utmCampaign).slice(0, 120) : null,
            gclid ? String(gclid).slice(0, 255) : null,
          ],
        );
      } catch {
        // Silenciar erros de tracking para não bloquear o utilizador
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/leads/events] POST error:", error);
    return NextResponse.json({ success: true });
  }
}
