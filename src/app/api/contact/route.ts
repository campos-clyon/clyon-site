import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { BUSINESS_EMAIL } from "@/lib/seo-data";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nome, telemovel, localidade, servico, mensagem } = body;

    // Validação básica
    if (!nome || !telemovel || !localidade || !servico) {
      return NextResponse.json(
        { error: "Campos obrigatórios em falta" },
        { status: 400 }
      );
    }

    const emailContent = `
Novo pedido de orçamento recebido através do site CLYON.

DADOS DO CLIENTE:
- Nome: ${nome}
- Telemóvel: ${telemovel}
- Localidade: ${localidade}
- Serviço: ${servico}
${mensagem ? `- Mensagem: ${mensagem}` : ""}

---
Este email foi enviado automaticamente através do formulário de contacto em clyon.pt
    `.trim();

    // Usa o domínio verificado no Resend ou o email de teste
    const fromEmail = process.env.RESEND_FROM_EMAIL || "CLYON Website <onboarding@resend.dev>";
    
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [BUSINESS_EMAIL],
      subject: `Novo pedido: ${servico} em ${localidade}`,
      text: emailContent,
    });

    if (error) {
      console.error("[v0] Resend error:", error);
      return NextResponse.json(
        { error: "Erro ao enviar email" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error("[v0] Contact API error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
