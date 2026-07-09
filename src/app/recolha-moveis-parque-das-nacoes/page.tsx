export const dynamic = "force-dynamic";

import { permanentRedirect } from "next/navigation";

export default function RecolhaMoveisParqueDasNacoesLegacyPage() {
  permanentRedirect("/recolha-moveis-lisboa");
}
