"use client";

import { useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { track } from "@/lib/analytics";

interface ProductSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showAdvancedSearch?: boolean;
  onAdvancedSearch?: () => void;
}

export function ProductSearch({
  value,
  onChange,
  placeholder = "Caută produse...",
  showAdvancedSearch = false,
  onAdvancedSearch,
}: ProductSearchProps) {
  // One "search" event per finished query, not one per keystroke.
  useEffect(() => {
    const term = value.trim();
    if (term.length < 2) return;
    const timer = setTimeout(() => track("search", { search_term: term }), 1500);
    return () => clearTimeout(timer);
  }, [value]);

  return (
    <div className="w-full">
      <div className="ml-auto max-w-sm">
        <div className="relative">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="pr-4 pl-10"
          />
        </div>
      </div>
      {showAdvancedSearch && onAdvancedSearch && (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground mb-4 text-xl">
              Nu am găsit produse care să corespundă căutării tale.
            </p>
            <button
              onClick={onAdvancedSearch}
              className="text-lg font-medium text-blue-600 underline transition-colors hover:text-blue-700"
            >
              Căutare avansată
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
