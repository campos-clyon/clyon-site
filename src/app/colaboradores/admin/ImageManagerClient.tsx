"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ImagePlus,
  Loader2,
  LogOut,
  RefreshCcw,
  Save,
  Trash2,
  UploadCloud,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export default function ColaboradorAdminClient() {
  const router = useRouter();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
      const response = await fetch("/api/media/gallery", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await readResponsePayload(response);

      if (!response.ok) {
        throw new Error(data.error || "Não foi possível carregar a galeria.");
      }

      setItems(data.items);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar a galeria.";
      setError(message);

      if (message.includes("Não autorizado") || message.includes("Acesso negado")) {
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
        throw new Error(data.error || "Não foi possível guardar a imagem.");
      }

      setMessage("Imagem adicionada com sucesso.");
      setNewItem(defaultForm);
      setNewFile(null);
      await loadGallery(token);
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
        throw new Error(data.error || "Não foi possível guardar as alterações.");
      }

      setReplacementFiles((current) => ({ ...current, [item.id]: null }));
      setMessage("Imagem atualizada com sucesso.");
      await loadGallery(token);
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
        throw new Error(data.error || "Não foi possível apagar a imagem.");
      }

      setMessage("Imagem apagada com sucesso.");
      await loadGallery(token);
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

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#03131d_0%,#062737_55%,#083344_100%)] px-4 py-24">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Painel de imagens
            </p>
            <h1 className="mt-3 text-4xl font-bold text-white">
              Gestor de media do site
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
              O carrossel do topo e a página de trabalhos passam a ler esta galeria.
              Pode carregar, substituir, ordenar, esconder e apagar imagens sem editar
              o código. As imagens enviadas no chat precisam de ser carregadas aqui
              pelo painel para entrarem no projeto.
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                const token = localStorage.getItem("colaborador_token");
                if (token) {
                  void loadGallery(token);
                }
              }}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button
              variant="outline"
              onClick={handleLogout}
              className="border-white/20 bg-white/5 text-white hover:bg-white/10"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {message && (
          <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        <div className="rounded-2xl border border-amber-300/30 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
          Em producao no Vercel, ficheiros guardados no disco local podem voltar ao estado anterior. Para uma troca
          estavel no site publicado, preencha tambem a URL publica da imagem.
        </div>

        <Card className="border-cyan-100/20 bg-white/95">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-950">
              <UploadCloud className="h-5 w-5 text-cyan-600" />
              Nova imagem
            </CardTitle>
            <CardDescription>
              Adicione uma nova imagem ao carrossel do topo ou à galeria de trabalhos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-5" onSubmit={handleCreate}>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                <div className="space-y-2">
                  <Label htmlFor="section">Secção</Label>
                  <select
                    id="section"
                    value={newItem.section}
                    onChange={(event) => updateNewItem("section", event.target.value as GallerySection)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  >
                    <option value="hero">Carrossel topo</option>
                    <option value="showcase">Galeria trabalhos</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={newItem.title}
                    onChange={(event) => updateNewItem("title", event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="alt">Texto alternativo</Label>
                  <Input
                    id="alt"
                    value={newItem.alt}
                    onChange={(event) => updateNewItem("alt", event.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="imageUrl">URL da imagem</Label>
                  <Input
                    id="imageUrl"
                    value={newItem.imageUrl}
                    onChange={(event) => updateNewItem("imageUrl", event.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">Ordem</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={newItem.order}
                    onChange={(event) => updateNewItem("order", event.target.value)}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className="space-y-2">
                  <Label htmlFor="subtitle">Subtítulo</Label>
                  <Input
                    id="subtitle"
                    value={newItem.subtitle}
                    onChange={(event) => updateNewItem("subtitle", event.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectKey">Grupo do trabalho</Label>
                  <Input
                    id="projectKey"
                    value={newItem.projectKey}
                    onChange={(event) => updateNewItem("projectKey", event.target.value)}
                    placeholder="ex: apartamento-lisboa"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phase">Fase</Label>
                  <select
                    id="phase"
                    value={newItem.phase}
                    onChange={(event) => updateNewItem("phase", event.target.value as GalleryPhase)}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                  >
                    <option value="">Sem fase</option>
                    <option value="before">Antes</option>
                    <option value="during">Durante</option>
                    <option value="after">Depois</option>
                  </select>
                </div>

                <label className="flex items-end gap-3 rounded-xl border border-slate-200 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={newItem.isActive}
                    onChange={(event) => updateNewItem("isActive", event.target.checked)}
                  />
                  <span className="text-sm font-medium text-slate-700">Ativa no site</span>
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <textarea
                  id="description"
                  value={newItem.description}
                  onChange={(event) => updateNewItem("description", event.target.value)}
                  className="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">Imagem do computador</Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewFile(event.target.files?.[0] || null)}
                />
              </div>

              <Button
                type="submit"
                disabled={saving || loading}
                className="bg-cyan-500 text-white hover:bg-cyan-600"
              >
                {saving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ImagePlus className="mr-2 h-4 w-4" />
                )}
                Guardar imagem
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center rounded-[30px] border border-white/10 bg-white/5 py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300" />
          </div>
        ) : (
          <div className="grid gap-6">
            <GallerySectionCard
              title={`Carrossel topo (${heroItems.length})`}
              description="Imagens que aparecem no carrossel do topo da homepage."
              items={heroItems}
              saving={saving}
              onChange={updateItem}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
              onReplacementChange={onReplacementChange}
            />
            <GallerySectionCard
              title={`Galeria trabalhos (${showcaseItems.length})`}
              description="Casos reais mostrados na página de trabalhos. Use o mesmo grupo para montar antes/depois."
              items={showcaseItems}
              saving={saving}
              onChange={updateItem}
              onSave={handleSaveItem}
              onDelete={handleDeleteItem}
              onReplacementChange={onReplacementChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}

type GallerySectionCardProps = {
  title: string;
  description: string;
  items: GalleryItem[];
  saving: boolean;
  onChange: (id: string, field: keyof GalleryItem, value: string | boolean | number) => void;
  onSave: (item: GalleryItem) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onReplacementChange: (id: string, event: ChangeEvent<HTMLInputElement>) => void;
};

function formatImageUrlLabel(value: string) {
  if (!value) return "Sem imagem definida";
  if (value.startsWith("data:image/")) {
    return "Imagem interna guardada no sistema";
  }
  if (value.length > 72) {
    return `${value.slice(0, 69)}...`;
  }
  return value;
}

function GallerySectionCard({
  title,
  description,
  items,
  saving,
  onChange,
  onSave,
  onDelete,
  onReplacementChange,
}: GallerySectionCardProps) {
  return (
    <Card className="border-cyan-100/20 bg-white/95">
      <CardHeader>
        <CardTitle className="text-slate-950">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm text-slate-500">
            Sem imagens nesta secção.
          </div>
        ) : (
          items.map((item) => (
            <article
              key={item.id}
              className="grid gap-5 rounded-[26px] border border-slate-200 p-4 lg:grid-cols-[260px_1fr]"
            >
              <div className="space-y-3">
                <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-slate-50">
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    className="aspect-[4/3] h-full w-full object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`replace-${item.id}`}>Substituir imagem</Label>
                  <Input
                    id={`replace-${item.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(event) => onReplacementChange(item.id, event)}
                  />
                </div>
                <p
                  className="max-w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs text-slate-500"
                  title={item.imageUrl.startsWith("data:image/") ? "Imagem interna guardada no sistema" : item.imageUrl}
                >
                  {formatImageUrlLabel(item.imageUrl)}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <div className="space-y-2">
                    <Label>Título</Label>
                    <Input
                      value={item.title}
                      onChange={(event) => onChange(item.id, "title", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subtítulo</Label>
                    <Input
                      value={item.subtitle || ""}
                      onChange={(event) => onChange(item.id, "subtitle", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Alt</Label>
                    <Input
                      value={item.alt}
                      onChange={(event) => onChange(item.id, "alt", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>URL da imagem</Label>
                    <Input
                      value={item.imageUrl}
                      onChange={(event) => onChange(item.id, "imageUrl", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ordem</Label>
                    <Input
                      type="number"
                      min="1"
                      value={String(item.order)}
                      onChange={(event) => onChange(item.id, "order", Number(event.target.value || 1))}
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Secção</Label>
                    <select
                      value={item.section}
                      onChange={(event) => onChange(item.id, "section", event.target.value as GallerySection)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                    >
                      <option value="hero">Carrossel topo</option>
                      <option value="showcase">Galeria trabalhos</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grupo do trabalho</Label>
                    <Input
                      value={item.projectKey || ""}
                      onChange={(event) => onChange(item.id, "projectKey", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fase</Label>
                    <select
                      value={item.phase || ""}
                      onChange={(event) => onChange(item.id, "phase", event.target.value)}
                      className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-950"
                    >
                      <option value="">Sem fase</option>
                      <option value="before">Antes</option>
                      <option value="during">Durante</option>
                      <option value="after">Depois</option>
                    </select>
                  </div>
                  <label className="flex items-end gap-3 rounded-xl border border-slate-200 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={item.isActive}
                      onChange={(event) => onChange(item.id, "isActive", event.target.checked)}
                    />
                    <span className="text-sm font-medium text-slate-700">Ativa no site</span>
                  </label>
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <textarea
                    value={item.description || ""}
                    onChange={(event) => onChange(item.id, "description", event.target.value)}
                    className="min-h-24 w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-950"
                  />
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => void onSave(item)}
                    disabled={saving}
                    className="bg-cyan-500 text-white hover:bg-cyan-600"
                  >
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar alterações
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void onDelete(item.id)}
                    disabled={saving}
                    className="border-red-200 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
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
