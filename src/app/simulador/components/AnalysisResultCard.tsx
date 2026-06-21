"use client";

import type { EstimateResult } from "../types";
import { AlertCircle, CheckCircle, TrendingUp } from "lucide-react";

interface AnalysisResultCardProps {
  analysis: EstimateResult;
  isLoading?: boolean;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export default function AnalysisResultCard({
  analysis,
  isLoading = false,
  onConfirm,
  isSubmitting = false,
}: AnalysisResultCardProps) {
  const statusConfig = {
    estimated: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      title: "Orçamento Disponível",
      subtitle: "Preço estimado com base nos dados fornecidos",
    },
    onsite_required: {
      icon: AlertCircle,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      title: "Análise no Local Recomendada",
      subtitle: "Precisamos de uma análise no local para confirmar o preço",
    },
    needs_more_info: {
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      title: "Mais Informações Necessárias",
      subtitle: "Faltam dados para criar um orçamento preciso",
    },
  };

  const config = statusConfig[analysis.status];
  const StatusIcon = config.icon;

  const difficultyLabel = {
    1: "Muito Simples",
    2: "Simples",
    3: "Moderado",
    4: "Complexo",
    5: "Muito Complexo",
  };

  return (
    <div className={`rounded-2xl border-2 ${config.borderColor} ${config.bgColor} p-6 space-y-6`}>
      {/* Header */}
      <div className="flex items-start gap-3">
        <StatusIcon className={`w-6 h-6 ${config.color} flex-shrink-0 mt-1`} />
        <div>
          <h3 className={`text-lg font-semibold ${config.color}`}>{config.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{config.subtitle}</p>
        </div>
      </div>

      {/* Price Section (se estimated) */}
      {analysis.status === "estimated" && analysis.estimatedPriceWithVat && (
        <div className="bg-white rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-600">Preço Estimado</p>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">
              €{analysis.estimatedPriceWithVat.toFixed(2)}
            </span>
            <span className="text-sm text-gray-500">+ IVA incluído</span>
          </div>
          {analysis.estimatedPriceWithoutVat && analysis.vatAmount && (
            <div className="text-xs text-gray-600 pt-2 border-t border-gray-200">
              <p>Sem IVA: €{analysis.estimatedPriceWithoutVat.toFixed(2)}</p>
              <p>IVA (23%): €{analysis.vatAmount.toFixed(2)}</p>
            </div>
          )}
        </div>
      )}

      {/* Difficulty Level */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <p className="text-sm text-gray-600">Nível de Dificuldade</p>
        <div className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5 text-cyan-600" />
          <span className="font-semibold text-gray-900">
            {difficultyLabel[analysis.difficultyLevel]} ({analysis.difficultyLevel}/5)
          </span>
        </div>
        <div className="flex gap-1 mt-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${
                i < analysis.difficultyLevel ? "bg-cyan-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-xl p-4 space-y-2">
        <p className="text-sm text-gray-600">Resumo da Análise</p>
        <p className="text-gray-900 text-sm leading-relaxed">{analysis.summary}</p>
      </div>

      {/* Assumptions */}
      {analysis.assumptions && analysis.assumptions.length > 0 && (
        <div className="bg-white rounded-xl p-4 space-y-2">
          <p className="text-sm text-gray-600">Pressupostos Considerados</p>
          <ul className="space-y-1.5">
            {analysis.assumptions.map((assumption, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className="text-cyan-600 font-bold">•</span>
                <span>{assumption}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Missing Fields Warning */}
      {analysis.missingFields && analysis.missingFields.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
          <p className="text-sm font-medium text-amber-900">Campos que Faltam</p>
          <ul className="space-y-1">
            {analysis.missingFields.map((field, idx) => (
              <li key={idx} className="text-sm text-amber-800 flex gap-2">
                <span className="text-amber-600">•</span>
                <span>{field}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Button */}
      {analysis.status === "estimated" && (
        <button
          onClick={onConfirm}
          disabled={isSubmitting || isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {isSubmitting ? "A enviar pedido..." : "Enviar pedido para análise"}
        </button>
      )}

      {analysis.status === "onsite_required" && (
        <button
          onClick={onConfirm}
          disabled={isSubmitting || isLoading}
          className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors"
        >
          {isSubmitting ? "A agendar análise..." : "Agendar análise no local"}
        </button>
      )}

      {analysis.status === "needs_more_info" && (
        <p className="text-sm text-center text-gray-600">
          Por favor, forneça mais informações para obter um orçamento preciso.
        </p>
      )}
    </div>
  );
}
