import { zenblogApi, type ZenblogPost } from "@/lib/zenblog";

import { SITE_URL } from "@/lib/site";
const FEED_TITLE = "Blog | Hărți România";
const FEED_DESCRIPTION =
  "Povești cartografice, istorice și culturale despre hărțile vechi ale României și ale lumii.";

// Escape XML special characters
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

// Format Date to RFC 822 (required by RSS 2.0)
function toRfc822(dateString: string): string {
  try {
    return new Date(dateString).toUTCString();
  } catch {
    return new Date().toUTCString();
  }
}

function renderItem(post: ZenblogPost): string {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const pubDate = toRfc822(post.published_at);

  // Build description: prefer excerpt, fallback to stripped HTML if available
  const descriptionText = post.excerpt
    ? post.excerpt
    : post.html_content
      ? stripHtml(post.html_content).slice(0, 280) + "..."
      : "";

  // Only include content:encoded if html_content actually exists
  // (Zenblog list endpoint omits it; only individual post endpoint returns it)
  const contentEncoded = post.html_content
    ? `<content:encoded><![CDATA[${post.html_content}]]></content:encoded>`
    : "";

  const category = post.category ? `<category>${escapeXml(post.category.name)}</category>` : "";

  const author =
    post.authors && post.authors.length > 0
      ? `<dc:creator><![CDATA[${post.authors[0].name}]]></dc:creator>`
      : "";

  const coverImage = post.cover_image
    ? `<enclosure url="${escapeXml(post.cover_image)}" type="image/jpeg" />
       <media:thumbnail url="${escapeXml(post.cover_image)}" />`
    : "";

  return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description><![CDATA[${descriptionText}]]></description>
      ${contentEncoded}
      <pubDate>${pubDate}</pubDate>
      ${author}
      ${category}
      ${coverImage}
    </item>`;
}

function stripHtml(html: string | undefined): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const revalidate = 300; // 5 minutes cache

export async function GET() {
  try {
    const response = await zenblogApi.posts.list({ limit: 20 });
    const posts = response.data || [];

    const lastBuildDate =
      posts.length > 0 ? toRfc822(posts[0].published_at) : new Date().toUTCString();

    const itemsXml = posts.map(renderItem).join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <description>${escapeXml(FEED_DESCRIPTION)}</description>
    <link>${SITE_URL}/blog</link>
    <atom:link href="${SITE_URL}/blog/rss.xml" rel="self" type="application/rss+xml" />
    <language>ro-RO</language>
    <copyright>© ${new Date().getFullYear()} Hărți România</copyright>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <ttl>60</ttl>
    <image>
      <url>${SITE_URL}/logo-principal-no-bg-cropped.png</url>
      <title>${escapeXml(FEED_TITLE)}</title>
      <link>${SITE_URL}/blog</link>
    </image>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(xml, {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("[rss] Error generating feed:", error);
    return new Response("Error generating RSS feed", { status: 500 });
  }
}
