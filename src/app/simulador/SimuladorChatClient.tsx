"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Loader2, Image as ImageIcon, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  images?: { url: string; file: File }[];
  timestamp: Date;
};

export default function SimuladorChatClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [images, setImages] = useState<{ url: string; file: File }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mensagem inicial da IA
  useEffect(() => {
    const initialMessage: Message = {
      id: "initial",
      role: "assistant",
      content:
        "Olá! Bem-vindo ao simulador de preços da Clyon. Eu sou o seu orçamentista virtual e vou ajudá-lo a obter uma estimativa de preço para a sua recolha. Para começar, pode descrever-me o que precisa de recolher? Se tiver fotos, também pode carregá-las para me dar uma ideia melhor.",
      timestamp: new Date(),
    };
    setMessages([initialMessage]);
  }, []);

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Por favor, selecione apenas ficheiros de imagem");
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const url = event.target?.result as string;
        setImages((prev) => [...prev, { url, file }]);
      };
      reader.readAsDataURL(file);
    });

    e.currentTarget.value = "";
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = async () => {
    if (!input.trim() && images.length === 0) {
      setError("Por favor, escreva uma mensagem ou adicione uma imagem");
      return;
    }

    setError("");

    // Adicionar mensagem do utilizador
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: input || "(Imagem enviada)",
      images: images.length > 0 ? images : undefined,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImages([]);
    setLoading(true);

    try {
      // Converter imagens para base64
      const messageParts = [
        {
          text: input,
        },
      ];

      for (const img of images) {
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.readAsDataURL(img.file);
        });

        messageParts.push({
          inlineData: {
            mimeType: img.file.type,
            data: base64,
          },
        });
      }

      // Converter histórico de mensagens para enviar à API
      const messagesForAPI = messages.map((msg) => ({
        role: msg.role,
        content:
          msg.role === "user" && msg.images
            ? [
                { text: msg.content },
                ...msg.images.map((img) => ({
                  inlineData: {
                    mimeType: img.file.type,
                    data: img.url.split(",")[1],
                  },
                })),
              ]
            : msg.content,
      }));

      // Adicionar nova mensagem do utilizador
      messagesForAPI.push({
        role: "user",
        content: messageParts,
      });

      const response = await fetch("/api/chat-simulador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesForAPI }),
      });

      if (!response.ok) {
        throw new Error("Falha ao obter resposta");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.message,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erro ao enviar mensagem"
      );
      console.error("Chat error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] flex-col bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header */}
      <div className="border-b border-white/10 bg-white/[0.02] px-6 py-4 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">
            Simulador de Preços
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Chat com o orçamentista da Clyon
          </p>
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              {message.role === "assistant" && (
                <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                  <div className="h-5 w-5 rounded-full bg-cyan-500" />
                </div>
              )}

              <div
                className={cn(
                  "max-w-2xl rounded-2xl px-4 py-3",
                  message.role === "user"
                    ? "bg-cyan-600 text-white"
                    : "bg-white/10 border border-white/20 text-slate-100"
                )}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>

                {message.images && message.images.length > 0 && (
                  <div className="mt-3 grid gap-2 grid-cols-2">
                    {message.images.map((img, idx) => (
                      <img
                        key={idx}
                        src={img.url}
                        alt={`Imagem ${idx + 1}`}
                        className="rounded-lg max-h-48 object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>

              {message.role === "user" && (
                <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-slate-700 border border-slate-600 flex items-center justify-center">
                  <div className="text-xs text-slate-300 font-semibold">U</div>
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="h-8 w-8 flex-shrink-0 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
                <div className="h-5 w-5 rounded-full bg-cyan-500" />
              </div>
              <div className="bg-white/10 border border-white/20 rounded-2xl px-4 py-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
                <span className="text-sm text-slate-400">A escrever...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-white/10 bg-white/[0.02] px-6 py-6 backdrop-blur">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2">
              <p className="text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Preview de imagens */}
          {images.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative rounded-lg overflow-hidden border border-white/20"
                >
                  <img
                    src={img.url}
                    alt={`Preview ${idx + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input de mensagem */}
          <div className="flex gap-2">
            <div className="flex-1 flex gap-2 bg-white/[0.05] border border-white/10 rounded-full px-4 py-3 focus-within:border-cyan-500/50 transition">
              <Input
                type="text"
                placeholder="Descreva o que precisa recolher..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
                className="flex-1 bg-transparent border-0 focus-visible:ring-0 placeholder-slate-500 text-white"
              />

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageSelect}
                disabled={loading}
                className="hidden"
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="p-2 text-slate-400 hover:text-cyan-400 transition disabled:opacity-50"
                title="Carregar imagem"
              >
                <ImageIcon className="h-5 w-5" />
              </button>
            </div>

            <Button
              onClick={handleSendMessage}
              disabled={loading || (!input.trim() && images.length === 0)}
              className="rounded-full bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-6"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
