export const dynamic = "force-dynamic";

import MetricasClient from "./MetricasClient";

export const metadata = {
  title: "Métricas — CLYON Admin",
  robots: "noindex",
};

export default function MetricasPage() {
  return <MetricasClient />;
}
