import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getProductBySlug, getProductsByCategory, getProductSlugs } from "@/lib/sanity/products";
import { pageMetadata, sanityShareImage } from "@/lib/seo";
import { toMetaDescription } from "@/lib/site";
import { breadcrumbLd, productLd } from "@/lib/structured-data";
import { ProductDetailClient } from "./product-detail-client";

export const revalidate = 60;

const CATEGORY_NAMES: Record<string, string> = {
  harti: "Hărți",
  vederi: "Vederi",
  carti: "Cărți",
};

interface PageProps {
  params: Promise<{ category: string; slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getProductSlugs();
  return slugs.map(({ slug, category }) => ({ category, slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, category } = await params;
  const product = await getProductBySlug(slug);
  if (!product || product.category !== category) return {};

  return pageMetadata({
    title: product.title,
    description: toMetaDescription(product.description || product.longDescription),
    path: `/produse/${category}/${slug}`,
    images: sanityShareImage(product.images[0]?.url, product.images[0]?.alt || product.title),
  });
}

export default async function ProductPage({ params }: PageProps) {
  const { slug, category } = await params;

  const product = await getProductBySlug(slug);

  if (!product || product.category !== category) {
    notFound();
  }

  const hartiProducts = category === "harti" ? await getProductsByCategory("harti") : [];
  const path = `/produse/${category}/${slug}`;
  const categoryName = CATEGORY_NAMES[category] ?? category;

  return (
    <>
      <JsonLd
        data={[
          productLd(product, path, categoryName),
          breadcrumbLd([
            { name: "Acasă", path: "/" },
            { name: "Produse", path: "/produse" },
            { name: categoryName, path: `/produse/${category}` },
            { name: product.title, path },
          ]),
        ]}
      />
      <ProductDetailClient product={product} hartiProducts={hartiProducts} />
    </>
  );
}
