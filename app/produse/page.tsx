import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import ProdusePage from "./produse-client";

export const metadata = pageMetadata({
  title: "Colecția de hărți, vederi și cărți",
  description:
    "Toată colecția Hărți România: hărți istorice ale României și ale lumii, vederi de colecție cu voievozi și domnitori, cărți despre istorie și legende.",
  path: "/produse",
});

export default function Page() {
  return (
    <>
      <JsonLd
        data={breadcrumbLd([
          { name: "Acasă", path: "/" },
          { name: "Produse", path: "/produse" },
        ])}
      />
      <ProdusePage />
    </>
  );
}
