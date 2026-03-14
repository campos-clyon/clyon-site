import * as jose from "jose";

export type ColaboradorTokenPayload = {
  id: number;
  nome: string;
  isAdmin: number;
};

const JWT_SECRET = process.env.JWT_SECRET || "clyon-secret-2026";

export async function verifyColaboradorToken(token?: string | null) {
  if (!token) return null;

  try {
    const secretKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secretKey);
    return payload as unknown as ColaboradorTokenPayload;
  } catch {
    return null;
  }
}

export async function verifyColaboradorAuthHeader(authHeader?: string | null) {
  const token = authHeader?.replace("Bearer ", "") ?? null;
  return verifyColaboradorToken(token);
}
