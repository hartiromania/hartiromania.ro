import { getAllPromoPackages } from "@/lib/sanity/promo";
import { PromoClient } from "./promo-client";
import { pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { breadcrumbLd } from "@/lib/structured-data";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Pachete promo cu hărți istorice",
  description:
    "Pachete de hărți istorice la preț avantajos, potrivite ca dar pentru cei pasionați de istorie și cartografie. Comandă pe eMAG.",
  path: "/promo",
});

export default async function PromoPage() {
  const packages = await getAllPromoPackages();
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Acasă", path: "/" },
          { name: "Pachete promo", path: "/promo" },
        ])}
      />
      <PromoClient packages={packages} />
    </>
  );
}
