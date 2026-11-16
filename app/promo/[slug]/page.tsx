import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/json-ld";
import { getPromoPackageBySlug, getPromoSlugs } from "@/lib/sanity/promo";
import { pageMetadata, sanityShareImage } from "@/lib/seo";
import { toMetaDescription } from "@/lib/site";
import { breadcrumbLd, productLd } from "@/lib/structured-data";
import { PromoDetailClient } from "./promo-detail-client";

export const revalidate = 60;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const slugs = await getPromoSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const promoPackage = await getPromoPackageBySlug(slug);
  if (!promoPackage) return {};

  return pageMetadata({
    title: promoPackage.title,
    description: toMetaDescription(promoPackage.description || promoPackage.longDescription),
    path: `/promo/${slug}`,
    images: sanityShareImage(
      promoPackage.images[0]?.url,
      promoPackage.images[0]?.alt || promoPackage.title,
    ),
  });
}

export default async function PromoPackagePage({ params }: PageProps) {
  const { slug } = await params;
  const promoPackage = await getPromoPackageBySlug(slug);

  if (!promoPackage) {
    notFound();
  }

  const path = `/promo/${slug}`;

  return (
    <>
      <JsonLd
        data={[
          productLd(promoPackage, path, "Pachete promo"),
          breadcrumbLd([
            { name: "Acasă", path: "/" },
            { name: "Pachete promo", path: "/promo" },
            { name: promoPackage.title, path },
          ]),
        ]}
      />
      <PromoDetailClient promoPackage={promoPackage} />
    </>
  );
}
