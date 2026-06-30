import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptionsCliente } from "@/auth-cliente";
import EntrarClienteForm from "./EntrarClienteForm";

export const metadata: Metadata = {
  title: "Entrar na tua conta | CLYON",
  description: "Acede à tua conta CLYON para acompanhar os teus pedidos.",
  robots: { index: false, follow: false },
};

export default async function EntrarPage() {
  const session = await getServerSession(authOptionsCliente);
  if (session) redirect("/conta");

  return (
    <div className="flex min-h-[calc(100vh-76px)] items-center justify-center bg-slate-50 px-4 py-16">
      <EntrarClienteForm />
    </div>
  );
}
