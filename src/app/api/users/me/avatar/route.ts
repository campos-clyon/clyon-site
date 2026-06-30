import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { put } from "@vercel/blob";
import { authOptionsCliente } from "@/auth-cliente";
import { getPool } from "@/lib/db";

/**
 * POST /api/users/me/avatar
 * Recebe um FormData com um campo "file" (imagem já cortada em PNG),
 * faz upload para o Vercel Blob e actualiza avatarUrl na DB.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || !file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Ficheiro inválido." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ficheiro demasiado grande (máx. 5MB)." }, { status: 400 });
    }

    // Gerar nome único para o blob
    const ext = file.type === "image/png" ? "png" : "jpg";
    const filename = `avatars/${session.user.email.replace(/[^a-z0-9]/gi, "_")}_${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      contentType: file.type,
    });

    // Actualizar avatarUrl na DB
    const pool = await getPool();
    if (!pool) throw new Error("Pool não disponível");
    await pool.execute(
      "UPDATE users SET avatarUrl = ?, updatedAt = NOW() WHERE email = ? AND deletedAt IS NULL",
      [blob.url, session.user.email],
    );

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("[api/users/me/avatar] POST:", err);
    return NextResponse.json({ error: "Erro ao fazer upload." }, { status: 500 });
  }
}
