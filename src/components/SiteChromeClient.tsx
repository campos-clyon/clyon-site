"use client";

import { usePathname } from "next/navigation";

import CoverageNotice from "@/components/CoverageNotice";
import DeferredCookieConsent from "@/components/DeferredCookieConsent";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import StickyCTA from "@/components/StickyCTA";

// Rotas de landing de conversão (Google Ads) que não usam o chrome global
const BARE_ROUTES = ["/orcamento-recolha-lisboa"];

// Rotas internas (dashboard) que usam apenas o Header — sem Footer nem StickyCTA
const DASHBOARD_ROUTES = ["/colaboradores", "/simulador", "/conta"];

interface SiteChromeClientProps {
  phone: string;
  children: React.ReactNode;
}

export default function SiteChromeClient({
  phone,
  children,
}: SiteChromeClientProps) {
  const pathname = usePathname();

  const isBare = BARE_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  const isDashboard = DASHBOARD_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (isBare) {
    return <main className="site-page-shell">{children}</main>;
  }

  if (isDashboard) {
    return (
      <>
        <Header phone={phone} />
        <main className="site-page-shell pt-[76px]">{children}</main>
      </>
    );
  }

  return (
    <>
      <Header phone={phone} />
      <main className="site-page-shell pt-[76px]">{children}</main>
      <Footer phone={phone} />
      <StickyCTA phone={phone} />
      <DeferredCookieConsent />
      <CoverageNotice />
    </>
  );
}
