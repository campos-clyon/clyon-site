import * as jose from "jose";

export type ColaboradorTokenPayload = {
  id: number;
  nome: string;
  isAdmin: number;
  /** Funcao do colaborador — colocada no JWT pelo login route */
  funcao?: string;
};

// JWT_SECRET DEVE ter >= 32 caracteres para HS256 (jose requer isto).
// Gerar com: openssl rand -base64 32
// Adicionar como variável de ambiente JWT_SECRET no Vercel.
if (!process.env.JWT_SECRET) {
  throw new Error(
    "[colaborador-auth] JWT_SECRET não está definido. " +
    "Adicione JWT_SECRET às variáveis de ambiente (openssl rand -base64 32).",
  );
}
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Fonte única de verdade para o segredo JWT dos colaboradores.
 * Garante que assinatura (login) e verificação usam exatamente a mesma chave.
 */
export function getColaboradorSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export async function verifyColaboradorToken(token?: string | null) {
  if (!token) return null;

  try {
    const { payload } = await jose.jwtVerify(token, getColaboradorSecretKey());
    return payload as unknown as ColaboradorTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyColaboradorAuthHeader(authHeader?: string | null) {
  const token = authHeader?.replace("Bearer ", "") ?? null;
  return verifyColaboradorToken(token);
}
