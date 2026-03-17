"use client";

import type { ReactNode } from "react";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Images,
  LayoutGrid,
  Loader2,
  LogOut,
  RefreshCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type GallerySection = "hero" | "showcase";
type GalleryPhase = "" | "before" | "during" | "after";

type GalleryItem = {
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

type GalleryFormState = {
  section: GallerySection;
  title: string;
  subtitle: string;
  description: string;
  alt: string;
  imageUrl: string;
  order: string;
  projectKey: string;
  phase: GalleryPhase;
  isActive: boolean;
};

const defaultForm: GalleryFormState = {
  section: "hero",
  title: "",
  subtitle: "",
  description: "",
  alt: "",
  imageUrl: "",
  order: "1",
  projectKey: "",
  phase: "",
  isActive: true,
};

const sectionMeta: Record<
  GallerySection,
  { label: string; description: string; accent: string; empty: string }
> = {
  hero: {
    label: "Carrossel topo",
    description: "Imagens do destaque principal da homepage.",
    accent: "from-cyan-500/15 to-sky-500/5",
    empty: "Ainda não existem imagens no carrossel topo.",
  },
  showcase: {
    label: "Galeria de trabalhos",
    description: "Casos reais da página de trabalhos, com grupos e fases.",
    accent: "from-emerald-500/15 to-cyan-500/5",
    empty: "Ainda não existem trabalhos reais nesta galeria.",
  },
};

async function readResponsePayload(response: Response) {
  const text = await response.text();

  if (!text) {
    return {};
  }

  try {
    return JSON.parse(text);
  } catch {
    return { error: text };
  }
}

function phaseLabel(phase?: GalleryPhase) {
  if (phase === "before") return "Antes";
  if (phase === "during") return "Durante";
  if (phase === "after") return "Depois";
  return "Sem fase";
}

function previewLabel(value: string) {
  if (!value) return "Sem imagem definida";
  if (value.startsWith("data:image/")) return "Imagem interna guardada no sistema";
  if (value.length > 84) return `${value.slice(0, 81)}...`;
  return value;
}

export default function ImageManagerClient() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState<GallerySection>("hero");
  const [newItem, setNewItem] = useState<GalleryFormState>(defaultForm);
  const [newFile, setNewFile] = useState<File | null>(null);
  const [replacementFiles, setReplacementFiles] = useState<Record<string, File | null>>({});

  useEffect(() => {
    const token = localStorage.getItem("colaborador_token");

    if (!token) {
      router.push("/colaboradores");
      return;
    }

    void loadGallery(token);
  }, [router]);

  async function loadGallery(token: string) {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/media/gallery?_=${Date.now()}`, {
        cache: "no-store",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel carregar a galeria.");
      }

      setItems(data.items || []);
    } catch (err) {
      const nextError = err instanceof Error ? err.message : "Erro ao carregar a galeria.";
      setError(nextError);

      if (nextError.includes("Nao autorizado") || nextError.includes("Acesso negado")) {
        localStorage.removeItem("colaborador_token");
        localStorage.removeItem("colaborador_nome");
        localStorage.removeItem("colaborador_id");
        localStorage.removeItem("colaborador_isAdmin");
        router.push("/colaboradores");
      }
    } finally {
      setLoading(false);
    }
  }

  async function reloadAfterMutation(token: string) {
    router.refresh();
    await loadGallery(token);
  }

  async function handleRefresh() {
    const token = localStorage.getItem("colaborador_token");

    if (!token) {
      router.push("/colaboradores");
      return;
    }

    setRefreshing(true);
    setMessage("");
    setError("");

    try {
      await reloadAfterMutation(token);
      setMessage("Galeria atualizada.");
    } finally {
      setRefreshing(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("colaborador_token");
    localStorage.removeItem("colaborador_nome");
    localStorage.removeItem("colaborador_id");
    localStorage.removeItem("colaborador_isAdmin");
    router.push("/colaboradores");
  }

  function updateNewItem<Field extends keyof GalleryFormState>(field: Field, value: GalleryFormState[Field]) {
    setNewItem((current) => ({ ...current, [field]: value }));
  }

  function updateItem(id: string, field: keyof GalleryItem, value: string | boolean | number) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = localStorage.getItem("colaborador_token");

    if (!token) {
      router.push("/colaboradores");
      return;
    }

    if (!newFile && !newItem.imageUrl.trim()) {
      setError("Escolha uma imagem ou indique um URL publico.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      let response: Response;

      if (newFile) {
        const formData = new FormData();
        formData.append("file", newFile);
        formData.append("section", newItem.section);
        formData.append("title", newItem.title);
        formData.append("subtitle", newItem.subtitle);
        formData.append("description", newItem.description);
        formData.append("alt", newItem.alt);
        formData.append("order", newItem.order || "1");
        formData.append("projectKey", newItem.projectKey);
        formData.append("phase", newItem.phase);
        formData.append("isActive", String(newItem.isActive));

        response = await fetch("/api/media/gallery", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        response = await fetch("/api/media/gallery", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: newItem.section,
            title: newItem.title,
            subtitle: newItem.subtitle,
            description: newItem.description,
            alt: newItem.alt,
            imageUrl: newItem.imageUrl,
            order: Number(newItem.order || "1"),
            projectKey: newItem.projectKey,
            phase: newItem.phase,
            isActive: newItem.isActive,
          }),
        });
      }

      const data = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel guardar a imagem.");
      }

      setMessage("Imagem adicionada com sucesso.");
      setNewItem(defaultForm);
      setNewFile(null);
      setActiveSection(newItem.section);
      await reloadAfterMutation(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar imagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveItem(item: GalleryItem) {
    const token = localStorage.getItem("colaborador_token");

    if (!token) {
      router.push("/colaboradores");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const replacementFile = replacementFiles[item.id];
      let response: Response;

      if (replacementFile) {
        const formData = new FormData();
        formData.append("file", replacementFile);
        formData.append("section", item.section);
        formData.append("title", item.title);
        formData.append("subtitle", item.subtitle || "");
        formData.append("description", item.description || "");
        formData.append("alt", item.alt);
        formData.append("order", String(item.order));
        formData.append("projectKey", item.projectKey || "");
        formData.append("phase", item.phase || "");
        formData.append("isActive", String(item.isActive));

        response = await fetch(`/api/media/gallery/${item.id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        response = await fetch(`/api/media/gallery/${item.id}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            section: item.section,
            title: item.title,
            subtitle: item.subtitle || "",
            description: item.description || "",
            alt: item.alt,
            imageUrl: item.imageUrl,
            order: item.order,
            projectKey: item.projectKey || "",
            phase: item.phase || "",
            isActive: item.isActive,
          }),
        });
      }

      const data = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel guardar as alteracoes.");
      }

      setReplacementFiles((current) => ({ ...current, [item.id]: null }));
      setMessage("Imagem atualizada com sucesso.");
      await reloadAfterMutation(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao atualizar imagem.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteItem(id: string) {
    const token = localStorage.getItem("colaborador_token");

    if (!token) {
      router.push("/colaboradores");
      return;
    }

    if (!window.confirm("Apagar esta imagem da galeria?")) {
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/media/gallery/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(data.error || "Nao foi possivel apagar a imagem.");
      }

      setMessage("Imagem apagada com sucesso.");
      await reloadAfterMutation(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao apagar imagem.");
    } finally {
      setSaving(false);
    }
  }

  function onReplacementChange(id: string, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] || null;
    setReplacementFiles((current) => ({ ...current, [id]: file }));
  }

  const heroItems = items.filter((item) => item.section === "hero");
  const showcaseItems = items.filter((item) => item.section === "showcase");
  const activeCount = items.filter((item) => item.isActive).length;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,#d9fbff_0%,#f7fbfc_38%,#eef6f8_100%)] px-4 py-10 md:px-6 md:py-12">
      <div className="mx-auto max-w-7xl space-y-6">
        <Card className="overflow-hidden border-cyan-100 bg-white shadow-[0_30px_90px_-55px_rgba(14,116,144,0.45)]">
          <CardContent className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div className="space-y-4">
              <div className="inline-flex rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Painel de imagens
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl">
                  Gestor de media mais simples e rapido
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 md:text-base">
                  O carrossel da homepage e a galeria de trabalhos leem esta lista.
                  Pode carregar, substituir, ordenar, esconder e apagar imagens sem editar o codigo.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Button
                variant="outline"
                onClick={() => void handleRefresh()}
                disabled={loading || refreshing || saving}
              >
                <RefreshCcw className={refreshing ? "animate-spin" : ""} />
                {refreshing ? "A atualizar..." : "Atualizar"}
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut />
                Sair
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard icon={LayoutGrid} label="Carrossel topo" value={heroItems.length} />
          <StatCard icon={Images} label="Galeria de trabalhos" value={showcaseItems.length} />
          <StatCard icon={UploadCloud} label="Imagens ativas" value={activeCount} />
        </div>

        {error ? <Feedback tone="error">{error}</Feedback> : null}
        {message ? <Feedback tone="success">{message}</Feedback> : null}

        <Feedback tone="warning">
          Em producao no Vercel, ficheiros guardados apenas no disco local podem voltar ao estado anterior.
          Para uma troca estavel no site publicado, use o upload do painel ou preencha tambem a URL publica da imagem.
        </Feedback>

        <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
          <Card className="border-cyan-100 bg-white xl:sticky xl:top-28">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-950">
                <ImagePlus className="h-5 w-5 text-cyan-600" />
                Nova imagem
              </CardTitle>
              <CardDescription>
                Adicione uma nova entrada ao carrossel do topo ou aos trabalhos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleCreate}>
                <div className="space-y-2">
                  <Label htmlFor="section">Secao</Label>
                  <select
                    id="section"
                    value={newItem.section}
                    onChange={(event) => updateNewItem("section", event.target.value as GallerySection)}
                    className="flex h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950"
                  >
                    <option value="hero">Carrossel topo</option>
                    <option value="showcase">Galeria de trabalhos</option>
                  </select>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <Field label="Titulo" value={newItem.title} onChange={(value) => updateNewItem("title", value)} required />
                  <Field label="Subtitulo" value={newItem.subtitle} onChange={(value) => updateNewItem("subtitle", value)} />
                  <Field label="Alt" value={newItem.alt} onChange={(value) => updateNewItem("alt", value)} required />
                  <Field label="URL da imagem" value={newItem.imageUrl} onChange={(value) => updateNewItem("imageUrl", value)} placeholder="https://..." />
                  <Field label="Ordem" value={newItem.order} onChange={(value) => updateNewItem("order", value)} type="number" min="1" />
                  <Field label="Grupo do trabalho" value={newItem.projectKey} onChange={(value) => updateNewItem("projectKey", value)} placeholder="ex: recolha-monos" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phase">Fase</Label>
                  <select
                    id="phase"
                    value={newItem.phase}
                    onChange={(event) => updateNewItem("phase", event.target.value as GalleryPhase)}
                    className="flex h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950"
                  >
                    <option value="">Sem fase</option>
                    <option value="before">Antes</option>
                    <option value="during">Durante</option>
                    <option value="after">Depois</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descricao</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(event) => updateNewItem("description", event.target.value)}
                    className="min-h-28 rounded-[18px] border-slate-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Imagem do computador</Label>
                  <Input
                    id="file"
                    type="file"
                    accept="image/*"
                    onChange={(event) => setNewFile(event.target.files?.[0] || null)}
                    className="h-12 rounded-[18px] border-slate-200 bg-white"
                  />
                  <p className="text-xs text-slate-500">
                    Upload direto evita depender de cache antigo da imagem anterior.
                  </p>
                </div>

                <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={newItem.isActive}
                    onChange={(event) => updateNewItem("isActive", event.target.checked)}
                  />
                  Ativa no site
                </label>

                <Button type="submit" disabled={saving || loading} className="w-full">
                  {saving ? <Loader2 className="animate-spin" /> : <UploadCloud />}
                  Guardar imagem
                </Button>
              </form>
            </CardContent>
          </Card>

          <Tabs value={activeSection} onValueChange={(value) => setActiveSection(value as GallerySection)} className="gap-4">
            <TabsList className="h-auto w-full justify-start rounded-[24px] border border-cyan-100 bg-white p-2">
              <TabsTrigger value="hero" className="min-h-11 rounded-[18px] px-4">
                Carrossel topo ({heroItems.length})
              </TabsTrigger>
              <TabsTrigger value="showcase" className="min-h-11 rounded-[18px] px-4">
                Galeria de trabalhos ({showcaseItems.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hero">
              <GallerySectionPanel
                title={sectionMeta.hero.label}
                description={sectionMeta.hero.description}
                accent={sectionMeta.hero.accent}
                empty={sectionMeta.hero.empty}
                items={heroItems}
                saving={saving}
                onChange={updateItem}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                onReplacementChange={onReplacementChange}
              />
            </TabsContent>

            <TabsContent value="showcase">
              <GallerySectionPanel
                title={sectionMeta.showcase.label}
                description={sectionMeta.showcase.description}
                accent={sectionMeta.showcase.accent}
                empty={sectionMeta.showcase.empty}
                items={showcaseItems}
                saving={saving}
                onChange={updateItem}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                onReplacementChange={onReplacementChange}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

type StatCardProps = {
  icon: typeof LayoutGrid;
  label: string;
  value: number;
};

function StatCard({ icon: Icon, label, value }: StatCardProps) {
  return (
    <Card className="border-cyan-100 bg-white">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

type FeedbackProps = {
  tone: "success" | "error" | "warning";
  children: ReactNode;
};

function Feedback({ tone, children }: FeedbackProps) {
  const styles = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-red-200 bg-red-50 text-red-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  }[tone];

  return <div className={`rounded-[22px] border px-4 py-3 text-sm ${styles}`}>{children}</div>;
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  min?: string;
  required?: boolean;
};

function Field({ label, value, onChange, placeholder, type = "text", min, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        type={type}
        min={min}
        required={required}
        className="h-12 rounded-[18px] border-slate-200 bg-white"
      />
    </div>
  );
}

type GallerySectionPanelProps = {
  title: string;
  description: string;
  accent: string;
  empty: string;
  items: GalleryItem[];
  saving: boolean;
  onChange: (id: string, field: keyof GalleryItem, value: string | boolean | number) => void;
  onSave: (item: GalleryItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReplacementChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
};

function GallerySectionPanel({
  title,
  description,
  accent,
  empty,
  items,
  saving,
  onChange,
  onSave,
  onDelete,
  onReplacementChange,
}: GallerySectionPanelProps) {
  return (
    <Card className="overflow-hidden border-cyan-100 bg-white">
      <div className={`border-b border-cyan-100 bg-gradient-to-r ${accent} px-6 py-5`}>
        <h2 className="text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <CardContent className="space-y-5 p-6">
        {items.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
            {empty}
          </div>
        ) : (
          items.map((item) => (
            <article key={item.id} className="grid gap-5 rounded-[28px] border border-slate-200 p-5 lg:grid-cols-[260px_minmax(0,1fr)]">
              <div className="space-y-3">
                <div className="overflow-hidden rounded-[22px] border border-slate-200 bg-slate-50">
                  <img src={item.imageUrl} alt={item.alt} className="aspect-[4/3] h-full w-full object-cover" />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-cyan-200 bg-cyan-50 text-cyan-700">{item.section === "hero" ? "Carrossel" : "Trabalho"}</Badge>
                  <Badge variant="outline" className="border-slate-200 bg-slate-50 text-slate-600">{phaseLabel(item.phase)}</Badge>
                  <Badge variant="outline" className={item.isActive ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}>
                    {item.isActive ? "Ativa no site" : "Oculta"}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`replace-${item.id}`}>Substituir imagem</Label>
                  <Input id={`replace-${item.id}`} type="file" accept="image/*" onChange={(event) => onReplacementChange(item.id, event)} className="h-12 rounded-[18px] border-slate-200 bg-white" />
                </div>
                <p className="text-xs text-slate-500" title={item.imageUrl}>{previewLabel(item.imageUrl)}</p>
              </div>

              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="Titulo" value={item.title} onChange={(value) => onChange(item.id, "title", value)} />
                  <Field label="Subtitulo" value={item.subtitle || ""} onChange={(value) => onChange(item.id, "subtitle", value)} />
                  <Field label="Alt" value={item.alt} onChange={(value) => onChange(item.id, "alt", value)} />
                  <Field label="Ordem" value={String(item.order)} onChange={(value) => onChange(item.id, "order", Number(value || 1))} type="number" min="1" />
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <Field label="URL da imagem" value={item.imageUrl} onChange={(value) => onChange(item.id, "imageUrl", value)} />
                  <Field label="Grupo do trabalho" value={item.projectKey || ""} onChange={(value) => onChange(item.id, "projectKey", value)} />

                  <div className="space-y-2">
                    <Label>Secao</Label>
                    <select
                      value={item.section}
                      onChange={(event) => onChange(item.id, "section", event.target.value as GallerySection)}
                      className="flex h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950"
                    >
                      <option value="hero">Carrossel topo</option>
                      <option value="showcase">Galeria de trabalhos</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fase</Label>
                    <select
                      value={item.phase || ""}
                      onChange={(event) => onChange(item.id, "phase", event.target.value)}
                      className="flex h-12 w-full rounded-[18px] border border-slate-200 bg-white px-4 text-sm text-slate-950"
                    >
                      <option value="">Sem fase</option>
                      <option value="before">Antes</option>
                      <option value="during">Durante</option>
                      <option value="after">Depois</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Descricao</Label>
                  <Textarea
                    value={item.description || ""}
                    onChange={(event) => onChange(item.id, "description", event.target.value)}
                    className="min-h-28 rounded-[18px] border-slate-200 bg-white"
                  />
                </div>

                <label className="flex items-center gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={item.isActive}
                    onChange={(event) => onChange(item.id, "isActive", event.target.checked)}
                  />
                  Ativa no site
                </label>

                <div className="flex flex-wrap gap-3">
                  <Button type="button" onClick={() => void onSave(item)} disabled={saving}>
                    {saving ? <Loader2 className="animate-spin" /> : <Save />}
                    Guardar alteracoes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => void onDelete(item.id)} disabled={saving} className="border-red-200 text-red-700 hover:bg-red-50 hover:text-red-700">
                    <Trash2 />
                    Apagar
                  </Button>
                </div>
              </div>
            </article>
          ))
        )}
      </CardContent>
    </Card>
  );
}
