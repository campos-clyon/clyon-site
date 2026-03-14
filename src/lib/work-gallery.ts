import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export const gallerySections = ["hero", "showcase"] as const;
export const galleryPhases = ["before", "during", "after"] as const;

export type GallerySection = (typeof gallerySections)[number];
export type GalleryPhase = (typeof galleryPhases)[number];

export type GalleryItem = {
  id: string;
  section: GallerySection;
  title: string;
  subtitle?: string;
  description?: string;
  alt: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
  projectKey?: string;
  phase?: GalleryPhase;
};

type GalleryData = {
  items: GalleryItem[];
};

type GalleryItemInput = Omit<GalleryItem, "id"> & { id?: string };

const GALLERY_DATA_PATH = path.join(process.cwd(), "data", "work-gallery.json");
const GALLERY_UPLOAD_DIR = path.join(process.cwd(), "public", "uploads", "work-gallery");

function sortItems(items: GalleryItem[]) {
  return [...items].sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

async function ensureGalleryStorage() {
  await fs.mkdir(path.dirname(GALLERY_DATA_PATH), { recursive: true });
  await fs.mkdir(GALLERY_UPLOAD_DIR, { recursive: true });

  try {
    await fs.access(GALLERY_DATA_PATH);
  } catch {
    await fs.writeFile(GALLERY_DATA_PATH, JSON.stringify({ items: [] }, null, 2), "utf8");
  }
}

export async function readGalleryData() {
  await ensureGalleryStorage();

  const content = await fs.readFile(GALLERY_DATA_PATH, "utf8");
  const parsed = JSON.parse(content) as GalleryData;

  return {
    items: sortItems(
      (parsed.items || []).map((item) => ({
        ...item,
        subtitle: item.subtitle || "",
        description: item.description || "",
        projectKey: item.projectKey || "",
      })),
    ),
  };
}

export async function writeGalleryData(data: GalleryData) {
  await ensureGalleryStorage();
  const normalized = {
    items: sortItems(data.items).map((item) => ({
      ...item,
      subtitle: item.subtitle || "",
      description: item.description || "",
      projectKey: item.projectKey || "",
    })),
  };

  await fs.writeFile(GALLERY_DATA_PATH, JSON.stringify(normalized, null, 2), "utf8");
  return normalized;
}

export function normalizeGalleryItem(input: GalleryItemInput) {
  return {
    id: input.id || randomUUID(),
    section: input.section,
    title: input.title.trim(),
    subtitle: input.subtitle?.trim() || "",
    description: input.description?.trim() || "",
    alt: input.alt.trim(),
    imageUrl: input.imageUrl.trim(),
    order: Number.isFinite(input.order) ? input.order : 1,
    isActive: Boolean(input.isActive),
    projectKey: input.projectKey?.trim() || "",
    phase: input.phase || undefined,
  } satisfies GalleryItem;
}

export async function listGalleryItems(section?: GallerySection) {
  const data = await readGalleryData();
  return section ? data.items.filter((item) => item.section === section) : data.items;
}

export async function listPublicGalleryItems(section?: GallerySection) {
  const items = await listGalleryItems(section);
  return items.filter((item) => item.isActive);
}

export async function createGalleryItem(input: GalleryItemInput) {
  const data = await readGalleryData();
  const item = normalizeGalleryItem(input);
  data.items.push(item);
  await writeGalleryData(data);
  return item;
}

export async function updateGalleryItem(id: string, input: Partial<GalleryItemInput>) {
  const data = await readGalleryData();
  const index = data.items.findIndex((item) => item.id === id);

  if (index < 0) {
    throw new Error("Imagem não encontrada");
  }

  const current = data.items[index];
  const next = normalizeGalleryItem({
    ...current,
    ...input,
    id,
  });

  data.items[index] = next;
  await writeGalleryData(data);
  return next;
}

export async function deleteGalleryItem(id: string) {
  const data = await readGalleryData();
  const item = data.items.find((entry) => entry.id === id);

  if (!item) {
    throw new Error("Imagem não encontrada");
  }

  data.items = data.items.filter((entry) => entry.id !== id);
  await writeGalleryData(data);

  if (item.imageUrl.startsWith("/uploads/work-gallery/")) {
    const filePath = path.join(process.cwd(), "public", item.imageUrl.replace(/^\//, ""));
    await fs.unlink(filePath).catch(() => undefined);
  }

  return item;
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function extensionFromFileName(fileName: string) {
  const ext = path.extname(fileName).toLowerCase();
  return ext || ".jpg";
}

export async function saveGalleryFile(file: File, hint?: string) {
  await ensureGalleryStorage();

  const buffer = Buffer.from(await file.arrayBuffer());
  const baseName = sanitizeFileName(hint || file.name || "imagem");
  const fileName = `${Date.now()}-${baseName || "imagem"}${extensionFromFileName(file.name)}`;
  const filePath = path.join(GALLERY_UPLOAD_DIR, fileName);

  await fs.writeFile(filePath, buffer);

  return `/uploads/work-gallery/${fileName}`;
}

export async function replaceGalleryFile(previousUrl: string, file: File, hint?: string) {
  const nextUrl = await saveGalleryFile(file, hint);

  if (previousUrl.startsWith("/uploads/work-gallery/")) {
    const previousPath = path.join(process.cwd(), "public", previousUrl.replace(/^\//, ""));
    await fs.unlink(previousPath).catch(() => undefined);
  }

  return nextUrl;
}

export async function getHeroCarouselImages() {
  const items = await listPublicGalleryItems("hero");
  return items.map((item) => ({
    url: item.imageUrl,
    alt: item.alt,
    title: item.title,
    subtitle:
      item.subtitle || (item.phase ? `${phaseLabel(item.phase)} · Trabalhos reais` : "Trabalhos reais"),
  }));
}

export async function getShowcaseProjects() {
  const items = await listPublicGalleryItems("showcase");
  const groups = new Map<string, GalleryItem[]>();

  for (const item of items) {
    const key = item.projectKey || item.id;
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  }

  return [...groups.entries()].map(([key, group]) => {
    const orderedItems = sortItems(group);
    const first = orderedItems[0];

    return {
      id: key,
      title: first?.title || "Trabalho real",
      subtitle: first?.subtitle || "",
      description: first?.description || "",
      items: orderedItems,
    };
  });
}

export function phaseLabel(phase?: GalleryPhase) {
  if (phase === "before") return "Antes";
  if (phase === "during") return "Durante";
  if (phase === "after") return "Depois";
  return "";
}
