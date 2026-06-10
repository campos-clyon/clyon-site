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

// GET /api/admin/leads — lista de leads com filtros e totais
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const db = await getDb();
    if (!db) return NextResponse.json({ leads: [], totals: {} });

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "30d";
    const status = searchParams.get("status") || "";
    const servico = searchParams.get("servico") || "";
    const localidade = searchParams.get("localidade") || "";
    const origem = searchParams.get("origem") || "";

    // Calcular data de início com base no período
    let startDate: string;
    const now = new Date();
    if (periodo === "hoje") {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    } else if (periodo === "semana") {
      const day = now.getDay();
      const diff = now.getDate() - (day === 0 ? 6 : day - 1);
      startDate = new Date(now.getFullYear(), now.getMonth(), diff).toISOString().slice(0, 10);
    } else if (periodo === "7d") {
      const d = new Date(now); d.setDate(d.getDate() - 7);
      startDate = d.toISOString().slice(0, 10);
    } else if (periodo === "30d") {
      const d = new Date(now); d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    } else {
      const d = new Date(now); d.setDate(d.getDate() - 30);
      startDate = d.toISOString().slice(0, 10);
    }

    // Build dynamic WHERE clauses
    const conditions: string[] = [`createdAt >= '${startDate} 00:00:00'`];
    if (status) conditions.push(`status = '${status.replace(/'/g, "''")}'`);
    if (servico) conditions.push(`tipoServico = '${servico.replace(/'/g, "''")}'`);
    if (localidade) conditions.push(`localidade LIKE '%${localidade.replace(/'/g, "''")}%'`);
    if (origem) conditions.push(`utmSource = '${origem.replace(/'/g, "''")}'`);

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const [leads] = await (db as any).execute(
      `SELECT id, nome, telefone, email, localidade, tipoServico, preferenciaContacto,
              pagePath, utmSource, utmMedium, utmCampaign, gclid, status, notasInternas,
              createdAt
       FROM leads ${where}
       ORDER BY createdAt DESC
       LIMIT 200`
    );

    // Totais
    const hoje = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString().slice(0, 10);
    const semanaStart = (() => {
      const d = new Date(now); const day = d.getDay();
      d.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
      return d.toISOString().slice(0, 10);
    })();

    const [[totals]] = await (db as any).execute(`
      SELECT
        SUM(CASE WHEN DATE(createdAt) = '${hoje}' THEN 1 ELSE 0 END) AS hoje,
        SUM(CASE WHEN createdAt >= '${semanaStart} 00:00:00' THEN 1 ELSE 0 END) AS semana,
        SUM(CASE WHEN status = 'novo' THEN 1 ELSE 0 END) AS novos,
        SUM(CASE WHEN status = 'fechado' THEN 1 ELSE 0 END) AS fechados,
        COUNT(*) AS total
      FROM leads
    `);

    return NextResponse.json({ leads: Array.isArray(leads) ? leads : [], totals });
  } catch (error) {
    console.error("[api/admin/leads] GET error:", error);
    return NextResponse.json({ leads: [], totals: {} });
  }
}

// PATCH /api/admin/leads — atualizar status e notas de um lead
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

    const sets: string[] = [];
    if (status) sets.push(`status = '${status}'`);
    if (notasInternas !== undefined) sets.push(`notasInternas = '${String(notasInternas).replace(/'/g, "''")}'`);
    if (!sets.length) return NextResponse.json({ success: true });

    await (db as any).execute(`UPDATE leads SET ${sets.join(", ")} WHERE id = ${Number(id)}`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/admin/leads] PATCH error:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
