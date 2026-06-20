import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { eq, desc, inArray } from "drizzle-orm";
import { users, colaboradores, registrosHoras, simulatorSettings, galleryMedia } from "../../drizzle/schema";
import type { InsertUser, InsertSimulatorOrder, SimulatorOrder } from "../../drizzle/schema";
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

/**
 * Garante que a coluna funcao da tabela colaboradores aceita o valor 'assistente'.
 * Seguro para correr múltiplas vezes — falha silenciosamente se o enum já existir.
 */
/**
 * Garante que a tabela colaboradores tem todos os campos necessários.
 * Usa ALTER TABLE … ADD COLUMN IF NOT EXISTS (seguro para correr múltiplas vezes).
 */
/**
 * Verifica se coluna existe em tabela (compatível com MySQL/MariaDB antigos)
 */
async function hasColumn(tableName: string, columnName: string): Promise<boolean> {
  const pool = await getPool();
  if (!pool) return false;

  try {
    const [rows] = await pool.execute(
      `SELECT COUNT(*) AS count
       FROM information_schema.columns
       WHERE table_schema = DATABASE()
         AND table_name = ?
         AND column_name = ?`,
      [tableName, columnName]
    );
    const count = Number((rows as any[])[0]?.count ?? 0);
    return count > 0;
  } catch (error) {
    console.error(`[v0] hasColumn erro: ${error}`);
    return false;
  }
}

export async function ensureColaboradoresSchema(): Promise<void> {
  const pool = await getPool();
  if (!pool) return;

  console.log("[v0] ensureColaboradoresSchema: Iniciando...");

  try {
    // Garantir enum actualizado (MODIFY sempre funciona)
    await pool.execute(
      `ALTER TABLE colaboradores MODIFY COLUMN funcao ENUM('motorista','ajudante','admin','assistente') NOT NULL`
    );
    console.log("[v0] ensureColaboradoresSchema: funcao enum actualizado");
  } catch (error) {
    console.log("[v0] ensureColaboradoresSchema: funcao enum já existe ou erro:", String(error).slice(0, 50));
  }

  try {
    // valorHora passa a ser opcional
    await pool.execute(
      `ALTER TABLE colaboradores MODIFY COLUMN valorHora DECIMAL(6,2) DEFAULT '0.00'`
    );
    console.log("[v0] ensureColaboradoresSchema: valorHora modificado");
  } catch (error) {
    console.log("[v0] ensureColaboradoresSchema: valorHora já existe ou erro");
  }

  // Lista de colunas a adicionar com verificação
  const columnsToAdd = [
    {
      name: "valorDiaria",
      sql: `ALTER TABLE colaboradores ADD COLUMN valorDiaria DECIMAL(6,2) DEFAULT NULL`,
    },
    {
      name: "paymentModel",
      sql: `ALTER TABLE colaboradores ADD COLUMN paymentModel ENUM('hourly','daily','commission','none') DEFAULT 'hourly'`,
    },
    {
      name: "commissionType",
      sql: `ALTER TABLE colaboradores ADD COLUMN commissionType ENUM('profit_percent','gross_percent','fixed_per_closed_request','none') DEFAULT NULL`,
    },
    {
      name: "commissionPercent",
      sql: `ALTER TABLE colaboradores ADD COLUMN commissionPercent DECIMAL(5,2) DEFAULT NULL`,
    },
    {
      name: "commissionFixedAmount",
      sql: `ALTER TABLE colaboradores ADD COLUMN commissionFixedAmount DECIMAL(8,2) DEFAULT NULL`,
    },
    {
      name: "commissionNotes",
      sql: `ALTER TABLE colaboradores ADD COLUMN commissionNotes TEXT DEFAULT NULL`,
    },
    {
      name: "canReceiveSimulatorRequests",
      sql: `ALTER TABLE colaboradores ADD COLUMN canReceiveSimulatorRequests TINYINT(1) NOT NULL DEFAULT 0`,
    },
    {
      name: "participatesInTimeTracking",
      sql: `ALTER TABLE colaboradores ADD COLUMN participatesInTimeTracking TINYINT(1) NOT NULL DEFAULT 1`,
    },
    {
      name: "active",
      sql: `ALTER TABLE colaboradores ADD COLUMN active TINYINT(1) NOT NULL DEFAULT 1`,
    },
    {
      name: "createdAt",
      sql: `ALTER TABLE colaboradores ADD COLUMN createdAt DATETIME DEFAULT CURRENT_TIMESTAMP`,
    },
    {
      name: "updatedAt",
      sql: `ALTER TABLE colaboradores ADD COLUMN updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`,
    },
  ];

  // Verificar e adicionar cada coluna individualmente
  for (const col of columnsToAdd) {
    try {
      const exists = await hasColumn("colaboradores", col.name);
      if (!exists) {
        await pool.execute(col.sql);
        console.log(`[v0] ensureColaboradoresSchema: ✓ Coluna ${col.name} adicionada`);
      } else {
        console.log(`[v0] ensureColaboradoresSchema: Coluna ${col.name} já existe`);
      }
    } catch (error) {
      console.error(`[v0] ensureColaboradoresSchema erro ao adicionar ${col.name}:`, String(error).slice(0, 100));
    }
  }

  // Assistentes existentes: garantir canReceiveSimulatorRequests=1 e participatesInTimeTracking=0
  try {
    await pool.execute(
      `UPDATE colaboradores SET canReceiveSimulatorRequests=1, participatesInTimeTracking=0 WHERE funcao='assistente' AND canReceiveSimulatorRequests=0`
    );
    console.log("[v0] ensureColaboradoresSchema: ✓ Assistentes configurados");
  } catch (error) {
    console.log("[v0] ensureColaboradoresSchema: Erro ao configurar assistentes");
  }

  console.log("[v0] ensureColaboradoresSchema: Completo");
}

