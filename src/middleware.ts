import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "clyon.pt";

// Todas as cidades de mudanças que devem redirecionar para /mudancas
// (exceto lisboa que é especial e fica em /mudancas-lisboa)
const WEAK_MUDANCAS_CITIES = [
  "alcochete",
  "sintra",
  "montijo",
  "carnaxide",
  "oeiras",
  "corroios",
  "barreiro",
  "palmela",
  "odivelas",
  "lumiar",
  "sesimbra",
  "costa-da-caparica",
];

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const host = headers.get("host") ?? nextUrl.host;
  const forwardedProto = headers.get("x-forwarded-proto") ?? nextUrl.protocol.replace(":", "");

  // 1. Força HTTPS e sem www (redirect to canonical domain)
  if (host !== CANONICAL_HOST || forwardedProto !== "https") {
    const redirectUrl = new URL(request.url);
    redirectUrl.protocol = "https:";
    redirectUrl.host = CANONICAL_HOST;
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 2. Redirects de URLs antigas e deprecated
  if (nextUrl.pathname === "/contato") {
    return NextResponse.redirect(new URL("/contactos", request.url), 301);
  }

  if (nextUrl.pathname === "/avaliacoes-clientes") {
    return NextResponse.redirect(new URL("/avaliacoes", request.url), 301);
  }

  if (nextUrl.pathname === "/credito-fiscal") {
    return NextResponse.redirect(new URL("/contactos", request.url), 301);
  }

  if (nextUrl.pathname === "/central-ajuda") {
    return NextResponse.redirect(new URL("/faq", request.url), 301);
  }

  // 3. Redirect URLs com cedilha "mudanças" para versão sem acento "mudancas"
  if (nextUrl.pathname.includes("mudan%C3%A7as") || nextUrl.pathname.includes("mudanças")) {
    const decodedPath = decodeURIComponent(nextUrl.pathname);
    
    // /mudanças-lisboa → /mudancas-lisboa
    if (decodedPath === "/mudanças-lisboa") {
      return NextResponse.redirect(new URL("/mudancas-lisboa", request.url), 301);
    }
    
    // /mudanças (sem cidade) → /mudancas
    if (decodedPath === "/mudanças") {
      return NextResponse.redirect(new URL("/mudancas", request.url), 301);
    }
    
    // /mudanças-[qualquer cidade] → /mudancas
    if (decodedPath.startsWith("/mudanças-")) {
      return NextResponse.redirect(new URL("/mudancas", request.url), 301);
    }
  }

  // 4. Redirect mudanças fracas (sem cedilha) para /mudancas
  if (nextUrl.pathname.startsWith("/mudancas-")) {
    const city = nextUrl.pathname.substring(10); // Remove "/mudancas-"
    if (WEAK_MUDANCAS_CITIES.includes(city)) {
      return NextResponse.redirect(new URL("/mudancas", request.url), 301);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)",
  ],
};
