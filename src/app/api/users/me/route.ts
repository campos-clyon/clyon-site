import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptionsCliente } from "@/auth-cliente";
import { withConnection, ensureUsersSchema } from "@/lib/db";

// Row returned from DB
interface UserRow {
  id: number;
  name: string | null;
  email: string;
  openId: string | null;
  phone: string | null;
  addressLine: string | null;
  addressNumber: string | null;
  postalCode: string | null;
  addressCity: string | null;
  nif: string | null;
  billingName: string | null;
  billingNif: string | null;
  billingAddress: string | null;
  billingPostalCode: string | null;
  billingCity: string | null;
  avatarUrl: string | null;
  notifOrderStatus: number;
  notifWeeklyDigest: number;
  notifWhatsapp: number;
  createdAt: string;
}

async function getOrCreateUser(email: string, name: string | null): Promise<UserRow> {
  // Normalizar email para lowercase para evitar duplicados por case (ex: Google OAuth)
  const normalizedEmail = email.trim().toLowerCase();

  return withConnection(async (conn) => {
    // Procurar por email exacto (normalizado) ou por variante case-insensitive
    const [rows] = await conn.execute(
      "SELECT * FROM users WHERE LOWER(email) = ? AND deletedAt IS NULL ORDER BY createdAt ASC LIMIT 1",
      [normalizedEmail],
    ) as [UserRow[], unknown];

    if (rows.length > 0) {
      // Se o email na DB não está em lowercase, normalizar agora
      if (rows[0].email !== normalizedEmail) {
        await conn.execute(
          "UPDATE users SET email = ?, updatedAt = NOW() WHERE id = ?",
          [normalizedEmail, rows[0].id],
        );
        rows[0].email = normalizedEmail;
        console.log(`[api/users/me] email normalizado para lowercase: id=${rows[0].id}`);
      }
      return rows[0];
    }

    // Criar utilizador novo com email em lowercase
    await conn.execute(
      `INSERT INTO users (name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
       VALUES (?, ?, 'google', 'user', NOW(), NOW(), NOW())`,
      [name ?? normalizedEmail.split("@")[0], normalizedEmail],
    );

    const [newRows] = await conn.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [normalizedEmail],
    ) as [UserRow[], unknown];

    console.log(`[api/users/me] novo utilizador criado: id=${newRows[0]?.id} email=${normalizedEmail}`);
    return newRows[0];
  });
}