/** @deprecated Use ensureColaboradoresSchema */
export async function ensureColaboradoresEnum(): Promise<void> {
  return ensureColaboradoresSchema();
}

/**
 * Garante que WANDERSON existe e tem isAdmin=1 e funcao='admin'.
 * Retorna o registo actualizado.
 */
export async function upsertWandersonAdmin(senhaHash?: string): Promise<{ id: number; nome: string; isAdmin: number; funcao: string }> {
  const pool = await getPool();
  if (!pool) throw new Error("Database not available");
  await ensureColaboradoresEnum();

  const [[existing]] = await pool.execute(
    "SELECT id, nome, funcao, isAdmin FROM colaboradores WHERE nome = ? LIMIT 1",
    ["WANDERSON"]
  ) as any[];

  if (existing) {
    // Garantir isAdmin=1 e funcao='admin'
    await pool.execute(
      "UPDATE colaboradores SET isAdmin = 1, funcao = 'admin', updatedAt = NOW() WHERE id = ?",
      [existing.id]
    );
    return { id: existing.id, nome: "WANDERSON", isAdmin: 1, funcao: "admin" };
  }

  // Criar WANDERSON se não existir
  const bcrypt = await import("bcryptjs");
  const senha = senhaHash ?? await bcrypt.hash("wanderson2026", 10);
  await pool.execute(
    "INSERT INTO colaboradores (nome, senha, funcao, valorHora, isAdmin) VALUES (?, ?, 'admin', '0', 1)",
    ["WANDERSON", senha]
  );
  const [[created]] = await pool.execute(
    "SELECT id, nome, funcao, isAdmin FROM colaboradores WHERE nome = ? LIMIT 1",
    ["WANDERSON"]
  ) as any[];
  return created as { id: number; nome: string; isAdmin: number; funcao: string };
}

export async function getAllColaboradores() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(colaboradores);
}

export type ColaboradorFuncao = "motorista" | "ajudante" | "admin" | "assistente";
export type PaymentModel = "hourly" | "daily" | "commission" | "none";
export type CommissionType = "profit_percent" | "gross_percent" | "fixed_per_closed_request" | "none";

export interface CreateColaboradorData {
  nome: string;
  senha: string;
  funcao: ColaboradorFuncao;
  isAdmin?: number;
  // Modelo de pagamento
  paymentModel?: PaymentModel;
  valorHora?: string | null;
  valorDiaria?: string | null;
  // Comissão (para assistentes)
  commissionType?: CommissionType | null;
  commissionPercent?: string | null;
  commissionFixedAmount?: string | null;
  commissionNotes?: string | null;
  // Flags
  canReceiveSimulatorRequests?: number;
  participatesInTimeTracking?: number;
  active?: number;
}

