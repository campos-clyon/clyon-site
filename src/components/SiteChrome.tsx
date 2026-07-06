import { getCompanySetting } from "@/lib/db";
import { BUSINESS_PHONE } from "@/lib/seo-data";
import SiteChromeClient from "@/components/SiteChromeClient";

export default async function SiteChrome({
  children,
}: {
  children: React.ReactNode;
}) {
  const phone = await getCompanySetting("business_phone", BUSINESS_PHONE);

  return (
    <SiteChromeClient phone={phone}>
      {children}
    </SiteChromeClient>
  );
}
