import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
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

async function getAuthorPosts(
  authorSlug: string,
): Promise<{ posts: ZenblogPost[]; authorName: string } | null> {
  try {
    const response = await zenblogApi.posts.list({ author: authorSlug });

    if (!response.data || response.data.length === 0) {
      return null;
    }

    // Get author name from first post
    const authorName = response.data[0].authors?.[0]?.name || authorSlug;

    return {
      posts: response.data,
      authorName,
    };
  } catch (error) {
    console.error("[blog] Error fetching author posts:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getAuthorPosts(slug);

  if (!data) {
    return { title: "Autor negăsit" };
  }

  return pageMetadata({
    title: `Articole de ${data.authorName}`,
    description: `Toate articolele scrise de ${data.authorName} pe blogul Hărți România.`,
    path: `/blog/author/${slug}`,
  });
}

export default async function AuthorPage({ params }: PageProps) {
  const { slug } = await params;
  const data = await getAuthorPosts(slug);

  if (!data) {
    notFound();
  }

  const author = data.posts[0].authors?.[0];

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

          <div className="mb-12 flex items-center gap-4">
            {author?.image_url && (
              <Image
                src={author.image_url || "/placeholder.svg"}
                alt={data.authorName}
                width={80}
                height={80}
                className="rounded-full"
              />
            )}
            <div>
              <h1 className="text-foreground text-3xl font-bold md:text-4xl">{data.authorName}</h1>
              <p className="text-muted-foreground mt-1">
                {data.posts.length} {data.posts.length === 1 ? "articol" : "articole"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.posts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
