"use client";

import { Check } from "lucide-react";
import type { ServiceType } from "../types";

interface Service {
  id: ServiceType;
  label: string;
  icon: string;
  description?: string;
}

interface ServiceTypeCardsProps {
  services: Service[];
  selected?: ServiceType;
  onSelect: (serviceType: ServiceType) => void;
}

export default function ServiceTypeCards({
  services,
  selected,
  onSelect,
}: ServiceTypeCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {services.map((service) => {
        const isSelected = selected === service.id;
        return (
          <button
            key={service.id}
            onClick={() => onSelect(service.id)}
            className={`relative p-5 rounded-2xl border transition-all duration-200 ${
              isSelected
                ? "border-blue-500 bg-blue-50 shadow-md"
                : "border-slate-200 bg-white hover:border-blue-300 shadow-sm"
            }`}
          >
            {/* Check mark corner */}
            {isSelected && (
              <div className="absolute top-2 right-2">
                <Check className="w-5 h-5 text-blue-600" strokeWidth={3} />
              </div>
            )}

            {/* Icon */}
            <div className="text-3xl mb-3">{service.icon}</div>

            {/* Label */}
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              {service.label}
            </p>

            {/* Optional description */}
            {service.description && (
              <p className="text-xs text-slate-500 mt-1">{service.description}</p>
            )}
          </button>
        );
      })}
    </div>
  );
}
