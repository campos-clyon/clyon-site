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

// Calcular data de início dado um período (hora de Lisboa UTC+1)
function getPeriodStart(periodo: string): string {
  // Usar UTC. Lisboa é UTC+1 (UTC+2 no verão) mas para simplicidade usamos UTC.
  const now = new Date();
  if (periodo === "hoje") {
    return `${now.toISOString().slice(0, 10)} 00:00:00`;
  }
  if (periodo === "semana") {
    const day = now.getDay();
    const diff = day === 0 ? 6 : day - 1; // Segunda-feira
    const d = new Date(now);
    d.setDate(d.getDate() - diff);
    return `${d.toISOString().slice(0, 10)} 00:00:00`;
  }
  if (periodo === "7d") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    return `${d.toISOString().slice(0, 10)} 00:00:00`;
  }
  // 30d (default)
  const d = new Date(now);
  d.setDate(d.getDate() - 30);
  return `${d.toISOString().slice(0, 10)} 00:00:00`;
}

// GET /api/admin/leads
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  console.log("[api/admin/leads] GET chamado");

  try {
    const db = await getDb();
    if (!db) {
      console.error("[api/admin/leads] Base de dados indisponível");
      return NextResponse.json({ leads: [], totals: {}, error: "Base de dados indisponível" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30d";
    const status = searchParams.get("status") || "";
    const startDate = getPeriodStart(periodo);

    const hoje = new Date().toISOString().slice(0, 10);
    const semanaStart = getPeriodStart("semana");

    // Garantir que a tabela existe
    await (db as any).execute(`
      CREATE TABLE IF NOT EXISTS leads (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        nome varchar(160) NOT NULL,
        telefone varchar(30) NOT NULL,
        email varchar(320) NOT NULL,
        localidade varchar(120) NOT NULL,
        tipoServico varchar(80) NOT NULL,
        preferenciaContacto varchar(30) NOT NULL,
        mensagem text NULL,
        pagePath varchar(255) NULL,
        pageUrl varchar(500) NULL,
        utmSource varchar(120) NULL,
        utmMedium varchar(120) NULL,
        utmCampaign varchar(120) NULL,
        gclid varchar(255) NULL,
        status varchar(30) NOT NULL DEFAULT 'novo',
        notasInternas text NULL,
        createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // Construir query parametrizada
    const conditions: string[] = ["createdAt >= ?"];
    const params: unknown[] = [startDate];
    if (status) {
      conditions.push("status = ?");
      params.push(status);
    }
    const where = `WHERE ${conditions.join(" AND ")}`;

    const [leads] = await (db as any).execute(
      `SELECT id, nome, telefone, email, localidade, tipoServico, preferenciaContacto,
              pagePath, utmSource, utmMedium, utmCampaign, gclid, status, notasInternas,
              createdAt
       FROM leads ${where}
       ORDER BY createdAt DESC
       LIMIT 200`,
      params,
    );

    const [[totals]] = await (db as any).execute(
      `SELECT
        SUM(CASE WHEN DATE(createdAt) = ? THEN 1 ELSE 0 END) AS hoje,
        SUM(CASE WHEN createdAt >= ? THEN 1 ELSE 0 END) AS semana,
        SUM(CASE WHEN status = 'novo' THEN 1 ELSE 0 END) AS novos,
        SUM(CASE WHEN status = 'fechado' THEN 1 ELSE 0 END) AS fechados,
        COUNT(*) AS total
       FROM leads`,
      [hoje, semanaStart],
    );

    const leadsArr = Array.isArray(leads) ? leads : [];
    console.log("[api/admin/leads] Devolvidos:", leadsArr.length, "leads. Totais:", totals);

    return NextResponse.json({ leads: leadsArr, totals });
  } catch (error) {
    console.error("[api/admin/leads] GET error:", error);
    return NextResponse.json({ leads: [], totals: {}, error: "Erro ao carregar leads" }, { status: 500 });
  }
}

// PATCH /api/admin/leads
export async function PATCH(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const { id, status, notasInternas } = await request.json();
    if (!id) return NextResponse.json({ error: "id é obrigatório" }, { status: 400 });

    const validStatuses = ["novo", "contactado", "orcamento_enviado", "fechado", "perdido"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido" }, { status: 400 });
    }

    const db = await getDb();
    if (!db) return NextResponse.json({ error: "DB indisponível" }, { status: 503 });

    // Usar queries parametrizadas
    if (status && notasInternas !== undefined) {
      await (db as any).execute(
        "UPDATE leads SET status = ?, notasInternas = ? WHERE id = ?",
        [status, String(notasInternas), Number(id)],
      );
    } else if (status) {
      await (db as any).execute("UPDATE leads SET status = ? WHERE id = ?", [status, Number(id)]);
    } else if (notasInternas !== undefined) {
      await (db as any).execute("UPDATE leads SET notasInternas = ? WHERE id = ?", [String(notasInternas), Number(id)]);
    }

    console.log("[api/admin/leads] Lead atualizado:", id, status);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/leads] PATCH error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
