import type { Metadata } from "next";
import ColaboradorAdminClient from "./ColaboradorAdminClient";

export const metadata: Metadata = {
  title: "Painel Admin | CLYON",
  robots: { index: false, follow: false },
};

export default function ColaboradorAdminPage() {
  return <ColaboradorAdminClient />;
}
export const dynamic = 'force-dynamic';
