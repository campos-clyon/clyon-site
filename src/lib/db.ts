import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, desc, inArray } from "drizzle-orm";
import { users, colaboradores, registrosHoras, simulatorSettings, galleryMedia } from "../../drizzle/schema";
import type { InsertUser } from "../../drizzle/schema";
import { defaultSimulatorSettings } from "@/lib/simulator-settings";

let dbInstance: ReturnType<typeof drizzle<typeof import('../../drizzle/schema')>> | null = null;
let poolInstance: mysql.Pool | null = null;

export async function getPool() {
  if (!process.env.DATABASE_URL) {
    console.warn("[Database] DATABASE_URL not set");
    return null;
  }
  if (!poolInstance) {
    poolInstance = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 10000,
      connectTimeout: 20000,
    });
  }
  return poolInstance;
}

export async function getDb() {
  const pool = await getPool();
  if (!pool) return null;
  if (!dbInstance) {
    dbInstance = drizzle(pool) as any;
  }
  return dbInstance;
}

/**
 * Cria uma conexão MySQL2 fresca (não reutiliza singleton) para cada request.
 * Usar nos endpoints API admin para evitar erros de "Connection lost" com Railway.
 */
export async function withConnection<T>(
  fn: (conn: mysql.Connection) => Promise<T>,
): Promise<T> {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL not set");
  const conn = await mysql.createConnection({
    uri: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectTimeout: 20000,
  });
  try {
    return await fn(conn);
  } finally {
    await conn.end().catch(() => {});
  }
}

let simulatorTableEnsured = false;
let galleryMediaTableEnsured = false;

