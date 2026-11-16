/** @type {import('next').NextConfig} */
const nextConfig = {
  // Lint-ul rulează separat (`pnpm lint`, și în CI). Erorile TypeScript opresc
  // build-ul, ca să nu ajungă cod stricat în producție.
  images: {
    formats: ["image/avif", "image/webp"],
    // Next 16 acceptă doar calitățile listate aici (implicit doar 75); o valoare
    // nelistată e rotunjită la cea mai apropiată. Acestea sunt cele folosite în cod.
    qualities: [75, 80, 85, 90, 95],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "hebbkx1anhila5yf.public.blob.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "**.vercel-storage.com",
      },
      {
        protocol: "https",
        hostname: "www.zenblog.com",
      },
      {
        protocol: "https",
        hostname: "zenblog.com",
      },
      {
        protocol: "https",
        hostname: "**.zenblog.com",
      },
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
