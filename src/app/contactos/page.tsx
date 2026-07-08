"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ContactosPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirecionar para o simulador após um breve delay
    const timer = setTimeout(() => {
      router.replace("/simulador");
    }, 100);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <p className="text-lg text-slate-600">A redirecionar para o simulador...</p>
      </div>
    </div>
  );
}
