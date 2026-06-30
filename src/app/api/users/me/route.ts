import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptionsCliente } from "@/auth-cliente";
import { getPool } from "@/lib/db";

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

async function getOrCreateUser(email: string, name: string | null, googleAvatarUrl: string | null) {
  const pool = await getPool();
  if (!pool) throw new Error("Pool não disponível");

  const [rows] = await pool.execute(
    "SELECT * FROM users WHERE email = ? AND deletedAt IS NULL LIMIT 1",
    [email],
  ) as [UserRow[], unknown];

  if (rows.length > 0) return rows[0];

  // Criar utilizador novo
  await pool.execute(
    `INSERT INTO users (name, email, loginMethod, role, createdAt, updatedAt, lastSignedIn)
     VALUES (?, ?, 'google', 'user', NOW(), NOW(), NOW())`,
    [name ?? email.split("@")[0], email],
  );

  const [newRows] = await pool.execute(
    "SELECT * FROM users WHERE email = ? LIMIT 1",
    [email],
  ) as [UserRow[], unknown];

  return newRows[0];
}

// GET /api/users/me
export async function GET() {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const user = await getOrCreateUser(
      session.user.email,
      session.user.name ?? null,
      session.user.image ?? null,
    );
    return NextResponse.json({ user });
  } catch (err) {
    console.error("[api/users/me] GET:", err);
    return NextResponse.json({ error: "Erro ao carregar dados." }, { status: 500 });
  }
}

const PatchSchema = z.object({
  name:             z.string().min(1).max(160).optional(),
  phone:            z.string().max(30).optional().nullable(),
  addressLine:      z.string().max(255).optional().nullable(),
  addressNumber:    z.string().max(20).optional().nullable(),
  postalCode:       z.string().max(20).optional().nullable(),
  addressCity:      z.string().max(120).optional().nullable(),
  nif:              z.string().max(20).optional().nullable(),
  billingName:      z.string().max(160).optional().nullable(),
  billingNif:       z.string().max(20).optional().nullable(),
  billingAddress:   z.string().max(255).optional().nullable(),
  billingPostalCode:z.string().max(20).optional().nullable(),
  billingCity:      z.string().max(120).optional().nullable(),
  avatarUrl:        z.string().max(1024).optional().nullable(),
  notifOrderStatus: z.boolean().optional(),
  notifWeeklyDigest:z.boolean().optional(),
  notifWhatsapp:    z.boolean().optional(),
});

// PATCH /api/users/me
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

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

  const boolFields = ["notifOrderStatus", "notifWeeklyDigest", "notifWhatsapp"] as const;
  const strFields = [
    "name", "phone", "addressLine", "addressNumber", "postalCode", "addressCity",
    "nif", "billingName", "billingNif", "billingAddress", "billingPostalCode",
    "billingCity", "avatarUrl",
  ] as const;

  for (const f of strFields) {
    if (f in data) { setClauses.push(`${f} = ?`); values.push(data[f] ?? null); }
  }
  for (const f of boolFields) {
    if (f in data) { setClauses.push(`${f} = ?`); values.push(data[f] ? 1 : 0); }
  }

  values.push(session.user.email);

  try {
    const pool = await getPool();
    if (!pool) throw new Error("Pool não disponível");
    await pool.execute(
      `UPDATE users SET ${setClauses.join(", ")} WHERE email = ? AND deletedAt IS NULL`,
      values,
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/users/me] PATCH:", err);
    return NextResponse.json({ error: "Erro ao guardar dados." }, { status: 500 });
  }
}

// DELETE /api/users/me — anonimiza dados, não apaga pedidos
export async function DELETE() {
  const session = await getServerSession(authOptionsCliente);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
  }

  try {
    const pool = await getPool();
    if (!pool) throw new Error("Pool não disponível");
    await pool.execute(
      `UPDATE users
       SET name = 'Utilizador eliminado', phone = NULL, addressLine = NULL,
           addressNumber = NULL, postalCode = NULL, addressCity = NULL,
           nif = NULL, billingName = NULL, billingNif = NULL,
           billingAddress = NULL, billingPostalCode = NULL, billingCity = NULL,
           avatarUrl = NULL, deletedAt = NOW(), updatedAt = NOW()
       WHERE email = ?`,
      [session.user.email],
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/users/me] DELETE:", err);
    return NextResponse.json({ error: "Erro ao eliminar conta." }, { status: 500 });
  }
}
