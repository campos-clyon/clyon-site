import { redirect } from "next/navigation";

// Skip static prerendering since this page needs database access
export const dynamic = "force-dynamic";

export default function ColaboradorLoginPage() {
  redirect("/colaboradores");
}
