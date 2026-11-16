"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProductCard } from "@/components/product-card";
import { ProductSearch } from "@/components/product-search";
import { searchProducts, sortProductsAlphabetically } from "@/lib/search-utils";
import type { Product } from "@/lib/types";

export function CartiClient({ products }: { products: Product[] }) {
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

      {/* Page Header */}
      <section
        className="relative bg-cover bg-center bg-no-repeat px-4 py-16"
        style={{
          backgroundImage:
            "url('/images/harta-principatelor-moldovei-si-tarii-romanesti-fasie.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-card/70 absolute inset-0"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-card-foreground mb-4 text-4xl font-bold md:text-5xl">
            Cărți, legende, istorii, comori...
          </h1>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-background px-4 py-8">
        <div className="container mx-auto flex justify-end">
          <ProductSearch
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Caută cărți..."
            showAdvancedSearch={showAdvancedSearch}
            onAdvancedSearch={handleAdvancedSearch}
          />
        </div>
      </section>

      {/* Products Grid */}
      <section className="relative px-4 py-16">
        <div
          className="pointer-events-none absolute top-0 right-0 bottom-0 z-0 hidden w-1/2 opacity-60 lg:block"
          style={{
            backgroundImage: "url('/carte/imagine-carte-ielele-cu-text.webp')",
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
