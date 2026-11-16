import { getAllProducts } from "@/lib/sanity/products";
import { getAllPromoPackages } from "@/lib/sanity/promo";
import { ORGANIZATION, SITE_NAME, absoluteUrl, toMetaDescription } from "@/lib/site";
import { zenblogApi } from "@/lib/zenblog";
import type { Product, PromoPackage } from "@/lib/types";

// /llms.txt (standard llmstxt.org): rezumatul site-ului în Markdown, pentru asistenții AI
// (ChatGPT, Claude, Perplexity, Gemini). Se regenerează din Sanity și Zenblog o dată pe oră.
export const revalidate = 3600;

const CATEGORIES: { id: Product["category"]; title: string }[] = [
  { id: "harti", title: "Hărți" },
  { id: "vederi", title: "Vederi" },
  { id: "carti", title: "Cărți" },
];

function itemLine(item: Product | PromoPackage, path: string): string {
  const description = toMetaDescription(item.description, 200);
  const price = item.price ? ` Preț: ${item.price}.` : "";
  return `- [${item.title}](${absoluteUrl(path)}): ${description ?? ""}${price}`.trimEnd();
}

export async function GET() {
  const [products, promos, posts] = await Promise.all([
    getAllProducts(),
    getAllPromoPackages(),
    zenblogApi.posts.listAll().catch(() => []),
  ]);

  const sections: string[] = [
    `# ${SITE_NAME}`,
    `> ${ORGANIZATION.description}`,
    [
      `${SITE_NAME} (${absoluteUrl("/")}) este un site de prezentare și catalog. Fiecare produs are un buton „Comandă” care duce la pagina lui de pe eMAG, unde se plasează comanda.`,
      `Hărțile sunt hărți istorice restaurate, reconstituite digital și îmbogățite grafic, despre istoria românilor și a lumii: Dacia, Transilvania, România Mare cu 76 de județe, hărți ale lumii antice.`,
      `Contact: ${ORGANIZATION.email}, telefon ${ORGANIZATION.telephone}, ${ORGANIZATION.address.addressLocality}, județul ${ORGANIZATION.address.addressRegion}, România.`,
    ].join("\n\n"),
  ];

  for (const category of CATEGORIES) {
    const items = products.filter((product) => product.category === category.id);
    if (items.length === 0) continue;
    sections.push(
      `## ${category.title}\n\n${items
        .map((item) => itemLine(item, `/produse/${category.id}/${item.slug}`))
        .join("\n")}`,
    );
  }

  if (promos.length > 0) {
    sections.push(
      `## Pachete promo\n\n${promos.map((item) => itemLine(item, `/promo/${item.slug}`)).join("\n")}`,
    );
  }

  if (posts.length > 0) {
    sections.push(
      `## Articole de blog\n\n${posts
        .map((post) => {
          const summary = toMetaDescription(post.excerpt, 200);
          return `- [${post.title}](${absoluteUrl(`/blog/${post.slug}`)})${summary ? `: ${summary}` : ""}`;
        })
        .join("\n")}`,
    );
  }

  sections.push(
    [
      "## Pagini",
      "",
      `- [Povestea noastră](${absoluteUrl("/despre")}): cine suntem și cum lucrăm hărțile`,
      `- [Contact](${absoluteUrl("/contact")}): comenzi personalizate, colaborări, întrebări`,
      `- [Video](${absoluteUrl("/video")}): povești despre hărți și istorie, în imagini`,
      `- [Blog RSS](${absoluteUrl("/blog/rss.xml")}): fluxul articolelor noi`,
    ].join("\n"),
  );

  return new Response(`${sections.join("\n\n")}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
