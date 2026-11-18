import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

// Roboții asistenților AI sunt permiși explicit, ca ChatGPT, Claude, Perplexity sau
// Gemini să poată citi și cita site-ul. Zonele tehnice rămân închise pentru toți.
const DISALLOW = ["/api/"];

const AI_CRAWLERS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-SearchBot",
  "Claude-User",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      { userAgent: AI_CRAWLERS, allow: "/", disallow: DISALLOW },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
