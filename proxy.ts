import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect old product URLs to new structure
  // Old: /harti/[slug] -> New: /produse/harti/[slug]
  if (pathname.startsWith("/harti/") && !pathname.startsWith("/harti/page")) {
    const slug = pathname.replace("/harti/", "");
    return NextResponse.redirect(new URL(`/produse/harti/${slug}`, request.url), 308);
  }

  // Old: /carti/[slug] -> New: /produse/carti/[slug]
  if (pathname.startsWith("/carti/") && !pathname.startsWith("/carti/page")) {
    const slug = pathname.replace("/carti/", "");
    return NextResponse.redirect(new URL(`/produse/carti/${slug}`, request.url), 308);
  }

  // Old: /vederi/[slug] -> New: /produse/vederi/[slug]
  if (pathname.startsWith("/vederi/") && !pathname.startsWith("/vederi/page")) {
    const slug = pathname.replace("/vederi/", "");
    return NextResponse.redirect(new URL(`/produse/vederi/${slug}`, request.url), 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/harti/:path*", "/carti/:path*", "/vederi/:path*"],
};
