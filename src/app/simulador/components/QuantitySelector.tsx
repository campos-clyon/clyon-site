"use client";

interface QuantitySelectorProps {
  serviceType: string;
  quantity?: string;
  onQuantityChange: (quantity: string) => void;
}

export default function QuantitySelector({
  serviceType,
  quantity = "",
  onQuantityChange,
}: QuantitySelectorProps) {
  // Serviços que precisam de quantidade
  const needsQuantity = [
    "recolha_moveis",
    "recolha_monos",
    "recolha_sofas",
    "recolha_entulho",
  ];

  if (!needsQuantity.includes(serviceType)) {
    return null;
  }

  const getLabel = () => {
    switch (serviceType) {
      case "recolha_moveis":
        return "Número de peças de mobília";
      case "recolha_monos":
        return "Número de monos";
      case "recolha_sofas":
        return "Número de sofás";
      case "recolha_entulho":
        return "Número de sacos de entulho";
      default:
        return "Quantidade";
    }
  };

  const getPlaceholder = () => {
    switch (serviceType) {
      case "recolha_moveis":
        return "Ex: 3";
      case "recolha_monos":
        return "Ex: 2";
      case "recolha_sofas":
        return "Ex: 1";
      case "recolha_entulho":
        return "Ex: 50";
      default:
        return "Ex: 1";
    }
  };

  const getHint = () => {
    switch (serviceType) {
      case "recolha_entulho":
        return "Indique a quantidade aproximada de sacos (1 saco = ±20-30L)";
      case "recolha_moveis":
        return "Inclua mesas, cadeiras, guarda-roupa, camas, etc.";
      case "recolha_sofas":
        return "Indique número de sofás ou camas estofadas";
      case "recolha_monos":
        return "Indique número de mono blocos / blocos de barro";
      default:
        return "";
    }
  };

  return (
    <div className="bg-slate-50 rounded-lg border border-slate-200 p-3 sm:p-4 space-y-2">
      <label className="block text-sm font-medium text-slate-900">
        {getLabel()}
      </label>
      <input
        type="number"
        min="1"
        value={quantity}
        onChange={(e) => onQuantityChange(e.target.value)}
        placeholder={getPlaceholder()}
        className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors"
      />
      {getHint() && (
        <p className="text-xs text-slate-600 mt-1.5">{getHint()}</p>
      )}
    </div>
  );
}