export async function createColaborador(data: CreateColaboradorData) {
  const pool = await getPool();
  if (!pool) throw new Error("Database not available");

  // Garantir schema actualizado (incluindo novos campos)
  await ensureColaboradoresSchema();

  // Derivar defaults por funcao
  const isAssistente = data.funcao === "assistente";
  const isAdmin = data.funcao === "admin";
  const paymentModel = data.paymentModel ?? (isAssistente ? "commission" : isAdmin ? "none" : "hourly");
  const valorHora = isAssistente || isAdmin ? "0.00" : (data.valorHora ? String(parseFloat(data.valorHora)) : "0.00");
  const canReceive = data.canReceiveSimulatorRequests ?? (isAssistente ? 1 : 0);
  const participates = data.participatesInTimeTracking ?? (isAssistente ? 0 : 1);

  await pool.execute(
    `INSERT INTO colaboradores
      (nome, senha, funcao, valorHora, valorDiaria, isAdmin, paymentModel,
       commissionType, commissionPercent, commissionFixedAmount, commissionNotes,
       canReceiveSimulatorRequests, participatesInTimeTracking, active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      data.nome,
      data.senha,
      data.funcao,
      valorHora,
      data.valorDiaria ?? null,
      data.isAdmin ?? 0,
      paymentModel,
      data.commissionType ?? null,
      data.commissionPercent ?? null,
      data.commissionFixedAmount ?? null,
      data.commissionNotes ?? null,
      canReceive,
      participates,
    ]
  );
}

export interface UpdateColaboradorData {
  nome?: string;
  senha?: string;
  funcao?: ColaboradorFuncao;
  isAdmin?: number;
  paymentModel?: PaymentModel;
  valorHora?: string | null;
  valorDiaria?: string | null;
  commissionType?: CommissionType | null;
  commissionPercent?: string | null;
  commissionFixedAmount?: string | null;
  commissionNotes?: string | null;
  canReceiveSimulatorRequests?: number;
  participatesInTimeTracking?: number;
  active?: number;
}

export async function updateColaborador(id: number, data: UpdateColaboradorData) {
  const pool = await getPool();
  if (!pool) throw new Error("Database not available");
  await ensureColaboradoresSchema();

  const allowed = [
    "nome", "senha", "funcao", "isAdmin", "paymentModel",
    "valorHora", "valorDiaria", "commissionType", "commissionPercent",
    "commissionFixedAmount", "commissionNotes",
    "canReceiveSimulatorRequests", "participatesInTimeTracking", "active",
  ] as const;

  const entries = Object.entries(data).filter(
    ([k, v]) => allowed.includes(k as typeof allowed[number]) && v !== undefined
  );
  if (!entries.length) return;

  const setParts = entries.map(([k]) => `${k} = ?`).join(", ");
  const values = entries.map(([, v]) => v ?? null);
  await pool.execute(`UPDATE colaboradores SET ${setParts}, updatedAt = NOW() WHERE id = ?`, [...values, id]);
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
  const valorHora = colab[0] ? parseFloat(colab[0].valorHora ?? "0") : 0;

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

// ─── SimulatorOrders ──────────────────────────────────────────────────────────

let _simulatorOrdersEnsured = false;

async function ensureSimulatorOrdersTable() {
  if (_simulatorOrdersEnsured) return;
  const pool = await getPool();
  if (!pool) return;
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS simulatorOrders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serviceType VARCHAR(80),
      description TEXT,
      filesJson TEXT,
      address TEXT,
      city VARCHAR(120),
      floor VARCHAR(40),
      hasElevator VARCHAR(20),
      parkingDistance VARCHAR(30),
      contactName VARCHAR(120),
      contactPhone VARCHAR(30),
      contactEmail VARCHAR(200),
      urgency VARCHAR(30),
      estimateMin DECIMAL(10,2),
      estimateMax DECIMAL(10,2),
      estimateTotal DECIMAL(10,2),
      estimateJson TEXT,
      distanceKm DECIMAL(8,2),
      distanceText VARCHAR(60),
      status VARCHAR(40) NOT NULL DEFAULT 'pendente',
      priority VARCHAR(20) DEFAULT 'normal',
      notasInternas TEXT,
      precoFinal DECIMAL(10,2),
      precoFinalIva DECIMAL(10,2),
      mensagemCliente TEXT,
      assignedToId INT,
      assignedToName VARCHAR(120),
      assignedAt TIMESTAMP NULL DEFAULT NULL,
      chatJson LONGTEXT,
      historyJson LONGTEXT,
      reviewJson TEXT,
      colaboradorId INT,
      dataAgendada TIMESTAMP NULL DEFAULT NULL,
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  // Migração: adicionar colunas novas se a tabela já existia (sem falhar se já existem)
  const migrations = [
    `ALTER TABLE simulatorOrders MODIFY COLUMN status VARCHAR(40) NOT NULL DEFAULT 'pendente'`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal'`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS precoFinalIva DECIMAL(10,2)`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS mensagemCliente TEXT`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS assignedToId INT`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS assignedToName VARCHAR(120)`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS assignedAt TIMESTAMP NULL DEFAULT NULL`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS chatJson LONGTEXT`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS historyJson LONGTEXT`,
    `ALTER TABLE simulatorOrders ADD COLUMN IF NOT EXISTS reviewJson TEXT`,
  ];
  for (const sql of migrations) {
    try { await pool.execute(sql); } catch {}
  }
  _simulatorOrdersEnsured = true;
}

export async function createSimulatorOrder(data: InsertSimulatorOrder): Promise<number> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) throw new Error("DB not available");
  const cols = Object.keys(data).filter((k) => (data as Record<string, unknown>)[k] !== undefined);
  const vals = cols.map((k) => (data as Record<string, unknown>)[k]);
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT INTO simulatorOrders (${cols.join(", ")}) VALUES (${placeholders})`;
  const [result] = await pool.execute(sql, vals) as any[];
  return result.insertId ?? 0;
}

export async function getAllSimulatorOrders(filters?: {
  status?: string;
  search?: string;
}): Promise<SimulatorOrder[]> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return [];
  const conditions: string[] = [];
  const params: unknown[] = [];
  if (filters?.status) {
    conditions.push("status = ?");
    params.push(filters.status);
  }
  if (filters?.search) {
    conditions.push("(contactName LIKE ? OR contactPhone LIKE ? OR address LIKE ? OR description LIKE ?)");
    const s = `%${filters.search}%`;
    params.push(s, s, s, s);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const [rows] = await pool.execute(
    `SELECT * FROM simulatorOrders ${where} ORDER BY createdAt DESC LIMIT 500`,
    params,
  ) as any[];
  return rows as SimulatorOrder[];
}

export async function getSimulatorOrderById(id: number): Promise<SimulatorOrder | undefined> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return undefined;
  const [rows] = await pool.execute("SELECT * FROM simulatorOrders WHERE id = ? LIMIT 1", [id]) as any[];
  return (rows as SimulatorOrder[])[0];
}

