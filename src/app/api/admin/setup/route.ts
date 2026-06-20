import { NextRequest, NextResponse } from "next/server";
import { upsertWandersonAdmin, ensureColaboradoresSchema, ensureSimulatorSettingsTable, ensureGalleryMediaTable, getEffectiveRole, getPool } from "@/lib/db";

export const runtime = "nodejs";

/**
 * POST /api/admin/setup
 *
 * Rota protegida por ADMIN_SETUP_SECRET.
 * Executa migração completa de schema da BD:
 * - Garante colunas na tabela colaboradores
 * - Configura assistentes, motoristas, admins com valores corretos
 * - Garante WANDERSON com isAdmin=1
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
    console.log("[v0] admin/setup: Iniciando migração de esquema...");

    // 1. Garantir schema de colaboradores (adiciona colunas em falta)
    await ensureColaboradoresSchema();
    console.log("[v0] admin/setup: ✓ Esquema colaboradores garantido");

    // 2. Garantir tabelas auxiliares
    await ensureSimulatorSettingsTable();
    console.log("[v0] admin/setup: ✓ Tabela simulatorSettings garantida");

    await ensureGalleryMediaTable();
    console.log("[v0] admin/setup: ✓ Tabela galleryMedia garantida");

    // 3. Configurar valores por função
    const pool = await getPool();
    if (pool) {
      // Assistentes: commission, sem horas, recebem pedidos
      await pool.execute(
        `UPDATE colaboradores 
         SET paymentModel = 'commission', 
             canReceiveSimulatorRequests = 1, 
             participatesInTimeTracking = 0,
             active = 1
         WHERE funcao = 'assistente'`
      ).catch(() => {});
      console.log("[v0] admin/setup: ✓ Assistentes configurados");

      // Motoristas/Ajudantes: hourly, com horas, sem pedidos
      await pool.execute(
        `UPDATE colaboradores 
         SET paymentModel = 'hourly', 
             canReceiveSimulatorRequests = 0, 
             participatesInTimeTracking = 1,
             active = 1
         WHERE funcao IN ('motorista', 'ajudante')`
      ).catch(() => {});
      console.log("[v0] admin/setup: ✓ Motoristas/Ajudantes configurados");

      // Admin: none, sem horas, sem pedidos
      await pool.execute(
        `UPDATE colaboradores 
         SET paymentModel = 'none', 
             canReceiveSimulatorRequests = 0, 
             participatesInTimeTracking = 0,
             active = 1
         WHERE funcao = 'admin' AND isAdmin = 0`
      ).catch(() => {});
      console.log("[v0] admin/setup: ✓ Admins configurados");
    }

    // 4. Garantir que WANDERSON existe e tem isAdmin=1
    const admin = await upsertWandersonAdmin();
    const effectiveRole = getEffectiveRole({ isAdmin: admin.isAdmin, funcao: admin.funcao });
    console.log("[v0] admin/setup: ✓ WANDERSON garantido como admin");

    return NextResponse.json({
      ok: true,
      message: "Setup de admin concluído com sucesso.",
      timestamp: new Date().toISOString(),
      migrations: [
        "Schema colaboradores",
        "Tabela simulatorSettings",
        "Tabela galleryMedia",
        "Configuração de funções",
        "Admin WANDERSON",
      ],
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
