"use client";

import type React from "react";

import { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

interface BlogTextZoomProps {
  children: React.ReactNode;
}

export function BlogTextZoom({ children }: BlogTextZoomProps) {
  const [fontSize, setFontSize] = useState(120); // percentage

  const increaseFontSize = () => {
    setFontSize((prev) => Math.min(prev + 10, 150));
  };

  const decreaseFontSize = () => {
    setFontSize((prev) => Math.max(prev - 10, 70));
  };

  return (
    <div className="relative">
      {/* Zoom controls - only visible on desktop */}
      <div className="fixed top-1/2 right-8 z-10 hidden -translate-y-1/2 flex-col gap-3 lg:flex">
        <button
          onClick={increaseFontSize}
          className="bg-card border-border hover:bg-muted cursor-pointer rounded-full border p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-label="Mărește textul"
          title="Mărește textul"
        >
          <ZoomIn className="text-foreground h-5 w-5" />
        </button>
        <button
          onClick={decreaseFontSize}
          className="bg-card border-border hover:bg-muted cursor-pointer rounded-full border p-3 shadow-lg transition-all duration-200 hover:shadow-xl"
          aria-label="Micșorează textul"
          title="Micșorează textul"
        >
          <ZoomOut className="text-foreground h-5 w-5" />
        </button>
      </div>

      <div
        style={
          {
            "--font-scale": fontSize / 100,
            fontSize: `calc(1rem * var(--font-scale))`,
          } as React.CSSProperties
        }
        className="blog-content-zoom"
      >
        {children}
      </div>
    </div>
  );
}
