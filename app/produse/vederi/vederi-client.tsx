"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";
import { searchProducts, sortProductsAlphabetically } from "@/lib/search-utils";
import type { Product } from "@/lib/types";

export function VederiClient({ products }: { products: Product[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"title" | "advanced">("title");

  const allProducts = useMemo(() => sortProductsAlphabetically(products), [products]);

  const filteredProducts = useMemo(() => {
    return searchProducts(allProducts, searchQuery, searchMode);
  }, [allProducts, searchQuery, searchMode]);

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

      <section className="relative overflow-hidden px-4 py-16">
        <div
          className="absolute inset-0 scale-140 transform bg-cover bg-no-repeat md:-top-30 md:scale-110 md:bg-top xl:-top-35"
          style={{ backgroundImage: "url('/images/vederi-background.png')" }}
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 container mx-auto text-center">
          <h1 className="mb-4 text-4xl font-bold text-orange-400 md:text-5xl">
            Colecția de Vederi
          </h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-bold text-pretty text-white md:text-3xl">
            Vederi și cărți poștale ilustrate Vintage, Retro de Colecție
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-background px-4 py-8">
        <div className="container mx-auto flex justify-end">
          <ProductSearch
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Caută vederi..."
            showAdvancedSearch={showAdvancedSearch}
            onAdvancedSearch={handleAdvancedSearch}
          />
        </div>
      </section>

      <section className="relative px-4 py-16">
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 hidden w-[65%] opacity-40 lg:block"
          style={{
            backgroundImage: "url('/vederile/set-8-vederi-de-colectie-spate.webp')",
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />

        <div className="relative z-10 container mx-auto">
          {filteredProducts.length === 0 && searchMode === "advanced" ? (
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
      </section>

      <Footer />
    </div>
  );
}
