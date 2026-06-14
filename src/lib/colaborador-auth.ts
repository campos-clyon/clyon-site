import * as jose from "jose";

export type ColaboradorTokenPayload = {
  id: number;
  nome: string;
  isAdmin: number;
};

// JWT_SECRET DEVE ter >= 32 caracteres para HS256 (jose requer isto)
// Definir JWT_SECRET no Vercel com: openssl rand -base64 32
const JWT_SECRET = process.env.JWT_SECRET || "clyon-dashboard-secret-2026-xk9p";

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
