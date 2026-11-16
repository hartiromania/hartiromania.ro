import { JsonLd } from "@/components/json-ld";
import { getProductsByCategory } from "@/lib/sanity/products";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { CartiClient } from "./carti-client";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Cărți despre istorie, legende și comori",
  description:
    "Cărți despre istoria nefalsificată a românilor, despre legende și comori ale pământului românesc, din colecția Hărți România.",
  path: "/produse/carti",
});

export default async function CartiPage() {
  const products = await getProductsByCategory("carti");
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Acasă", path: "/" },
          { name: "Produse", path: "/produse" },
          { name: "Cărți", path: "/produse/carti" },
        ])}
      />
      <CartiClient products={products} />
    </>
  );
}
