"use client";

import { Info } from "lucide-react";

interface EntulhoDetailsProps {
  state?: "ensacado" | "chao" | "misto" | "bigbag" | "unknown";
  quantity?: string;
  quantidadeEnsacados?: string;
  quantidadePorEnsacar?: string;
  quantidadeBigBags?: string;
  onStateChange: (state: "ensacado" | "chao" | "misto" | "bigbag" | "unknown") => void;
  onQuantityChange: (quantity: string) => void;
  onQuantidadeEnsacadosChange?: (quantity: string) => void;
  onQuantidadePorEnsacarChange?: (quantity: string) => void;
  onQuantidadeBigBagsChange?: (quantity: string) => void;
}

export default function EntulhoDetails({
  state,
  quantity,
  quantidadeEnsacados,
  quantidadePorEnsacar,
  quantidadeBigBags,
  onStateChange,
  onQuantityChange,
  onQuantidadeEnsacadosChange,
  onQuantidadePorEnsacarChange,
  onQuantidadeBigBagsChange,
}: EntulhoDetailsProps) {
  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-5 space-y-3">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-500" />
          Estado do entulho
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">
          Confirme para preço correto
        </p>
      </div>

      {/* Estado do entulho */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
          <button
            type="button"
            onClick={() => onStateChange("ensacado")}
            className={`p-2 sm:p-2.5 rounded-lg border-2 transition-all text-center ${
              state === "ensacado"
                ? "border-blue-500 bg-white"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              Ensacado
            </p>
          </button>
          <button
            type="button"
            onClick={() => onStateChange("chao")}
            className={`p-2 sm:p-2.5 rounded-lg border-2 transition-all text-center ${
              state === "chao"
                ? "border-blue-500 bg-white"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              No chão
            </p>
          </button>
          <button
            type="button"
            onClick={() => onStateChange("misto")}
            className={`p-2 sm:p-2.5 rounded-lg border-2 transition-all text-center ${
              state === "misto"
                ? "border-blue-500 bg-white"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              Misto
            </p>
          </button>
          <button
            type="button"
            onClick={() => onStateChange("bigbag")}
            className={`p-2 sm:p-2.5 rounded-lg border-2 transition-all text-center ${
              state === "bigbag"
                ? "border-blue-500 bg-white"
                : "border-slate-200 bg-white hover:border-blue-300"
            }`}
          >
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              Big Bags
            </p>
          </button>
        </div>
      </div>

      {/* Quantidade - varia conforme o estado */}
      <div className="space-y-2">
        {state === "bigbag" ? (
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-slate-900">
              Quantidade de Big Bags
            </label>
            <input
              type="number"
              value={quantidadeBigBags || ""}
              onChange={(e) => onQuantidadeBigBagsChange?.(e.target.value)}
              placeholder="Ex: 6"
              className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg text-sm sm:text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
            <p className="text-xs text-slate-500">1 Big Bag = 40 sacos</p>
          </div>
        ) : state === "misto" ? (
          <>
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-medium text-slate-900">
                Já ensacados
              </label>
              <input
                type="number"
                value={quantidadeEnsacados || ""}
                onChange={(e) => onQuantidadeEnsacadosChange?.(e.target.value)}
                placeholder="Ex: 50"
                className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg text-sm sm:text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs sm:text-sm font-medium text-slate-900">
                Por ensacar
              </label>
              <input
                type="number"
                value={quantidadePorEnsacar || ""}
                onChange={(e) => onQuantidadePorEnsacarChange?.(e.target.value)}
                placeholder="Ex: 30"
                className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg text-sm sm:text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
              />
            </div>
          </>
        ) : (
          <div className="space-y-1.5">
            <label className="block text-xs sm:text-sm font-medium text-slate-900">
              Quantidade de sacos
            </label>
            <input
              type="number"
              value={quantity || ""}
              onChange={(e) => onQuantityChange(e.target.value)}
              placeholder="Ex: 100"
              className="w-full px-3 py-2.5 sm:py-2 border border-slate-300 rounded-lg text-sm sm:text-xs bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
}
