import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Luminanța relativă WCAG a unei culori hex (#rrggbb).
function luminance(hex: string): number {
  const channels = hex
    .replace("#", "")
    .match(/.{2}/g)
    ?.map((part) => Number.parseInt(part, 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  if (!channels || channels.length < 3) return 0;
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}

const TEXT_LIGHT = "#ffffff";
const TEXT_DARK = "#2e1a0f";

/**
 * Culoarea textului pentru un buton cu fundal ales în Sanity: alb sau maro închis,
 * oricare se citește mai bine pe acel fundal. Păstrează culoarea aleasă pentru buton.
 */
export function readableTextOn(background: string): string {
  if (!/^#[0-9a-f]{6}$/i.test(background)) return TEXT_LIGHT;
  return contrast(TEXT_LIGHT, background) >= contrast(TEXT_DARK, background)
    ? TEXT_LIGHT
    : TEXT_DARK;
}
