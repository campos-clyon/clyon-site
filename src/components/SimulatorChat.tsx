"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2, Send } from "lucide-react";
import type { OrderData } from "@/lib/simulator-chat-utils";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface SimulatorChatProps {
  currentOrder: OrderData;
  onOrderUpdate: (orderPatch: Partial<OrderData>) => void;
  onShouldOpenForm?: (shouldOpen: boolean) => void;
}

export default function SimulatorChat({
  currentOrder,
  onOrderUpdate,
  onShouldOpenForm,
}: SimulatorChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou o assistente virtual da CLYON. Para fazer um orçamento, preciso de algumas informações sobre o seu pedido. Pode começar por me contar o que precisa?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inputValue.trim() || isLoading) return;

    // Adiciona mensagem do utilizador
    const userMessage = inputValue.trim();
    setInputValue("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      // Chama a API de chat
      const response = await fetch("/api/simulador/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          currentOrder,
        }),
      });

      if (!response.ok) {
        throw new Error("Erro ao processar mensagem");
      }

      const data = await response.json();

      // Atualiza os dados do pedido com os dados extraídos
      if (data.extractedData && Object.keys(data.extractedData).length > 0) {
        onOrderUpdate(data.extractedData);
      }

      // Adiciona resposta do assistente
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }]);

      // Notifica se o formulário deve abrir
      if (data.shouldOpenContactForm && onShouldOpenForm) {
        onShouldOpenForm(true);
      }
    } catch (error) {
      console.error("[SimulatorChat] Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Desculpe, houve um erro ao processar sua mensagem. Pode tentar novamente?",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full bg-white shadow-sm border border-slate-200 flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-cyan-700 p-4 rounded-t-lg">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="text-lg">💬</span>
          Assistente de Orçamento
        </h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-96">
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-xs px-4 py-2 rounded-lg ${
                message.role === "user"
                  ? "bg-cyan-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-900 rounded-bl-none"
              }`}
            >
              <p className="text-sm leading-relaxed">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg rounded-bl-none flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm">Processando...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="border-t border-slate-200 p-4 bg-slate-50 rounded-b-lg"
      >
        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Digite sua mensagem..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            className="flex-1 text-sm border border-slate-300 focus:ring-cyan-600"
          />
          <Button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </Card>
  );
}
