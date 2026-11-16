"use client";

import type React from "react";

import Image from "next/image";
import { useState, useCallback, useEffect, useRef } from "react";

interface ImageMagnifierProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  magnifierHeight?: number;
  magnifierWidth?: number;
  zoomLevel?: number;
  onClick?: () => void;
  priority?: boolean; // Added priority prop for first images
}

export function ImageMagnifier({
  src,
  alt,
  magnifierHeight = 500,
  magnifierWidth = 500,
  zoomLevel = 3,
  onClick,
  priority = false, // Default to false
}: ImageMagnifierProps) {
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [[x, y], setXY] = useState([0, 0]);
  const [[imgWidth, imgHeight], setSize] = useState([0, 0]);
  const [[naturalWidth, naturalHeight], setNaturalSize] = useState([0, 0]);
  const [magnifierImageLoaded, setMagnifierImageLoaded] = useState(false);
  const [magnifierBgLoaded, setMagnifierBgLoaded] = useState(false);
  const preloadRef = useRef<HTMLImageElement | null>(null);

  // Preîncărcăm imaginea sursă (URL-ul brut, nu cel optimizat de Next) ca să știm
  // când e gata fundalul cercului-lupă și să-l afișăm fără flicker.
  //
  // IMPORTANT — NU pune `crossOrigin = "anonymous"` aici. CDN-ul Sanity
  // (cdn.sanity.io) răspunde 403 la cererile care trimit header-ul `Origin`
  // (vezi `Vary: Origin`) și NU întoarce `Access-Control-Allow-Origin`. Un load
  // cross-origin ar declanșa `onerror`, nu `onload`, iar lupa n-ar mai apărea
  // niciodată. Nu citim pixeli dintr-un canvas, deci CORS nu e necesar — un load
  // normal (fără Origin) primește 200 OK. (Regresie după migrarea pe Sanity.)
  useEffect(() => {
    if (src && !magnifierBgLoaded) {
      const img = new window.Image();
      // Dacă preload-ul reușește SAU eșuează, deblocăm lupa în ambele cazuri:
      // chiar dacă imaginea nu se preîncarcă, cercul tot trebuie să poată apărea
      // (fundalul CSS al cercului se încarcă oricum la hover).
      const unblock = () => setMagnifierBgLoaded(true);
      img.onload = unblock;
      img.onerror = unblock;
      img.src = src;
      preloadRef.current = img;
    }
    return () => {
      if (preloadRef.current) {
        preloadRef.current.onload = null;
        preloadRef.current.onerror = null;
      }
    };
  }, [src, magnifierBgLoaded]);

  const mouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { width, height } = elem.getBoundingClientRect();
    setSize([width, height]);

    const img = elem.querySelector("img");
    if (img) {
      setNaturalSize([img.naturalWidth, img.naturalHeight]);
    }

    setShowMagnifier(true);
  }, []);

  const mouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const elem = e.currentTarget;
    const { top, left } = elem.getBoundingClientRect();

    const x = e.clientX - left;
    const y = e.clientY - top;
    setXY([x, y]);
  }, []);

  const mouseLeave = useCallback(() => {
    setShowMagnifier(false);
  }, []);

  let bgWidth = imgWidth * zoomLevel;
  let bgHeight = imgHeight * zoomLevel;
  let imgOffsetX = 0;
  let imgOffsetY = 0;
  let displayedImageWidth = imgWidth;
  let displayedImageHeight = imgHeight;

  if (naturalWidth && naturalHeight && imgWidth && imgHeight) {
    const containerAspect = imgWidth / imgHeight;
    const imageAspect = naturalWidth / naturalHeight;

    if (imageAspect > containerAspect) {
      displayedImageWidth = imgWidth;
      displayedImageHeight = imgWidth / imageAspect;
      imgOffsetY = (imgHeight - displayedImageHeight) / 2;
      bgWidth = imgWidth * zoomLevel;
      bgHeight = displayedImageHeight * zoomLevel;
    } else {
      displayedImageHeight = imgHeight;
      displayedImageWidth = imgHeight * imageAspect;
      imgOffsetX = (imgWidth - displayedImageWidth) / 2;
      bgHeight = imgHeight * zoomLevel;
      bgWidth = displayedImageHeight * imageAspect * zoomLevel;
    }
  }

  const adjustedX = x - imgOffsetX;
  const adjustedY = y - imgOffsetY;

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onMouseEnter={mouseEnter}
      onMouseMove={mouseMove}
      onMouseLeave={mouseLeave}
      onClick={onClick}
    >
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 600px"
        className="cursor-crosshair object-contain"
        quality={80} // Increased quality slightly for better visuals
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAMH/8QAHhAAAgIBBQEAAAAAAAAAAAAAAQIAAwQREiExQVH/xAAVAQEBAAAAAAAAAAAAAAAAAAADBP/EABkRAAIDAQAAAAAAAAAAAAAAAAECAAMRIf/aAAwDAQACEQMRAD8AzPLyLsW6ytLGVEYqqg9ACJyepjW9y+zERKqrYMOD/9k="
        priority={priority} // Use priority prop
        onLoad={() => setMagnifierImageLoaded(true)}
      />

      {showMagnifier && magnifierImageLoaded && magnifierBgLoaded && (
        <div
          style={{
            position: "absolute",
            pointerEvents: "none",
            height: `${magnifierHeight}px`,
            width: `${magnifierWidth}px`,
            top: `${y - magnifierHeight / 2}px`,
            left: `${x - magnifierWidth / 2}px`,
            opacity: "1",
            border: "2px solid #d97706",
            backgroundColor: "white",
            backgroundImage: `url('${src}')`,
            backgroundRepeat: "no-repeat",
            borderRadius: "50%",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 20,
            backgroundSize: `${bgWidth}px ${bgHeight}px`,
            backgroundPositionX: `${-adjustedX * zoomLevel + magnifierWidth / 2 + imgOffsetX * zoomLevel}px`,
            backgroundPositionY: `${-adjustedY * zoomLevel + magnifierHeight / 2 + imgOffsetY * zoomLevel}px`,
          }}
        />
      )}
    </div>
  );
}
