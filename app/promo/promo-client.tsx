"use client";

import { useState, useMemo } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PromoCard } from "@/components/promo-card";
import { ProductSearch } from "@/components/product-search";
import { searchProducts, sortProductsAlphabetically } from "@/lib/search-utils";
import type { PromoPackage } from "@/lib/types";

export function PromoClient({ packages }: { packages: PromoPackage[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"title" | "advanced">("title");

  const allPackages = useMemo(() => sortProductsAlphabetically(packages), [packages]);

  const filteredPackages = useMemo(() => {
    return searchProducts(allPackages, searchQuery, searchMode);
  }, [allPackages, searchQuery, searchMode]);

  const showAdvancedSearch =
    searchQuery.trim() !== "" && filteredPackages.length === 0 && searchMode === "title";

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
          backgroundImage: `url('/images/europam-2c-20sive-20celticam-20veterem-20ortelius-20fasie.jpg')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="bg-card/70 absolute inset-0"></div>
        <div className="relative z-10 container mx-auto text-center">
          <h1 className="text-accent-foreground mb-4 text-4xl font-bold md:text-5xl">
            Pachete Promo
          </h1>
          <p className="mx-auto max-w-2xl text-2xl leading-relaxed font-bold text-pretty text-green-800 md:text-3xl">
            Descoperiți pachetele noastre promoționale cu hărți și produse speciale la prețuri
            avantajoase.
          </p>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-background px-4 py-4">
        <div className="container mx-auto flex justify-end">
          <ProductSearch
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Caută pachete promo..."
            showAdvancedSearch={showAdvancedSearch}
            onAdvancedSearch={handleAdvancedSearch}
          />
        </div>
      </section>

      {/* Packages Grid */}
      <section className="px-4 pt-8 pb-16">
        <div className="container mx-auto">
          {filteredPackages.length === 0 && searchMode === "advanced" ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                Nu am găsit pachete care să corespundă căutării tale.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredPackages.map((pkg) => (
                <PromoCard key={pkg.id} package={pkg} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
