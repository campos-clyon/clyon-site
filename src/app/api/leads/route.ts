import { NextRequest, NextResponse } from "next/server";
import { createLead, createLeadEvent, getAllLeads, updateLeadStatus } from "@/lib/db";

// POST /api/leads — criar novo lead
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("[api/leads] POST recebido:", body?.nome, body?.tipoServico, body?.localidade);

    const { nome, telefone, email, localidade, tipoServico, preferenciaContacto, mensagem, pagePath, pageUrl, utmSource, utmMedium, utmCampaign, gclid } = body;

    // Validação dos campos obrigatórios
    if (!nome || !telefone || !email || !localidade || !tipoServico || !preferenciaContacto) {
      return NextResponse.json({ error: "Campos obrigatórios em falta." }, { status: 400 });
    }

    if (typeof email === "string" && !email.includes("@")) {
      return NextResponse.json({ error: "Email inválido." }, { status: 400 });
    }

    await createLead({
      nome: String(nome).slice(0, 160),
      telefone: String(telefone).slice(0, 30),
      email: String(email).slice(0, 320),
      localidade: String(localidade).slice(0, 120),
      tipoServico: String(tipoServico).slice(0, 80),
      preferenciaContacto: String(preferenciaContacto).slice(0, 30),
      mensagem: mensagem ? String(mensagem) : null,
      pagePath: pagePath ? String(pagePath).slice(0, 255) : null,
      pageUrl: pageUrl ? String(pageUrl).slice(0, 500) : null,
      utmSource: utmSource ? String(utmSource).slice(0, 120) : null,
      utmMedium: utmMedium ? String(utmMedium).slice(0, 120) : null,
      utmCampaign: utmCampaign ? String(utmCampaign).slice(0, 120) : null,
      gclid: gclid ? String(gclid).slice(0, 255) : null,
    });

    // Gravar evento de formulário submetido (garante contagem no dashboard mesmo que o cliente falhe)
    void createLeadEvent({
      eventType: "form_submit_quero_contratar",
      pagePath: pagePath ? String(pagePath).slice(0, 255) : null,
      serviceType: tipoServico ? String(tipoServico).slice(0, 80) : null,
      location: localidade ? String(localidade).slice(0, 120) : null,
      contactPreference: preferenciaContacto ? String(preferenciaContacto).slice(0, 30) : null,
      utmSource: utmSource ? String(utmSource).slice(0, 120) : null,
      utmMedium: utmMedium ? String(utmMedium).slice(0, 120) : null,
      utmCampaign: utmCampaign ? String(utmCampaign).slice(0, 120) : null,
      gclid: gclid ? String(gclid).slice(0, 255) : null,
    }).catch((e) => console.error("[api/leads] Erro ao criar evento form_submit:", e));

    console.log("[api/leads] Lead criado com sucesso:", String(nome));
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[api/leads] POST error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

// GET /api/leads — listar leads (apenas para uso interno/admin)
export async function GET() {
  try {
    const items = await getAllLeads();
    return NextResponse.json({ leads: items });
  } catch (error) {
    console.error("[api/leads] GET error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}

// PATCH /api/leads — atualizar status de um lead
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, notasInternas } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "id e status são obrigatórios." }, { status: 400 });
    }

    const validStatuses = ["novo", "contactado", "fechado", "perdido"] as const;
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Status inválido." }, { status: 400 });
    }

    await updateLeadStatus(Number(id), status, notasInternas);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[api/leads] PATCH error:", error);
    return NextResponse.json({ error: "Erro interno do servidor." }, { status: 500 });
  }
}
