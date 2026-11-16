import { JsonLd } from "@/components/json-ld";
import { getProductsByCategory } from "@/lib/sanity/products";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { VederiClient } from "./vederi-client";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Vederi de colecție cu domnitori și voievozi",
  description:
    "Vederi și cărți poștale vintage cu domnitorii, voievozii și regii României. Un dar cu poveste pentru cei care iubesc istoria.",
  path: "/produse/vederi",
});

export default async function VederiPage() {
  const products = await getProductsByCategory("vederi");
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Acasă", path: "/" },
          { name: "Produse", path: "/produse" },
          { name: "Vederi", path: "/produse/vederi" },
        ])}
      />
      <VederiClient products={products} />
    </>
  );
}
