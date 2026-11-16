// Valori publice (NU secrete) — apar oricum în bundle-ul client.
// Le poți seta în Vercel ca NEXT_PUBLIC_SANITY_* ca să le suprascrii fără a atinge codul.
export const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-10-01";

export const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kqgfquqs";
