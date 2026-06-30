/**
 * Configuração do NextAuth v4 para colaboradores CLYON.
 *
 * Fluxo:
 *   1. Colaborador clica "Entrar com Google" em /colaboradores/entrar
 *   2. Google redireciona de volta com o email autenticado
 *   3. O callback signIn verifica se o email existe na tabela `colaboradores` (ativo=1)
 *   4. Se não existir → retorna URL de erro → redireciona para /colaboradores/entrar?erro=nao_autorizado
 *   5. Se existir → sessão criada → redireciona para /colaboradores/dashboard
 *
 * Variáveis de ambiente necessárias (adicionar no Vercel → Settings → Vars):
 *   NEXTAUTH_SECRET      — openssl rand -base64 32
 *   NEXTAUTH_URL         — https://clyon.pt (em produção) ou http://localhost:3000 (local)
 *   GOOGLE_CLIENT_ID     — Google Cloud Console → Credenciais → OAuth 2.0
 *   GOOGLE_CLIENT_SECRET — Google Cloud Console → Credenciais → OAuth 2.0
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getPool } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID  ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async signIn({ user, account: _account, profile: _profile, email: _email, credentials: _credentials }) {
      // Este handler serve APENAS colaboradores (/api/auth/[...nextauth]).
      // O handler de clientes está em /api/auth/cliente/[...nextauth] (auth-cliente.ts).
      const email = user.email;
      if (!email) return false;

      try {
        const pool = await getPool();
        if (!pool) {
          console.error("[auth] Pool MySQL não disponível — bloqueando login de colaborador");
          return false;
        }
        const [rows] = await pool.execute(
          "SELECT id FROM colaboradores WHERE email = ? AND ativo = 1 LIMIT 1",
          [email],
        ) as [Array<{ id: number }>, unknown];

        if (rows.length === 0) {
          return "/colaboradores/entrar?erro=nao_autorizado";
        }
        return true;
      } catch (err) {
        console.error("[auth] Erro ao verificar colaborador no signIn:", err);
        return false;
      }
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },

    async redirect({ url, baseUrl }) {
      // Após login bem-sucedido de colaborador → ir para /colaboradores/admin
      if (url.startsWith(baseUrl)) return url;
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      return `${baseUrl}/colaboradores/admin`;
    },
  },

  pages: {
    signIn: "/colaboradores/entrar",
    error:  "/colaboradores/entrar",
  },

  session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
