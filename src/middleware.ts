import { NextResponse, type NextRequest } from "next/server";

const CANONICAL_HOST = "clyon.pt";

// URLs de mudanças fracas que devem redirecionar para /mudancas
const WEAK_MUDANCAS_CITIES = [
  "alcochete",
  "sintra",
  "montijo",
  "carnaxide",
  "oeiras",
  "corroios",
  "barreiro",
  "palmela",
];

export function middleware(request: NextRequest) {
  const { nextUrl, headers } = request;
  const host = headers.get("host") ?? nextUrl.host;
  const forwardedProto = headers.get("x-forwarded-proto") ?? nextUrl.protocol.replace(":", "");

  if (host !== CANONICAL_HOST || forwardedProto !== "https") {
    const redirectUrl = new URL(request.url);
    redirectUrl.protocol = "https:";
    redirectUrl.host = CANONICAL_HOST;
    return NextResponse.redirect(redirectUrl, 308);
  }

  if (nextUrl.pathname === "/contacto") {
    const redirectUrl = new URL("/contactos", request.url);
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Redirect mudanças fracas para /mudancas
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
