import { zenblogApi, type ZenblogPost } from "@/lib/zenblog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BlogPostsClient } from "@/components/blog-posts-client";
import { pageMetadata } from "@/lib/seo";

export const revalidate = 60;

export const metadata = pageMetadata({
  title: "Blog despre hărți vechi și istorie",
  description:
    "Povești despre hărțile vechi ale României și ale lumii, despre istorie, legende și patrimoniul cartografic românesc.",
  path: "/blog",
});

async function getPosts(): Promise<ZenblogPost[]> {
  try {
    const response = await zenblogApi.posts.list();
    return response.data || [];
  } catch (error) {
    console.error("[blog] Error fetching posts:", error);
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="bg-background">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-foreground mb-12 text-center text-4xl font-bold md:text-5xl">Blog</h1>

          {posts.length === 0 ? (
            <p className="text-muted-foreground text-center text-xl">
              În curând vom publica articole interesante despre hărți vechi și istoria cartografiei
              românești.
            </p>
          ) : (
            <BlogPostsClient posts={posts} />
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