export async function updateSimulatorOrder(
  id: number,
  data: Partial<{
    status: "pendente" | "aprovado" | "rejeitado" | "em_execucao" | "concluido" | "cancelado";
    notasInternas: string;
    precoFinal: string;
    colaboradorId: number;
    dataAgendada: Date;
    serviceType: string;
    description: string;
    contactName: string;
    contactPhone: string;
    contactEmail: string;
    address: string;
    floor: string;
    urgency: string;
  }>
) {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) throw new Error("DB not available");
  const entries = Object.entries(data).filter(([, v]) => v !== undefined);
  if (!entries.length) return;
  const sets = entries.map(([k]) => `${k} = ?`).join(", ");
  const vals = [...entries.map(([, v]) => v), id];
  await pool.execute(`UPDATE simulatorOrders SET ${sets} WHERE id = ?`, vals);
}

export async function deleteSimulatorOrder(id: number) {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) throw new Error("DB not available");
  await pool.execute("DELETE FROM simulatorOrders WHERE id = ?", [id]);
}

export async function countSimulatorOrdersByStatus(): Promise<Record<string, number>> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return {};
  const [rows] = await pool.execute(
    "SELECT status, COUNT(*) AS total FROM simulatorOrders GROUP BY status"
  ) as any[];
  const result: Record<string, number> = {};
  let grand = 0;
  for (const row of (rows as { status: string; total: string | number }[])) {
    result[row.status] = Number(row.total);
    grand += Number(row.total);
  }
  result["total"] = grand;
  // Contar pedidos sem assistente
  const [[semRow]] = await pool.execute(
    "SELECT COUNT(*) AS total FROM simulatorOrders WHERE (assignedToId IS NULL OR assignedToId = 0) AND status NOT IN ('cancelado','confirmado','concluido','arquivado')"
  ) as any[];
  result["sem_assistente"] = Number(semRow?.total ?? 0);
  return result;
}

