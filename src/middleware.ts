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

  // 2. URLs permanentemente removidas - retornar 410 Gone
  const goneUrls = ["/credito-fiscal"];
  if (goneUrls.includes(nextUrl.pathname)) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="pt-PT">
<head>
  <meta charset="UTF-8">
  <meta name="robots" content="noindex">
  <title>Página Removida | CLYON</title>
  <style>
    body { font-family: system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
    .container { text-align: center; padding: 2rem; }
    h1 { color: #0f172a; font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #64748b; margin-bottom: 1.5rem; }
    a { color: #0891b2; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <p style="color: #0891b2; font-size: 0.875rem; font-weight: 600; letter-spacing: 0.1em;">410 - PÁGINA REMOVIDA</p>
    <h1>Esta página foi permanentemente removida</h1>
    <p>O conteúdo que procura já não está disponível.</p>
    <a href="/">← Voltar à página inicial</a>
  </div>
</body>
</html>`,
      {
        status: 410,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Robots-Tag": "noindex",
        },
      }
    );
  }

  // 3. Redirects de URLs antigas e deprecated
  if (nextUrl.pathname === "/contato") {
    return NextResponse.redirect(new URL("/contactos", request.url), 301);
  }

  if (nextUrl.pathname === "/avaliacoes-clientes") {
    return NextResponse.redirect(new URL("/avaliacoes", request.url), 301);
  }

  if (nextUrl.pathname === "/central-ajuda") {
    return NextResponse.redirect(new URL("/faq", request.url), 301);
  }

  // 4. Redirect URLs com cedilha "mudanças" para versão sem acento "mudancas"
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
