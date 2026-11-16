import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { zenblogApi, type ZenblogPost } from "@/lib/zenblog";
import { BlogPostCard } from "@/components/blog-post-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function getPostsByTag(tagSlug: string): Promise<ZenblogPost[]> {
  try {
    const response = await zenblogApi.posts.list();
    const allPosts = response.data || [];

    // Filter posts that have the specified tag
    return allPosts.filter((post) => post.tags?.some((tag) => tag.slug === tagSlug));
  } catch (error) {
    console.error("[blog] Error fetching posts by tag:", error);
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);

  const tagName = posts[0]?.tags?.find((tag) => tag.slug === slug)?.name || slug;

  // Paginile de etichete repetă articolele din categorii; Google le urmează linkurile,
  // dar nu le indexează, ca să nu concureze cu articolele.
  return pageMetadata({
    title: `Articole despre ${tagName}`,
    description: `Articolele cu eticheta ${tagName} de pe blogul Hărți România.`,
    path: `/blog/tag/${slug}`,
    noindex: true,
  });
}

export default async function TagPage({ params }: PageProps) {
  const { slug } = await params;
  const posts = await getPostsByTag(slug);

  if (posts.length === 0) {
    notFound();
  }

  const tagName = posts[0]?.tags?.find((tag) => tag.slug === slug)?.name || slug;

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-background">
        <div className="container mx-auto px-4 py-16">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Blog
          </Link>

          <header className="mb-12">
            <h1 className="text-foreground mb-2 text-3xl font-bold md:text-4xl">{tagName}</h1>
            <p className="text-muted-foreground">
              {posts.length} {posts.length === 1 ? "articol găsit" : "articole găsite"}
            </p>
          </header>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
