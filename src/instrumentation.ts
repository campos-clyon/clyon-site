/**
 * Next.js Instrumentation Hook — corre uma vez no arranque do servidor.
 * Usa-se para executar migrações de schema antes de qualquer request HTTP.
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Só correr no Node.js (não no Edge runtime)
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { ensureUsersSchema } = await import("@/lib/db");
      await ensureUsersSchema();
    } catch (err) {
      // Não bloquear o arranque se a migração falhar
      console.error("[instrumentation] ensureUsersSchema falhou:", err);
    }
  }
}
