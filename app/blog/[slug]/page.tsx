import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { zenblogApi, type ZenblogPost } from "@/lib/zenblog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BlogTextZoom } from "@/components/blog-text-zoom";
import { NewsletterBlogCTA } from "@/components/newsletter-blog-cta";
import { JsonLd } from "@/components/json-ld";
import { pageMetadata } from "@/lib/seo";
import { toMetaDescription } from "@/lib/site";
import { blogPostingLd, breadcrumbLd } from "@/lib/structured-data";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function getPost(slug: string): Promise<ZenblogPost | null> {
  try {
    const response = await zenblogApi.posts.get({ slug });
    return response.data;
  } catch (error) {
    console.error("[blog] Error fetching post:", error);
    return null;
  }
}

async function getAdjacentPosts(currentSlug: string): Promise<{
  previous: ZenblogPost | null;
  next: ZenblogPost | null;
}> {
  try {
    const response = await zenblogApi.posts.list();
    const posts = response.data;

    const currentIndex = posts.findIndex((post) => post.slug === currentSlug);
    if (currentIndex === -1) {
      return { previous: null, next: null };
    }

    return {
      previous: currentIndex > 0 ? posts[currentIndex - 1] : null,
      next: currentIndex < posts.length - 1 ? posts[currentIndex + 1] : null,
    };
  } catch (error) {
    console.error("[blog] Error fetching adjacent posts:", error);
    return { previous: null, next: null };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Articol negăsit" };
  }

  return pageMetadata({
    title: post.title,
    description:
      toMetaDescription(post.excerpt || post.html_content) ||
      `Citește articolul „${post.title}” pe blogul Hărți România.`,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.published_at,
    authors: post.authors?.map((author) => author.name),
    images: post.cover_image ? [{ url: post.cover_image, alt: post.title }] : undefined,
  });
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    notFound();
  }

  const { previous, next } = await getAdjacentPosts(slug);

  return (
    <div className="min-h-screen">
      <JsonLd
        data={[
          blogPostingLd(post),
          breadcrumbLd([
            { name: "Acasă", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <Header />
      <main className="bg-background">
        <article className="container mx-auto max-w-4xl px-4 py-16 text-justify">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Blog
          </Link>

          {post.cover_image && (
            <div className="relative mb-8 aspect-video overflow-hidden rounded-xl">
              <Image
                src={post.cover_image || "/placeholder.svg"}
                alt={post.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          )}

          <header className="mb-8">
            {post.category && (
              <Link
                href={`/blog/category/${post.category.slug}`}
                className="text-primary hover:text-primary/80 text-sm font-medium tracking-wider uppercase transition-colors"
              >
                {post.category.name}
              </Link>
            )}
            <h1 className="text-foreground mt-2 mb-4 text-center text-left text-3xl font-bold text-balance md:text-4xl lg:text-5xl">
              {post.title}
            </h1>
            <div className="text-muted-foreground flex flex-wrap items-center gap-4 text-xl">
              <time dateTime={post.published_at}>
                {new Date(post.published_at).toLocaleDateString("ro-RO", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
              {post.authors && post.authors.length > 0 && (
                <Link
                  href={`/blog/author/${post.authors[0].slug}`}
                  className="hover:text-foreground flex items-center gap-2 transition-colors"
                >
                  {post.authors[0].image_url && (
                    <Image
                      src={post.authors[0].image_url || "/placeholder.svg"}
                      alt={post.authors[0].name}
                      width={24}
                      height={24}
                      className="rounded-full"
                    />
                  )}
                  <span>{post.authors[0].name}</span>
                </Link>
              )}
            </div>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag.slug}
                    href={`/blog/tag/${tag.slug}`}
                    className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full px-3 py-1 text-base transition-all duration-200"
                  >
                    {tag.name}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {(() => {
            const html = post.html_content;
            const proseClass =
              "prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-foreground/90 prose-a:text-primary prose-a:underline prose-strong:text-foreground prose-img:rounded-xl prose-p:text-justify";

            const MIN_LENGTH_FOR_MID_CTA = 1500;
            const halfLength = html.length / 2;
            const splitMarker = html.indexOf("</p>", halfLength);
            const canSplitMid = splitMarker !== -1 && html.length >= MIN_LENGTH_FOR_MID_CTA;

            if (canSplitMid) {
              const cutAt = splitMarker + "</p>".length;
              const firstHalf = html.substring(0, cutAt);
              const secondHalf = html.substring(cutAt);

              return (
                <BlogTextZoom>
                  <div className={proseClass} dangerouslySetInnerHTML={{ __html: firstHalf }} />
                  <NewsletterBlogCTA />
                  <div className={proseClass} dangerouslySetInnerHTML={{ __html: secondHalf }} />
                </BlogTextZoom>
              );
            }

            return (
              <>
                <BlogTextZoom>
                  <div className={proseClass} dangerouslySetInnerHTML={{ __html: html }} />
                </BlogTextZoom>
                <NewsletterBlogCTA />
              </>
            );
          })()}

          <nav className="border-border mt-12 flex items-center justify-between gap-4 border-t pt-8">
            {previous ? (
              <Link
                href={`/blog/${previous.slug}`}
                className="text-muted-foreground hover:text-foreground group flex flex-1 items-center gap-2 transition-colors"
              >
                <ChevronLeft className="h-5 w-5 flex-shrink-0 transition-transform group-hover:-translate-x-1" />
                <div className="text-left">
                  <div className="mb-1 text-sm tracking-wider uppercase">Anterior</div>
                  <div className="line-clamp-2 text-base font-medium">{previous.title}</div>
                </div>
              </Link>
            ) : (
              <div className="flex-1" />
            )}

            {next ? (
              <Link
                href={`/blog/${next.slug}`}
                className="text-muted-foreground hover:text-foreground group flex flex-1 items-center justify-end gap-2 text-right transition-colors"
              >
                <div className="text-right">
                  <div className="mb-1 text-sm tracking-wider uppercase">Următor</div>
                  <div className="line-clamp-2 text-base font-medium">{next.title}</div>
                </div>
                <ChevronRight className="h-5 w-5 flex-shrink-0 transition-transform group-hover:translate-x-1" />
              </Link>
            ) : (
              <div className="flex-1" />
            )}
          </nav>
        </article>
      </main>
      <Footer />
    </div>
  );
}
