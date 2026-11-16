import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { pageMetadata } from "@/lib/seo";
import { zenblogApi } from "@/lib/zenblog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BlogPostCard } from "@/components/blog-post-card";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

async function getCategoryPosts(slug: string) {
  try {
    const response = await zenblogApi.posts.list();
    const posts = response.data.filter((post) => post.category?.slug === slug);
    const categoryName = posts.length > 0 ? posts[0].category?.name : null;
    return { posts, categoryName };
  } catch (error) {
    console.error("[blog] Error fetching category posts:", error);
    return { posts: [], categoryName: null };
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const { categoryName } = await getCategoryPosts(slug);

  if (!categoryName) {
    return { title: "Categorie negăsită" };
  }

  return pageMetadata({
    title: `${categoryName}: articole de blog`,
    description: `Toate articolele din categoria ${categoryName} de pe blogul Hărți România: hărți vechi, istorie și legende.`,
    path: `/blog/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const { posts, categoryName } = await getCategoryPosts(slug);

  if (!categoryName) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-[#fafafa]">
        <div className="container mx-auto max-w-6xl px-4 py-16">
          <Link
            href="/blog"
            className="text-muted-foreground hover:text-foreground mb-8 inline-flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Înapoi la Blog
          </Link>

          <div className="mb-12">
            <h1 className="text-foreground mb-4 text-4xl font-bold">{categoryName}</h1>
            <p className="text-muted-foreground text-lg">
              {posts.length} {posts.length === 1 ? "articol" : "articole"}
            </p>
          </div>

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
