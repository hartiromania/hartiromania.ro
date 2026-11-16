"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { BlogPostCard } from "@/components/blog-post-card";
import { ArrowDown, ArrowUp } from "lucide-react";
import type { ZenblogPost } from "@/lib/zenblog";

interface BlogPostsClientProps {
  posts: ZenblogPost[];
}

export function BlogPostsClient({ posts }: BlogPostsClientProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedPosts = useMemo(() => {
    return [...posts].sort((a, b) => {
      const dateA = new Date(a.published_at).getTime();
      const dateB = new Date(b.published_at).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [posts, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  return (
    <div className="flex flex-col gap-8 lg:flex-row">
      {/* Main content */}
      <div className="flex-1">
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 xl:grid-cols-4">
          {sortedPosts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </div>

      {/* Sidebar - only visible on desktop */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-4">
          <h2 className="text-foreground mb-2 px-2 text-xl font-semibold">Toate postările</h2>

          <button
            onClick={toggleSortOrder}
            className="text-muted-foreground hover:text-foreground mb-4 flex cursor-pointer items-center gap-2 px-2 text-sm transition-colors"
          >
            <span className="text-lg">
              Data Postării: {sortOrder === "asc" ? "A → Z" : "Z → A"}
            </span>
            {sortOrder === "asc" ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
          </button>

          <div className="divide-border max-h-[calc(100vh-200px)] divide-y overflow-y-auto">
            {sortedPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group hover:bg-muted/30 block px-2 py-3 transition-colors"
              >
                <h3 className="text-foreground group-hover:text-primary mb-1 line-clamp-2 text-lg font-medium transition-colors">
                  {post.title}
                </h3>
                <time className="text-muted-foreground text-base">
                  {new Date(post.published_at).toLocaleDateString("ro-RO", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
