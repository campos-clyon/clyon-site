"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle, ArrowRight, Lock, CreditCard, Smartphone, Building } from "lucide-react";

import { trackWhatsAppClick, trackPhoneCall } from "@/lib/analytics";
import { BUSINESS_INSTAGRAM, BUSINESS_PHONE, BUSINESS_EMAIL } from "@/lib/seo-data";

export default function Footer() {
  const anoAtual = new Date().getFullYear();
  const telHref = `tel:${BUSINESS_PHONE.replace(/\s+/g, "")}`;
  const numeroWhatsapp = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  return (
    <footer style={{ backgroundColor: "#0f172a", color: "white" }}>
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "64px 24px" }}>
        {/* Desktop Layout */}
        <div className="hidden lg:grid" style={{ display: "grid", gridTemplateColumns: "280px repeat(4, 1fr)", gap: "48px" }}>
          {/* Brand Column with CTA Box */}
          <div style={{ backgroundColor: "#1e293b", borderRadius: "16px", padding: "28px" }}>
            <Link href="/">
              <Image
                src="/logo-clyon-white.webp"
                alt="CLYON"
                width={120}
                height={40}
                style={{ height: "36px", width: "auto", filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p style={{ marginTop: "16px", fontSize: "14px", lineHeight: "1.7", color: "#cbd5e1" }}>
              Recolha e limpeza profissional em Lisboa, Margem Sul e Setúbal com resposta rápida e execução sem stress.
            </p>

            <div style={{ marginTop: "24px", borderTop: "1px solid #334155", paddingTop: "20px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "14px" }}>Pagamentos</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ffffff", fontSize: "14px" }}>
                  <CreditCard style={{ width: "16px", height: "16px", color: "#06b6d4" }} />
                  Revolut
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ffffff", fontSize: "14px" }}>
                  <Smartphone style={{ width: "16px", height: "16px", color: "#06b6d4" }} />
                  MB WAY
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#ffffff", fontSize: "14px" }}>
                  <Building style={{ width: "16px", height: "16px", color: "#06b6d4" }} />
                  Novo Banco
                </div>
              </div>
            </div>
          </div>

          {/* Serviços Column */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "20px" }}>Serviços</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/recolha-de-moveis" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Recolha de Móveis</Link></li>
              <li><Link href="/recolha-de-entulho" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Recolha de Entulho</Link></li>
              <li><Link href="/limpeza-pos-obra" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Limpeza Pós-Obra</Link></li>
              <li><Link href="/esvaziamento-de-casas" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Esvaziamento de Casas</Link></li>
              <li><Link href="/precos" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Preços orientativos</Link></li>
            </ul>
          </div>

          {/* Empresa Column */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "20px" }}>Empresa</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "12px" }}>
              <li><Link href="/sobre-nos" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Sobre nós</Link></li>
              <li><Link href="/faq" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>FAQ</Link></li>
              <li><Link href="/blog" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Blog</Link></li>
              <li><Link href="/contactos" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Contactos</Link></li>
              <li>
                <a href={BUSINESS_INSTAGRAM} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>
                  <Instagram style={{ width: "14px", height: "14px" }} />
                  Instagram
                </a>
              </li>
            </ul>
          </div>

          {/* Cobertura Column */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "20px" }}>Cobertura</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 20px" }}>
              <li><Link href="/recolha-moveis-lisboa" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Lisboa</Link></li>
              <li><Link href="/recolha-moveis-almada" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Almada</Link></li>
              <li><Link href="/recolha-moveis-amadora" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Amadora</Link></li>
              <li><Link href="/recolha-moveis-seixal" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Seixal</Link></li>
              <li><Link href="/recolha-moveis-barreiro" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Barreiro</Link></li>
              <li><Link href="/recolha-moveis-oeiras" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Oeiras</Link></li>
              <li><Link href="/recolha-moveis-cascais" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Cascais</Link></li>
              <li><Link href="/recolha-moveis-setubal" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Setúbal</Link></li>
              <li><Link href="/recolha-moveis-loures" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Loures</Link></li>
              <li><Link href="/recolha-moveis-sintra" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Sintra</Link></li>
              <li><Link href="/recolha-moveis-montijo" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Montijo</Link></li>
              <li><Link href="/recolha-moveis-odivelas" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Odivelas</Link></li>
            </ul>
          </div>

          {/* Contacto Rápido Column */}
          <div>
            <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "20px" }}>Contacto Rápido</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a
                href={urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer-quick")}
                style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#1e293b", padding: "12px 14px", borderRadius: "8px", color: "#ffffff", fontSize: "14px", textDecoration: "none" }}
              >
                <MessageCircle style={{ width: "16px", height: "16px", color: "#10b981" }} />
                WhatsApp direto
              </a>
              <Link
                href="/simulador"
                style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#1e293b", padding: "12px 14px", borderRadius: "8px", color: "#ffffff", fontSize: "14px", textDecoration: "none" }}
              >
                <ArrowRight style={{ width: "16px", height: "16px", color: "#0891b2" }} />
                Pedir orçamento
              </Link>
              <Link
                href="/colaboradores"
                style={{ display: "flex", alignItems: "center", gap: "12px", backgroundColor: "#1e293b", padding: "12px 14px", borderRadius: "8px", color: "#ffffff", fontSize: "14px", textDecoration: "none" }}
              >
                <Lock style={{ width: "16px", height: "16px", color: "#94a3b8" }} />
                Área de colaboradores
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden">
          {/* Brand */}
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <Link href="/">
              <Image
                src="/logo-clyon-white.webp"
                alt="CLYON"
                width={120}
                height={40}
                style={{ height: "36px", width: "auto", margin: "0 auto", filter: "brightness(0) invert(1)" }}
              />
            </Link>
            <p style={{ marginTop: "16px", fontSize: "14px", lineHeight: "1.7", color: "#cbd5e1" }}>
              Recolha e limpeza profissional em Lisboa, Margem Sul e Setúbal.
            </p>
          </div>

          {/* Pagamentos Mobile */}
          <div style={{ marginBottom: "32px" }}>
            <h4 style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "14px" }}>Pagamentos</h4>
            <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff", fontSize: "14px" }}>
                <CreditCard style={{ width: "16px", height: "16px", color: "#06b6d4" }} />
                Revolut
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff", fontSize: "14px" }}>
                <Smartphone style={{ width: "16px", height: "16px", color: "#06b6d4" }} />
                MB WAY
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#ffffff", fontSize: "14px" }}>
                <Building style={{ width: "16px", height: "16px", color: "#06b6d4" }} />
                Novo Banco
              </div>
            </div>
          </div>

          {/* Links Grid Mobile */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
            <div>
              <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "16px" }}>Serviços</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li><Link href="/recolha-de-moveis" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Recolha de Móveis</Link></li>
                <li><Link href="/recolha-de-entulho" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Recolha de Entulho</Link></li>
                <li><Link href="/esvaziamento-de-casas" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Esvaziamento</Link></li>
                <li><Link href="/precos" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Preços</Link></li>
              </ul>
            </div>
            <div>
              <h3 style={{ fontSize: "12px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", marginBottom: "16px" }}>Empresa</h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                <li><Link href="/sobre-nos" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Sobre nós</Link></li>
                <li><Link href="/faq" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>FAQ</Link></li>
                <li><Link href="/contactos" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Contactos</Link></li>
                <li><Link href="/avaliacoes" style={{ color: "#ffffff", fontSize: "14px", textDecoration: "none" }}>Avaliações</Link></li>
              </ul>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #1e293b" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "20px 24px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "space-between", gap: "16px" }} className="sm:flex-row">
          <p style={{ fontSize: "14px", color: "#64748b" }}>
            © CLYON {anoAtual} - Todos os direitos reservados
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "center" }}>
            <Link href="/privacidade" style={{ fontSize: "14px", color: "#64748b", textDecoration: "none" }}>
              Política de Privacidade
            </Link>
            <Link href="/cookies" style={{ fontSize: "14px", color: "#64748b", textDecoration: "none" }}>
              Política de Cookies
            </Link>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("clyon-open-cookie-preferences"));
              }}
              style={{ fontSize: "14px", color: "#64748b", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Gerir cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