// ─── Assistentes (colaboradores que gerem pedidos) ───────────────────────────

export async function getActiveAssistants(): Promise<Array<{ id: number; nome: string; funcao: string; isAdmin: number }>> {
  const pool = await getPool();
  if (!pool) return [];
  // Apenas assistentes activos que podem receber pedidos do simulador
  const [rows] = await pool.execute(
    `SELECT id, nome, funcao, isAdmin FROM colaboradores
     WHERE funcao = 'assistente'
       AND isAdmin = 0
       AND (active IS NULL OR active = 1)
       AND (canReceiveSimulatorRequests IS NULL OR canReceiveSimulatorRequests = 1)
     ORDER BY nome ASC`
  ) as any[];
  return rows as any[];
}

export async function countActiveOrdersByAssistant(): Promise<Record<number, number>> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return {};
  const [rows] = await pool.execute(
    `SELECT assignedToId, COUNT(*) AS total FROM simulatorOrders
     WHERE assignedToId IS NOT NULL
       AND status NOT IN ('confirmado','concluido','cancelado','rejeitado')
     GROUP BY assignedToId`
  ) as any[];
  const result: Record<number, number> = {};
  for (const row of rows as any[]) result[Number(row.assignedToId)] = Number(row.total);
  return result;
}

export async function pickLeastLoadedAssistant(): Promise<{ id: number; nome: string } | null> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  const [assistants, counts] = await Promise.all([
    getActiveAssistants(),
    countActiveOrdersByAssistant(),
  ]);
  if (!assistants.length) return null;

  // Desempate: assistente que recebeu pedido há mais tempo tem prioridade
  const lastAssigned: Record<number, string> = {};
  if (pool) {
    try {
      const [rows] = await pool.execute(
        `SELECT assignedToId, MAX(assignedAt) AS lastAt FROM simulatorOrders
         WHERE assignedToId IS NOT NULL GROUP BY assignedToId`
      ) as any[];
      for (const row of rows as any[]) lastAssigned[Number(row.assignedToId)] = String(row.lastAt ?? "");
    } catch {}
  }

  let best: { id: number; nome: string } | null = null;
  let bestCount = Infinity;
  let bestLastAt = "9999-12-31";

  for (const a of assistants) {
    const c = counts[a.id] ?? 0;
    const lastAt = lastAssigned[a.id] ?? "0000-01-01";
    if (c < bestCount || (c === bestCount && lastAt < bestLastAt)) {
      bestCount = c;
      bestLastAt = lastAt;
      best = { id: a.id, nome: a.nome };
    }
  }
  return best;
}

export async function appendOrderHistory(
  orderId: number,
  entry: { type: string; by?: { id: number; nome: string; role: string } | null; message: string }
): Promise<void> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return;
  const now = new Date().toISOString();
  const [rows] = await pool.execute("SELECT historyJson FROM simulatorOrders WHERE id = ? LIMIT 1", [orderId]) as any[];
  const existing: any[] = [];
  try { if ((rows as any[])[0]?.historyJson) existing.push(...JSON.parse((rows as any[])[0].historyJson)); } catch {}
  existing.push({ ...entry, createdAt: now });
  await pool.execute("UPDATE simulatorOrders SET historyJson=?, updatedAt=NOW() WHERE id=?", [JSON.stringify(existing), orderId]);
}

