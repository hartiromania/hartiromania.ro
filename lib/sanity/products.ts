import "server-only";
import { client } from "@/sanity/lib/client";
import type { Product } from "@/lib/types";
import { transformProduct, type RawProduct } from "./transform";
import {
  ALL_PRODUCTS_QUERY,
  PRODUCT_BY_SLUG_QUERY,
  PRODUCTS_BY_CATEGORY_QUERY,
  FEATURED_PRODUCTS_QUERY,
  PRODUCT_SLUGS_QUERY,
  SITEMAP_PRODUCTS_QUERY,
} from "./queries";

// Wrapper care nu lasă o eroare de rețea / dataset gol să dărâme build-ul sau pagina.
async function safeFetch<T>(
  query: string,
  params: Record<string, unknown>,
  fallback: T,
): Promise<T> {
  try {
    const result = await client.fetch<T>(query, params);
    return result ?? fallback;
  } catch (err) {
    console.error("[sanity] fetch eșuat:", err);
    return fallback;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const raw = await safeFetch<RawProduct[]>(ALL_PRODUCTS_QUERY, {}, []);
  return raw.map(transformProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  const raw = await safeFetch<RawProduct | null>(PRODUCT_BY_SLUG_QUERY, { slug }, null);
  return raw ? transformProduct(raw) : undefined;
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  const raw = await safeFetch<RawProduct[]>(PRODUCTS_BY_CATEGORY_QUERY, { category }, []);
  return raw.map(transformProduct);
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const raw = await safeFetch<RawProduct[]>(FEATURED_PRODUCTS_QUERY, {}, []);
  return raw.map(transformProduct);
}

export async function getProductSlugs(): Promise<{ slug: string; category: string }[]> {
  return safeFetch<{ slug: string; category: string }[]>(PRODUCT_SLUGS_QUERY, {}, []);
}

export interface SitemapEntry {
  slug: string;
  category?: string;
  updatedAt: string;
  images?: (string | null)[] | null;
}

export async function getProductsForSitemap(): Promise<SitemapEntry[]> {
  return safeFetch<SitemapEntry[]>(SITEMAP_PRODUCTS_QUERY, {}, []);
}
