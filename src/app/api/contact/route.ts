import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { BUSINESS_EMAIL } from "@/lib/seo-data";

const resend = new Resend(process.env.RESEND_API_KEY_clyonsite);

export async function POST(request: NextRequest) {
  try {
    // Verificar se a API key está configurada
    if (!process.env.RESEND_API_KEY_clyonsite) {
      console.error("[v0] RESEND_API_KEY_clyonsite não está configurada");
      return NextResponse.json(
        { error: "Configuração de email em falta" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { nome, telemovel, endereco, servico, mensagem } = body;

    // Validação básica
    if (!nome || !telemovel || !endereco || !servico) {
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
- Endereço: ${endereco}
- Serviço: ${servico}
${mensagem ? `- Mensagem: ${mensagem}` : ""}

---
Este email foi enviado automaticamente através do formulário de contacto em clyon.pt
    `.trim();

    const { data, error } = await resend.emails.send({
      from: "CLYON Website <noreply@clyon.pt>",
      to: [BUSINESS_EMAIL],
      subject: `Novo pedido: ${servico} - ${endereco}`,
      text: emailContent,
    });

    if (error) {
      console.error("[v0] Resend error:", JSON.stringify(error, null, 2));
      return NextResponse.json(
        { error: `Erro ao enviar email: ${error.message || "unknown"}` },
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
