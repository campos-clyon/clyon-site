import { NextRequest, NextResponse } from "next/server";
import { upsertWandersonAdmin, ensureColaboradoresEnum, getEffectiveRole } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/admin/setup
 *
 * Rota protegida por ADMIN_SETUP_SECRET.
 * Garante que WANDERSON existe com isAdmin=1 e que o enum funcao suporta 'assistente'.
 *
 * Uso:
 *   curl -X POST https://<dominio>/api/admin/setup \
 *     -H "x-admin-setup-secret: <ADMIN_SETUP_SECRET>"
 */
export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SETUP_SECRET;

  // Se a variável não estiver definida, a rota está desactivada
  if (!secret || secret.trim() === "") {
    return NextResponse.json(
      { error: "Setup não configurado. Defina ADMIN_SETUP_SECRET nas variáveis de ambiente." },
      { status: 503 }
    );
  }

  const provided = req.headers.get("x-admin-setup-secret");
  if (provided !== secret) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  try {
    // 1. Garantir que o enum aceita 'assistente'
    await ensureColaboradoresEnum();

    // 2. Garantir que WANDERSON existe e tem isAdmin=1
    const admin = await upsertWandersonAdmin();

    const effectiveRole = getEffectiveRole({ isAdmin: admin.isAdmin, funcao: admin.funcao });

    return NextResponse.json({
      ok: true,
      message: "Setup de admin concluído com sucesso.",
      admin: {
        nome: admin.nome,
        isAdmin: admin.isAdmin === 1,
        effectiveRole,
      },
    });
  } catch (err) {
    console.error("[setup] Erro:", err);
    return NextResponse.json(
      { error: "Erro interno ao executar setup.", detail: String(err) },
      { status: 500 }
    );
  }
}

// Bloquear todos os outros métodos
export async function GET() {
  return NextResponse.json({ error: "Método não permitido. Use POST." }, { status: 405 });
}