export async function ensureSimulatorSettingsTable() {
  if (simulatorTableEnsured) return;

  const pool = await getPool();
  if (!pool) throw new Error("Database not available");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS simulatorSettings (
      \`key\` varchar(120) NOT NULL PRIMARY KEY,
      label varchar(160) NOT NULL,
      category varchar(40) NOT NULL,
      unit varchar(24) NOT NULL,
      value decimal(10,2) NOT NULL,
      description text NULL,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  simulatorTableEnsured = true;

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const setting of defaultSimulatorSettings) {
    await db
      .insert(simulatorSettings)
      .values({
        key: setting.key,
        label: setting.label,
        category: setting.category,
        unit: setting.unit,
        value: setting.value.toFixed(2),
        description: setting.description,
      })
      .onDuplicateKeyUpdate({
        set: {
          label: setting.label,
          category: setting.category,
          unit: setting.unit,
          description: setting.description,
        },
      });
  }
}

export async function getSimulatorSettings() {
  await ensureSimulatorSettingsTable();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(simulatorSettings);
}

export async function upsertSimulatorSetting(data: {
  key: string;
  label: string;
  category: string;
  unit: string;
  value: string;
  description?: string | null;
}) {
  await ensureSimulatorSettingsTable();
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .insert(simulatorSettings)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        label: data.label,
        category: data.category,
        unit: data.unit,
        value: data.value,
        description: data.description ?? null,
      },
    });
}

export async function ensureGalleryMediaTable() {
  if (galleryMediaTableEnsured) return;

  const pool = await getPool();
  if (!pool) throw new Error("Database not available");

  await pool.query(`
    CREATE TABLE IF NOT EXISTS galleryMedia (
      id varchar(120) NOT NULL PRIMARY KEY,
      section varchar(32) NOT NULL,
      title varchar(180) NOT NULL,
      subtitle text NULL,
      description text NULL,
      alt varchar(220) NOT NULL,
      imageUrl longtext NOT NULL,
      \`order\` int NOT NULL DEFAULT 1,
      isActive int NOT NULL DEFAULT 1,
      projectKey varchar(160) NULL,
      phase varchar(24) NULL,
      createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await pool.query(`
    ALTER TABLE galleryMedia
    MODIFY COLUMN imageUrl longtext NOT NULL
  `);

  galleryMediaTableEnsured = true;
}

export async function getGalleryMediaItems() {
  await ensureGalleryMediaTable();
  const db = await getDb();
  if (!db) return [];
  return db.select().from(galleryMedia);
}

export async function replaceGalleryMediaItems(
  items: Array<{
    id: string;
    section: string;
    title: string;
    subtitle?: string | null;
    description?: string | null;
    alt: string;
    imageUrl: string;
    order: number;
    isActive: boolean;
    projectKey?: string | null;
    phase?: string | null;
  }>,
) {
  await ensureGalleryMediaTable();
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  for (const item of items) {
    await db
      .insert(galleryMedia)
      .values({
        id: item.id,
        section: item.section,
        title: item.title,
        subtitle: item.subtitle ?? null,
        description: item.description ?? null,
        alt: item.alt,
        imageUrl: item.imageUrl,
        order: item.order,
        isActive: item.isActive ? 1 : 0,
        projectKey: item.projectKey ?? null,
        phase: item.phase ?? null,
      })
      .onDuplicateKeyUpdate({
        set: {
          section: item.section,
          title: item.title,
          subtitle: item.subtitle ?? null,
          description: item.description ?? null,
          alt: item.alt,
          imageUrl: item.imageUrl,
          order: item.order,
          isActive: item.isActive ? 1 : 0,
          projectKey: item.projectKey ?? null,
          phase: item.phase ?? null,
        },
      });
  }

  if (items.length === 0) {
    await db.delete(galleryMedia);
    return;
  }

  const idsToDelete = (await db.select({ id: galleryMedia.id }).from(galleryMedia))
    .map((row) => row.id)
    .filter((id) => !items.some((item) => item.id === id));

  if (idsToDelete.length > 0) {
    await db.delete(galleryMedia).where(inArray(galleryMedia.id, idsToDelete));
  }
}

// ─── User helpers ───────────────────────────────────────────────────────────

export async function upsertUser(values: InsertUser) {
  const db = await getDb();
  if (!db) return;
  try {
    const updateSet: Partial<InsertUser> = {
      name: values.name,
      email: values.email,
      loginMethod: values.loginMethod,
      lastSignedIn: new Date(),
    };
    if (values.openId === process.env.OWNER_OPEN_ID) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? undefined;
}

// ─── Colaboradores helpers ───────────────────────────────────────────────────

export async function getColaboradorByNome(nome: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(colaboradores).where(eq(colaboradores.nome, nome)).limit(1);
  return result[0] ?? undefined;
}

export async function getAllColaboradores() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(colaboradores);
}

export async function createColaborador(data: {
  nome: string;
  senha: string;
  funcao: "motorista" | "ajudante" | "admin";
  valorHora: string;
  isAdmin?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(colaboradores).values(data);
}

export async function updateColaborador(
  id: number,
  data: Partial<{ nome: string; senha: string; funcao: "motorista" | "ajudante" | "admin"; valorHora: string; isAdmin: number }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(colaboradores).set(data).where(eq(colaboradores.id, id));
}

export async function deleteColaborador(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(colaboradores).where(eq(colaboradores.id, id));
}

// ─── Registros de Horas helpers ──────────────────────────────────────────────

function calcularHoras(entrada: string, saida: string, pausa?: string | null): number {
  try {
    const [entH, entM] = entrada.split(":").map(Number);
    const [saiH, saiM] = saida.split(":").map(Number);
    let totalMinutos = saiH * 60 + saiM - (entH * 60 + entM);
    if (pausa) {
      const [pausaH, pausaM] = pausa.split(":").map(Number);
      totalMinutos -= pausaH * 60 + pausaM;
    }
    return Math.max(0, parseFloat((totalMinutos / 60).toFixed(2)));
  } catch {
    return 0;
  }
}

export async function getRegistrosHorasByColaborador(
  colaboradorId: number,
  limit = 50,
  offset = 0
) {
  const db = await getDb();
  if (!db) return [];
  const result = await db
    .select()
    .from(registrosHoras)
    .where(eq(registrosHoras.colaboradorId, colaboradorId))
    .orderBy(desc(registrosHoras.data))
    .limit(limit)
    .offset(offset);

  const colab = await db
    .select()
    .from(colaboradores)
    .where(eq(colaboradores.id, colaboradorId))
    .limit(1);
  const valorHora = colab[0] ? parseFloat(colab[0].valorHora) : 0;

  return result.map((reg) => {
    const horas = reg.horaSaida ? calcularHoras(reg.horaEntrada, reg.horaSaida, reg.horaPausa) : 0;
    const valor = parseFloat((horas * valorHora).toFixed(2));
    return { ...reg, horasTrabalhadas: horas.toFixed(2), valorTotal: valor.toFixed(2) };
  });
}

export async function createRegistroHoras(data: {
  colaboradorId: number;
  data: Date;
  horaEntrada: string;
  horaPausa?: string;
  horaSaida?: string;
  numeroTrabalhos: number;
  horasTrabalhadas: string;
  valorTotal: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(registrosHoras).values({ ...data, sincronizadoSheets: 0 });
}

export async function updateRegistroHoras(
  id: number,
  data: Partial<{
    horaPausa: string;
    horaSaida: string;
    numeroTrabalhos: number;
    horasTrabalhadas: string;
    valorTotal: string;
    sincronizadoSheets: number;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(registrosHoras).set(data).where(eq(registrosHoras.id, id));
}

// ─── Leads helpers ───────────────────────────────────────────────────────────

export async function createLead(data: {
  nome: string; telefone: string; email: string; localidade: string;
  tipoServico: string; preferenciaContacto: string; mensagem?: string | null;
  pagePath?: string | null; pageUrl?: string | null;
  utmSource?: string | null; utmMedium?: string | null; utmCampaign?: string | null;
  gclid?: string | null;
}) {
  console.log("[db/createLead] A criar lead:", data.nome, data.tipoServico);
  try {
    await withConnection(async (conn) => {
      await conn.execute(
        `INSERT INTO leads (nome, telefone, email, localidade, tipoServico, preferenciaContacto,
                            mensagem, pagePath, pageUrl, utmSource, utmMedium, utmCampaign, gclid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.nome, data.telefone, data.email, data.localidade, data.tipoServico,
         data.preferenciaContacto, data.mensagem ?? null, data.pagePath ?? null,
         data.pageUrl ?? null, data.utmSource ?? null, data.utmMedium ?? null,
         data.utmCampaign ?? null, data.gclid ?? null],
      );
    });
    console.log("[db/createLead] Lead gravado com sucesso:", data.nome);
  } catch (err) {
    console.error("[db/createLead] Erro ao inserir lead:", err);
    throw err;
  }
}

