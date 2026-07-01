import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptionsCliente } from "@/auth-cliente";
import { withConnection, ensureUsersSchema } from "@/lib/db";

/**
 * POST /api/users/me/avatar
 * Recebe um FormData com um campo "file" (imagem já cortada em PNG),
 * faz upload para o Vercel Blob e actualiza avatarUrl na DB via upsert.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Normalizar email (mesmo padrão do GET/PATCH)
  const emailNorm = session.user.email.trim().toLowerCase();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Ficheiro inválido." }, { status: 400 });
    }
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 5MB)." }, { status: 400 });
    }

    // Garantir que a tabela e colunas existem
    await ensureUsersSchema();

    // Upload para Vercel Blob
    const ext = file.type === "image/png" ? "png" : "jpg";
    const filename = `avatars/${emailNorm.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${ext}`;
    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    // Upsert: actualiza se já existe, cria se não existe
    await withConnection(async (conn) => {
      const [result] = await conn.execute(
        `INSERT INTO users (email, openId, avatarUrl, loginMethod, role, createdAt, updatedAt)
         VALUES (?, NULL, ?, 'google', 'user', NOW(), NOW())
         ON DUPLICATE KEY UPDATE avatarUrl = VALUES(avatarUrl), updatedAt = NOW()`,
        [emailNorm, blob.url],
      ) as [{ affectedRows: number }, unknown];
      console.log(`[avatar] upsert ok — affectedRows=${result.affectedRows} email=${emailNorm}`);
    });

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[api/users/me/avatar] POST erro:", err);
    return NextResponse.json({ error: "Erro ao fazer upload." }, { status: 500 });
  }
}
