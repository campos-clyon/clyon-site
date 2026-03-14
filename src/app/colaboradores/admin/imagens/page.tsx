import type { Metadata } from "next";
import ImageManagerClient from "../ImageManagerClient";

export const metadata: Metadata = {
  title: "Gestor de Imagens | CLYON",
  robots: { index: false, follow: false },
};

export default function ColaboradorAdminImagesPage() {
  return <ImageManagerClient />;
}

export const dynamic = "force-dynamic";