// GET /api/users/me
export async function GET() {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Garantir colunas (idempotente, usa withConnection internamente)
  await ensureUsersSchema();

  const emailNorm = session.user.email.trim().toLowerCase();

  try {
    const user = await getOrCreateUser(emailNorm, session.user.name ?? null);
    console.log(`[api/users/me] GET ok — id=${user?.id} email=${emailNorm}`);
    return NextResponse.json({ user }, {
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("[api/users/me] GET erro:", err);
    return NextResponse.json({ error: "Erro ao carregar dados." }, { status: 500 });
  }
}

const PatchSchema = z.object({
  name:              z.string().min(1).max(160).optional(),
  phone:             z.string().max(30).optional().nullable(),
  addressLine:       z.string().max(255).optional().nullable(),
  addressNumber:     z.string().max(20).optional().nullable(),
  postalCode:        z.string().max(20).optional().nullable(),
  addressCity:       z.string().max(120).optional().nullable(),
  nif:               z.string().max(20).optional().nullable(),
  billingName:       z.string().max(160).optional().nullable(),
  billingNif:        z.string().max(20).optional().nullable(),
  billingAddress:    z.string().max(255).optional().nullable(),
  billingPostalCode: z.string().max(20).optional().nullable(),
  billingCity:       z.string().max(120).optional().nullable(),
  avatarUrl:         z.string().max(1024).optional().nullable(),
  notifOrderStatus:  z.boolean().optional(),
  notifWeeklyDigest: z.boolean().optional(),
  notifWhatsapp:     z.boolean().optional(),
});

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  // Garantir colunas antes de escrever
  await ensureUsersSchema();

  const raw = await request.json();
  const parsed = PatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const setClauses: string[] = ["updatedAt = NOW()"];
  const values: unknown[] = [];

  const strFields = [
    "name", "phone", "addressLine", "addressNumber", "postalCode", "addressCity",
    "nif", "billingName", "billingNif", "billingAddress", "billingPostalCode",
    "billingCity", "avatarUrl",
  ] as const;
  const boolFields = ["notifOrderStatus", "notifWeeklyDigest", "notifWhatsapp"] as const;

  for (const f of strFields) {
    if (f in data) { setClauses.push(`${f} = ?`); values.push(data[f] ?? null); }
  }
  for (const f of boolFields) {
    if (f in data) { setClauses.push(`${f} = ?`); values.push(data[f] ? 1 : 0); }
  }

  // Se não há nada para actualizar além do timestamp, retornar cedo
  if (setClauses.length === 1) {
    return NextResponse.json({ success: true });
  }

  // Normalizar email para garantir que o WHERE casa com a linha criada pelo GET
  const userEmail = session.user.email.trim().toLowerCase();

  try {
    return await withConnection(async (conn) => {
      // Verificar unicidade do telefone
      if (data.phone) {
        const [phoneRows] = await conn.execute(
          "SELECT id FROM users WHERE phone = ? AND LOWER(email) <> ? AND deletedAt IS NULL LIMIT 1",
          [data.phone, userEmail],
        ) as [Array<{ id: number }>, unknown];
        if (phoneRows.length > 0) {
          return NextResponse.json(
            { error: "Este número de telefone já está associado a outra conta.", field: "phone" },
            { status: 409 },
          );
        }
      }

      const queryValues = [...values, userEmail];
      const [result] = await conn.execute(
        `UPDATE users SET ${setClauses.join(", ")} WHERE LOWER(email) = ? AND deletedAt IS NULL`,
        queryValues,
      ) as [{ affectedRows: number; changedRows: number }, unknown];

      // Se affectedRows for 0, o UPDATE não encontrou a linha — erro crítico
      if (result.affectedRows === 0) {
        console.error(`[api/users/me] PATCH FALHOU — affectedRows=0 para email="${userEmail}". O email pode não existir na DB.`);
        return NextResponse.json(
          { error: `Conta não encontrada para o email "${userEmail}". Tenta sair e entrar novamente.` },
          { status: 404 },
        );
      }

      console.log(`[api/users/me] PATCH OK — affectedRows=${result.affectedRows} changedRows=${result.changedRows} email=${userEmail}`);
      return NextResponse.json({ success: true, affectedRows: result.affectedRows });
    });
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ER_DUP_ENTRY" &&
      err.message.includes("phone")
    ) {
      return NextResponse.json(
        { error: "Este número de telefone já está associado a outra conta.", field: "phone" },
        { status: 409 },
      );
    }
    console.error("[api/users/me] PATCH erro:", err);
    return NextResponse.json({ error: "Erro ao guardar dados." }, { status: 500 });
  }
}

// DELETE /api/users/me — anonimiza dados, não apaga pedidos
export async function DELETE() {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  const userEmail = session.user.email;
  try {
    await withConnection(async (conn) => {
      await conn.execute(
        `UPDATE users
         SET name = 'Utilizador eliminado', phone = NULL, addressLine = NULL,
             addressNumber = NULL, postalCode = NULL, addressCity = NULL,
             nif = NULL, billingName = NULL, billingNif = NULL,
             billingAddress = NULL, billingPostalCode = NULL, billingCity = NULL,
             avatarUrl = NULL, deletedAt = NOW(), updatedAt = NOW()
         WHERE email = ?`,
        [userEmail],
      );
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/users/me] DELETE:", err);
    return NextResponse.json({ error: "Erro ao eliminar conta." }, { status: 500 });
  }
}
