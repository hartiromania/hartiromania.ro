"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";
import { searchProducts, sortProductsByUploadOrder } from "@/lib/search-utils";
import type { Product } from "@/lib/types";

type FilterType = "all" | "new" | "bestseller";

export function HartiClient({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"title" | "advanced">("title");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const allProducts = useMemo(() => sortProductsByUploadOrder(products), [products]);

  const filteredProducts = useMemo(() => {
    let results = searchProducts(allProducts, searchQuery, searchMode);
    if (activeFilter === "new") results = results.filter((p) => p.isNew);
    if (activeFilter === "bestseller") results = results.filter((p) => p.isBestSeller);
    return results;
  }, [allProducts, searchQuery, searchMode, activeFilter]);

  const newCount = allProducts.filter((p) => p.isNew).length;
  const bestSellerCount = allProducts.filter((p) => p.isBestSeller).length;

  const showAdvancedSearch =
    searchQuery.trim() !== "" && filteredProducts.length === 0 && searchMode === "title";

  const handleAdvancedSearch = () => {
    setSearchMode("advanced");
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setSearchMode("title");
  };

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <section
        className="relative px-4 py-16"
        style={{
          backgroundImage: `url('/images/psalter-20copy.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-card/70 absolute inset-0"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-accent-foreground mb-4 text-4xl font-bold md:text-5xl">
            Colecția de hărți
          </h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-bold text-pretty text-green-800 md:text-3xl">
            Descoperiți o selecție de hărți istorico-geografice fascinante, din trecutul enigmatic
            al României și al lumii.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-background px-4 py-8">
        <div className="container mx-auto flex flex-col items-center justify-center gap-4 md:flex-row md:gap-12">
          <div className="flex w-full justify-center md:w-auto">
            <Link
              href="/promo"
              className="hover:bg-accent-orange/90 inline-flex items-center justify-center rounded-lg border-0 bg-cyan-700 px-6 py-1.5 text-center text-lg font-semibold text-white opacity-100 shadow-lg transition-colors hover:shadow-lg"
            >
              Descoperă și pachetele promoționale de hărți
            </Link>
          </div>

          <div className="w-full md:w-auto">
            <ProductSearch
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Caută hărți..."
              showAdvancedSearch={showAdvancedSearch}
              onAdvancedSearch={handleAdvancedSearch}
            />
          </div>
        </div>
      </section>

      {/* Products Grid + Filter Sidebar */}
      <section className="py-16">
        <div className="flex items-start gap-4 pr-4 pl-4 lg:pr-6">
          {/* Products + mobile filters */}
          <div className="min-w-0 flex-1">
            {/* Filter buttons — mobile only */}
            <div className="mb-8 flex flex-wrap gap-2 lg:hidden">
              {(
                [
                  { key: "all", label: "Toate hărțile", count: allProducts.length },
                  { key: "new", label: "Noutăți", count: newCount },
                  { key: "bestseller", label: "Best Seller", count: bestSellerCount },
                ] as { key: FilterType; label: string; count: number }[]
              ).map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveFilter(key)}
                  className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                    activeFilter === key
                      ? "bg-foreground text-background border-foreground"
                      : "bg-background text-foreground border-border hover:border-foreground/40"
                  }`}
                >
                  {label}
                  <span className="text-xs opacity-60">{count}</span>
                </button>
              ))}
            </div>

            <div className="container mx-auto px-0">
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground text-lg">
                    Nu am găsit produse care să corespundă căutării tale.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Filter Sidebar — lg+ only */}
          <aside className="sticky top-8 hidden w-44 shrink-0 flex-col gap-3 lg:flex">
            <p className="text-muted-foreground mb-1 text-xs font-semibold tracking-widest uppercase">
              Filtrează
            </p>

            {(
              [
                { key: "all", label: "Toate hărțile", count: allProducts.length },
                { key: "new", label: "Noutăți", count: newCount },
                { key: "bestseller", label: "Best Seller", count: bestSellerCount },
              ] as { key: FilterType; label: string; count: number }[]
            ).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex w-full items-center justify-between rounded-lg border px-4 py-3 text-sm font-medium transition-colors ${
                  activeFilter === key
                    ? "bg-foreground text-background border-foreground"
                    : "bg-background text-foreground border-border hover:border-foreground/40"
                }`}
              >
                <span>{label}</span>
                <span className="text-xs opacity-60">{count}</span>
              </button>
            ))}
          </aside>
        </div>
      </section>

      <Footer />
    </div>
  );
}
