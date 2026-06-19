"use client";

const STEPS = [
  { id: 1, label: "Serviço" },
  { id: 2, label: "Acesso" },
  { id: 3, label: "Contacto" },
  { id: 4, label: "Estimativa" },
];

interface ProgressStepsProps {
  currentStep: number;
}

export default function ProgressSteps({ currentStep }: ProgressStepsProps) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = step.id < currentStep;
        const active = step.id === currentStep;
        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors ${
                  done
                    ? "bg-[#22C55E] border-[#22C55E] text-white"
                    : active
                    ? "bg-[#0487D9] border-[#0487D9] text-white"
                    : "bg-white border-[#CBD5E1] text-[#94A3B8]"
                }`}
              >
                {done ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-xs mt-1 font-medium ${
                  active ? "text-[#0487D9]" : done ? "text-[#22C55E]" : "text-[#94A3B8]"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-16 h-0.5 mb-4 mx-1 transition-colors ${
                  step.id < currentStep ? "bg-[#22C55E]" : "bg-[#E2E8F0]"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
