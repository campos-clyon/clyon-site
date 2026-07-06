/**
 * src/lib/notify-client.ts
 * Notificações ao cliente quando o estado do pedido muda.
 * Respeita preferências de notificação: email + WhatsApp.
 */

import { Resend } from "resend";
import { sendWhatsAppMessage } from "./whatsapp";
import { withConnection } from "./db";

const STATUS_MESSAGES: Record<string, string> = {
  aprovado:   "O seu pedido foi aprovado! Vamos entrar em contacto para agendar.",
  agendado:   "O seu serviço foi agendado. Consulte os detalhes na sua conta CLYON.",
  confirmado: "O seu agendamento foi confirmado.",
  em_curso:   "A nossa equipa está a caminho / a executar o seu serviço.",
  concluido:  "O seu serviço foi concluído. Obrigado por confiar na CLYON!",
  cancelado:  "O seu pedido foi cancelado. Contacte-nos se tiver dúvidas.",
};

export async function notifyClientStatusChange(params: {
  orderId: number;
  contactEmail: string | null;
  contactName: string | null;
  contactPhone: string | null;
  newStatus: string;
}): Promise<void> {
  const mensagem = STATUS_MESSAGES[params.newStatus];
  if (!mensagem || !params.contactEmail) return;

  try {
    const emailNorm = params.contactEmail.trim().toLowerCase();
    const prefs = await withConnection(async (conn) => {
      const [rows] = await conn.execute(
        "SELECT notifOrderStatus, notifWhatsapp, phone FROM users WHERE LOWER(TRIM(email)) = ? LIMIT 1",
        [emailNorm],
      ) as [Array<{ notifOrderStatus: number; notifWhatsapp: number; phone: string | null }>, unknown];
      return rows[0];
    });
    if (!prefs) return;

    if (prefs.notifOrderStatus) {
      const apiKey = process.env.RESEND_API_KEY_clyonsite;
      if (apiKey) {
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: "CLYON <noreply@clyon.pt>",
          to: [params.contactEmail],
          subject: `Atualização do seu pedido #${params.orderId} — CLYON`,
          html: `<p>Olá ${params.contactName ?? ""},</p><p>${mensagem}</p><p>Consulte os detalhes em <a href="https://clyon.pt/conta">clyon.pt/conta</a>.</p>`,
        }).catch((e) => console.error("[notify-client] erro email:", e));
      }
    }

    if (prefs.notifWhatsapp && (prefs.phone || params.contactPhone)) {
      const phone = (prefs.phone || params.contactPhone || "").replace(/[^\d]/g, "");
      if (phone) {
        void sendWhatsAppMessage({ to: phone, text: `CLYON — Pedido #${params.orderId}: ${mensagem}` });
      }
    }
  } catch (err) {
    console.error("[notify-client] erro ao notificar cliente:", err);
  }
}
