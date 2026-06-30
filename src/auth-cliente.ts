/**
 * Configuração do NextAuth v4 para clientes do site público clyon.pt.
 * Separado do auth.ts de colaboradores — qualquer email Google é aceite;
 * a conta é criada automaticamente na primeira sessão.
 *
 * Rota: /api/auth/cliente/[...nextauth]
 *
 * Variáveis de ambiente (partilhadas com colaboradores):
 *   NEXTAUTH_SECRET        — openssl rand -base64 32
 *   GOOGLE_CLIENT_ID       — Google Cloud Console → OAuth 2.0
 *   GOOGLE_CLIENT_SECRET   — Google Cloud Console → OAuth 2.0
 */

import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptionsCliente: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,

  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID     ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],

  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
  },

  pages: {
    signIn: "/entrar",
    error:  "/entrar",
  },

  session: { strategy: "jwt" },
};
