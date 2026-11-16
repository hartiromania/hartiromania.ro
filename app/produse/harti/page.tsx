import { JsonLd } from "@/components/json-ld";
import { getProductsByCategory } from "@/lib/sanity/products";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { HartiClient } from "./harti-client";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Hărți istorice ale României și ale lumii",
  description:
    "Hărți vechi ale României și ale lumii, din Antichitate până în secolul XX: Dacia, Transilvania, România Mare cu 76 de județe. Comandă pe eMAG.",
  path: "/produse/harti",
});

export default async function HartiPage() {
  const products = await getProductsByCategory("harti");
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Acasă", path: "/" },
          { name: "Produse", path: "/produse" },
          { name: "Hărți", path: "/produse/harti" },
        ])}
      />
      <HartiClient products={products} />
    </>
  );
}
