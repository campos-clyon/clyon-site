"use client";

import Link from "next/link";
import Image from "next/image";
import { Instagram, MessageCircle, Phone, Mail, MapPin } from "lucide-react";

import { trackWhatsAppClick, trackPhoneCall } from "@/lib/analytics";
import { BUSINESS_INSTAGRAM, BUSINESS_PHONE, BUSINESS_EMAIL } from "@/lib/seo-data";

export default function Footer() {
  const anoAtual = new Date().getFullYear();
  const telHref = `tel:${BUSINESS_PHONE.replace(/\s+/g, "")}`;
  const numeroWhatsapp = BUSINESS_PHONE.replace(/[^\d]/g, "");
  const urlWhatsapp = `https://wa.me/${numeroWhatsapp}?text=${encodeURIComponent("Olá! Gostava de pedir um orçamento à CLYON.")}`;

  return (
    <footer style={{ backgroundColor: "#0f172a", color: "white" }}>
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/">
              <Image
                src="/logo-clyon-icon.webp"
                alt="CLYON"
                width={160}
                height={56}
                className="h-12 w-auto brightness-0 invert"
              />
            </Link>
            <p style={{ marginTop: "1.25rem", maxWidth: "224px", fontSize: "0.875rem", lineHeight: "1.5", color: "#cbd5e1" }}>
              Recolha de móveis, entulho, esvaziamentos e mudanças em Lisboa, Margem Sul e Setúbal. Resposta rápida e orçamento grátis.
            </p>

            <div style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <a
                href={telHref}
                onClick={() => trackPhoneCall("footer")}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "white", textDecoration: "none" }}
              >
                <Phone style={{ height: "1rem", width: "1rem", color: "#06b6d4" }} />
                <span>+351 934 748 005</span>
              </a>
              <a
                href={`mailto:${BUSINESS_EMAIL}`}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", fontSize: "0.875rem", color: "white", textDecoration: "none" }}
              >
                <Mail style={{ height: "1rem", width: "1rem", color: "#06b6d4" }} />
                <span>geral@clyon.pt</span>
              </a>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem", fontSize: "0.875rem", color: "white" }}>
                <MapPin style={{ marginTop: "0.125rem", height: "1rem", width: "1rem", flexShrink: 0, color: "#06b6d4" }} />
                <span>Belverde, Amora, 2845-513</span>
              </div>
            </div>

            <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
              <a
                href={urlWhatsapp}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick("footer")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#10b981",
                  padding: "0.625rem 1rem",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "white",
                  textDecoration: "none",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#059669"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#10b981"}
              >
                <MessageCircle style={{ height: "1rem", width: "1rem" }} />
                WhatsApp
              </a>
              <a
                href={BUSINESS_INSTAGRAM}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "2.5rem",
                  width: "2.5rem",
                  borderRadius: "0.5rem",
                  backgroundColor: "#1e293b",
                  color: "#cbd5e1",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#334155";
                  e.currentTarget.style.color = "white";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1e293b";
                  e.currentTarget.style.color = "#cbd5e1";
                }}
                aria-label="Instagram"
              >
                <Instagram style={{ height: "1.25rem", width: "1.25rem" }} />
              </a>
            </div>
          </div>

          {/* Serviços Column */}
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "white" }}>
              Serviços
            </h3>
            <ul style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              <li>
                <Link href="/recolha-de-moveis" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Recolha de Móveis
                </Link>
              </li>
              <li>
                <Link href="/recolha-de-entulho" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Recolha de Entulho
                </Link>
              </li>
              <li>
                <Link href="/esvaziamento-de-casas" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Esvaziamento de Casas
                </Link>
              </li>
              <li>
                <Link href="/limpeza-pos-obra" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Limpeza Pós-Obra
                </Link>
              </li>
              <li>
                <Link href="/mudancas" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Mudanças
                </Link>
              </li>
              <li>
                <Link href="/precos" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Preços
                </Link>
              </li>
            </ul>
          </div>

          {/* Regiões Column */}
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "white" }}>
              Regiões
            </h3>
            <ul style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              <li>
                <Link href="/recolha-moveis-lisboa" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Lisboa
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-almada" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Almada
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-seixal" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Seixal
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-setubal" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Setúbal
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-cascais" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Cascais
                </Link>
              </li>
              <li>
                <Link href="/recolha-moveis-amadora" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Amadora
                </Link>
              </li>
            </ul>
          </div>

          {/* Empresa Column */}
          <div>
            <h3 style={{ fontSize: "0.875rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", color: "white" }}>
              Empresa
            </h3>
            <ul style={{ marginTop: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", listStyle: "none", padding: 0 }}>
              <li>
                <Link href="/sobre-nos" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link href="/trabalhos" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Trabalhos
                </Link>
              </li>
              <li>
                <Link href="/avaliacoes" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Avaliações
                </Link>
              </li>
              <li>
                <Link href="/blog" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/faq" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contactos" style={{ fontSize: "0.875rem", color: "white", textDecoration: "none" }}>
                  Contactos
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div style={{ borderTop: "1px solid #1e293b" }}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row sm:px-6 lg:px-8">
          <p style={{ fontSize: "0.875rem", color: "#64748b" }}>
            © {anoAtual} CLYON. Todos os direitos reservados.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "center", gap: "1.5rem" }}>
            <Link href="/privacidade" style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none" }}>
              Privacidade
            </Link>
            <Link href="/cookies" style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none" }}>
              Cookies
            </Link>
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("clyon-open-cookie-preferences"));
              }}
              style={{ fontSize: "0.875rem", color: "#64748b", textDecoration: "none", background: "none", border: "none", cursor: "pointer", padding: 0 }}
            >
              Gerir cookies
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
