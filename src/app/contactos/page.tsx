import { redirect } from "next/navigation";

export default function ContactosPage() {
  // Redirect to simulator on server-side to avoid auth checks intercepting
  redirect("/simulador");
}