export async function assignSimulatorOrder(
  orderId: number,
  assignee: { id: number; nome: string } | null,
  actor: { id: number; nome: string; role: string } | null
): Promise<void> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return;
  const newStatus = assignee ? "atribuido" : "pendente";
  const isAuto = actor === null;
  const message = assignee
    ? isAuto
      ? `Pedido atribuído automaticamente a ${assignee.nome}.`
      : `Pedido reatribuído a ${assignee.nome} por ${actor?.nome ?? "—"}.`
    : actor
      ? `Atribuição removida por ${actor.nome}.`
      : "Pedido sem assistente atribuído.";
  const [rows] = await pool.execute("SELECT historyJson FROM simulatorOrders WHERE id = ? LIMIT 1", [orderId]) as any[];
  const existing: any[] = [];
  try { if ((rows as any[])[0]?.historyJson) existing.push(...JSON.parse((rows as any[])[0].historyJson)); } catch {}
  existing.push({ type: "assigned", by: actor ?? null, message, createdAt: new Date().toISOString() });
  await pool.execute(
    `UPDATE simulatorOrders SET assignedToId=?, assignedToName=?, assignedAt=?, status=?, historyJson=?, updatedAt=NOW() WHERE id=?`,
    [assignee?.id ?? null, assignee?.nome ?? null, assignee ? new Date() : null, newStatus, JSON.stringify(existing), orderId]
  );
}

export async function approveSimulatorOrder(
  orderId: number,
  data: { precoFinal: number; precoFinalIva: number; mensagemCliente: string; notasInternas?: string; reviewedBy: { id: number; nome: string; role: string } }
): Promise<void> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return;
  const reviewJson = JSON.stringify({ ...data, reviewedAt: new Date().toISOString() });
  await pool.execute(
    `UPDATE simulatorOrders SET status='aprovado', precoFinal=?, precoFinalIva=?, mensagemCliente=?, notasInternas=COALESCE(?,notasInternas), reviewJson=?, updatedAt=NOW() WHERE id=?`,
    [data.precoFinal, data.precoFinalIva, data.mensagemCliente, data.notasInternas ?? null, reviewJson, orderId]
  );
  await appendOrderHistory(orderId, {
    type: "approved",
    by: data.reviewedBy,
    message: `Pedido aprovado por ${data.reviewedBy.nome}. Valor: ${data.precoFinal}€ + IVA.`,
  });
}

export async function getSimulatorOrdersByAssistant(assignedToId: number): Promise<SimulatorOrder[]> {
  await ensureSimulatorOrdersTable();
  const pool = await getPool();
  if (!pool) return [];
  // Assistente vê apenas os pedidos atribuídos a si — nunca pedidos de outros
  const [rows] = await pool.execute(
    "SELECT * FROM simulatorOrders WHERE assignedToId = ? ORDER BY createdAt DESC LIMIT 200",
    [assignedToId]
  ) as any[];
  return rows as SimulatorOrder[];
}

export function calculateOrderPriority(order: {
  urgency?: string | null;
  description?: string | null;
  estimateTotal?: string | null;
}): "baixa" | "normal" | "alta" | "urgente" {
  const desc = (order.description ?? "").toLowerCase();
  const urgency = (order.urgency ?? "").toLowerCase();
  if (urgency.includes("hoje") || urgency.includes("urgente")) return "urgente";
  if (urgency.includes("amanh")) return "alta";
  if (desc.includes("casa cheia") || desc.includes("esvaziamento") || desc.includes("obra pesada")) return "alta";
  const total = parseFloat(order.estimateTotal ?? "0");
  if (total > 400) return "alta";
  if (!order.description && !order.urgency) return "baixa";
  return "normal";
}

// ─── Helpers de permissão e roles ───────────────────────────────────────────

export type EffectiveRole = "admin_geral" | "assistente" | "motorista" | "ajudante" | "colaborador";

/**
 * Fonte única de verdade para o role efectivo de um utilizador.
 * Admin geral é determinado por isAdmin=1, independentemente de funcao.
 */
export function getEffectiveRole(user: { isAdmin: number; funcao: string }): EffectiveRole {
  if (user.isAdmin) return "admin_geral";
  if (user.funcao === "assistente") return "assistente";
  if (user.funcao === "motorista") return "motorista";
  if (user.funcao === "ajudante") return "ajudante";
  return "colaborador";
}

export function canViewRequest(
  user: { isAdmin: number; id: number },
  request: { assignedToId?: number | null }
): boolean {
  if (user.isAdmin) return true;
  return request.assignedToId === user.id;
}

export function canEditRequest(
  user: { isAdmin: number; id: number },
  request: { assignedToId?: number | null }
): boolean {
  if (user.isAdmin) return true;
  return request.assignedToId === user.id;
}

export function canManageUsers(user: { isAdmin: number }): boolean {
  return !!user.isAdmin;
}

// ─── SimulatorOrders END ──────────────────────────────────────────────────────