export async function getAllLeads() {
  const rows = await withConnection(async (conn) => {
    const [r] = await conn.execute(
      `SELECT id, nome, telefone, email, localidade, tipoServico, preferenciaContacto,
              mensagem, pagePath, pageUrl, utmSource, utmMedium, utmCampaign, gclid,
              status, notasInternas, createdAt
       FROM leads ORDER BY createdAt DESC LIMIT 500`,
    );
    return r;
  });
  return rows as Record<string, unknown>[];
}

export async function updateLeadStatus(id: number, status: string, notasInternas?: string) {
  await withConnection(async (conn) => {
    if (notasInternas !== undefined) {
      await conn.execute(`UPDATE leads SET status = ?, notasInternas = ? WHERE id = ?`, [status, notasInternas, id]);
    } else {
      await conn.execute(`UPDATE leads SET status = ? WHERE id = ?`, [status, id]);
    }
  });
}

export async function createLeadEvent(data: {
  eventType: string;
  pagePath?: string | null;
  pageUrl?: string | null;
  serviceType?: string | null;
  location?: string | null;
  contactPreference?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  gclid?: string | null;
}) {
  try {
    await withConnection(async (conn) => {
      await conn.execute(
        `INSERT INTO leadEvents (eventType, pagePath, pageUrl, serviceType, location, contactPreference, utmSource, utmMedium, utmCampaign, gclid)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          String(data.eventType).slice(0, 80),
          data.pagePath ?? null,
          data.pageUrl ?? null,
          data.serviceType ?? null,
          data.location ?? null,
          data.contactPreference ?? null,
          data.utmSource ?? null,
          data.utmMedium ?? null,
          data.utmCampaign ?? null,
          data.gclid ?? null,
        ],
      );
    });
    console.log("[db/createLeadEvent] Evento gravado:", data.eventType);
  } catch (err) {
    console.warn("[db/createLeadEvent] Erro ao gravar evento:", data.eventType, err);
  }
}

// ─── Leads helpers END ───────────────────────────────────────────────────────

export async function getTodayRegistroByColaborador(colaboradorId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const result = await db
    .select()
    .from(registrosHoras)
    .where(eq(registrosHoras.colaboradorId, colaboradorId))
    .orderBy(desc(registrosHoras.data))
    .limit(1);

  if (!result[0]) return undefined;
  const regDate = new Date(result[0].data);
  if (regDate >= today && regDate < tomorrow) return result[0];
  return undefined;
}
