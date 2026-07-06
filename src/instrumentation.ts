/**
 * Next.js Instrumentation Hook — corre uma vez no arranque do servidor.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 * 
 * NOTE: Schema migrations disabled to prevent build timeouts.
 * Railway DB occasionally closes connections during Vercel builds.
 * Schema is now ensured lazily on first database request instead.
 */
export async function register() {
  // Instrumentation disabled — schema migrations now happen on first request
}
