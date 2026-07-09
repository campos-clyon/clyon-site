export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { authOptions } from "@/auth";
import { AnimatedBackground } from "./AnimatedBackground";
import { ErrorHandler } from "./ErrorHandler";

export const metadata: Metadata = {
  title: "Entrar na tua conta | CLYON",
  description: "Acede à tua conta CLYON para acompanhar os teus pedidos.",
  robots: { index: false, follow: false },
};

export default async function EntrarPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect("/conta");

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Fixed animated background - covers entire viewport */}
      <AnimatedBackground />
      
      {/* Centered login card container - fixed positioning for clarity */}
      <div className="relative z-10 w-full max-w-md flex items-center justify-center px-4 py-6 sm:px-6">
        <Suspense fallback={null}>
          <ErrorHandler />
        </Suspense>
      </div>
    </div>
  );
}
