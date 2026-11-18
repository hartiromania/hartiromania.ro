import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// admin.hartiromania.ro serves the pages in app/admin (admin.localhost:3010 locally).
const ADMIN_HOST = /^admin\./;

// Strict headers for every admin page: no framing, no indexing, no leaking the URL.
const ADMIN_HEADERS: Record<string, string> = {
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Cache-Control": "no-store",
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get("host") ?? "";

  if (ADMIN_HOST.test(host)) {
    // The internal folder never shows in the address bar: /admin/x → /x.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      const clean = request.nextUrl.clone();
      clean.pathname = pathname.slice("/admin".length) || "/";
      return NextResponse.redirect(clean, 308);
    }
    // API routes keep their own paths; every page maps to /admin/<path>.
    const url = request.nextUrl.clone();
    if (!pathname.startsWith("/api/")) url.pathname = `/admin${pathname === "/" ? "" : pathname}`;
    const response = pathname.startsWith("/api/") ? NextResponse.next() : NextResponse.rewrite(url);
    for (const [key, value] of Object.entries(ADMIN_HEADERS)) response.headers.set(key, value);
    return response;
  }

  // The admin pages exist only on the admin host: elsewhere they show the site's own 404.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.rewrite(new URL("/pagina-inexistenta", request.url));
  }

  // Old product URLs: /harti|/carti|/vederi/<slug> → /produse/<category>/<slug>
  const legacy = pathname.match(/^\/(harti|carti|vederi)\/(.*)$/);
  if (legacy && !legacy[2].startsWith("page")) {
    return NextResponse.redirect(new URL(`/produse/${legacy[1]}/${legacy[2]}`, request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/harti/:path*",
    "/carti/:path*",
    "/vederi/:path*",
    "/admin",
    "/admin/:path*",
    {
      // Files from public/ (anything with an extension) are served as they are.
      source: "/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)",
      has: [{ type: "header", key: "host", value: "admin\\..*" }],
    },
  ],
};
