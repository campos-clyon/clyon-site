import NextAuth from "next-auth";
import { authOptionsCliente } from "@/auth-cliente";

// NextAuth v4 com basePath customizado: forçar NEXTAUTH_URL para o prefixo
// correto ANTES de criar o handler, para que o provider construa o redirect URI
// como https://clyon.pt/api/auth/cliente/callback/google e não /api/auth/callback/google.
// O Google Cloud Console deve ter registado AMBOS os redirect URIs:
//   - https://clyon.pt/api/auth/callback/google          (colaboradores)
//   - https://clyon.pt/api/auth/cliente/callback/google  (clientes)
const clienteBaseUrl = `${process.env.NEXTAUTH_URL ?? "https://clyon.pt"}/api/auth/cliente`;

const handler = NextAuth(authOptionsCliente);

// Exportar wrappers que injetam o basePath no env antes de processar
async function GET(req: Request, ctx: unknown) {
  process.env.NEXTAUTH_URL_INTERNAL = clienteBaseUrl;
  return handler(req as never, ctx as never);
}
async function POST(req: Request, ctx: unknown) {
  process.env.NEXTAUTH_URL_INTERNAL = clienteBaseUrl;
  return handler(req as never, ctx as never);
}

export { GET, POST };
