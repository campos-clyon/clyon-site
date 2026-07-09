export const dynamic = "force-dynamic";

import PagamentosClient from "./PagamentosClient";

export const metadata = {
  title: "Pagamentos — CLYON Admin",
  robots: "noindex",
};

export default function PagamentosPage() {
  return <PagamentosClient />;
}
