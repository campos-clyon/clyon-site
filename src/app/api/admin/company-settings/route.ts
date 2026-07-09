export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyColaboradorAuthHeader } from "@/lib/colaborador-auth";
import { getCompanySetting, setCompanySetting } from "@/lib/db";
import { BUSINESS_PHONE, BUSINESS_EMAIL, BUSINESS_NAME } from "@/lib/seo-data";

export const runtime = "nodejs";

async function requireAdmin(request: NextRequest) {
  const colaborador = await verifyColaboradorAuthHeader(request.headers.get("authorization"));
  if (!colaborador) return { error: NextResponse.json({ error: "Não autorizado" }, { status: 401 }) };
  if (!colaborador.isAdmin) return { error: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  return { colaborador };
}

// GET /api/admin/company-settings — devolve os dados da empresa
export async function GET(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const [phone, email, name, sector, portal] = await Promise.all([
      getCompanySetting("business_phone", BUSINESS_PHONE),
      getCompanySetting("business_email", BUSINESS_EMAIL),
      getCompanySetting("business_name", BUSINESS_NAME),
      getCompanySetting("business_sector", "Recolha de móveis e serviços de transporte"),
      getCompanySetting("business_portal", "clyon.pt"),
    ]);
    return NextResponse.json({ phone, email, name, sector, portal });
  } catch (err) {
    console.error("[api/admin/company-settings] GET error:", err);
    return NextResponse.json({ error: "Erro ao carregar configurações" }, { status: 500 });
  }
}

// PUT /api/admin/company-settings — grava os dados da empresa
const CompanySettingsSchema = z.object({
  phone: z.string()
    .refine((val) => /^\+\d+$/.test(val.replace(/[\s\-()]/g, "")), "Telefone inválido (deve começar com + e conter apenas dígitos)"),
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome obrigatório"),
  sector: z.string().min(1, "Setor obrigatório"),
  portal: z.string().min(1, "Portal obrigatório"),
});

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin(request);
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const parsed = CompanySettingsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Dados inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    await Promise.all([
      setCompanySetting("business_phone", parsed.data.phone),
      setCompanySetting("business_email", parsed.data.email),
      setCompanySetting("business_name", parsed.data.name),
      setCompanySetting("business_sector", parsed.data.sector),
      setCompanySetting("business_portal", parsed.data.portal),
    ]);

    return NextResponse.json({ success: true, ...parsed.data });
  } catch (err: any) {
    console.error("[api/admin/company-settings] PUT error:", err?.message);
    return NextResponse.json(
      { error: "Erro ao gravar configurações" },
      { status: 500 }
    );
  }
}
