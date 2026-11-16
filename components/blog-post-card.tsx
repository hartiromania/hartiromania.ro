"use client";

import Link from "next/link";
import Image from "next/image";
import type { ZenblogPost } from "@/lib/zenblog";

interface BlogPostCardProps {
  post: ZenblogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <article className="bg-card border-border overflow-hidden rounded-lg border shadow-sm transition-shadow hover:shadow-md">
      <Link href={`/blog/${post.slug}`} className="block">
        {post.cover_image && (
          <div className="relative aspect-video">
            <Image
              src={post.cover_image || "/placeholder.svg"}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        )}
      </Link>

      <div className="px-3 pt-3 sm:px-6 sm:pt-4">
        {post.category && (
          <Link
            href={`/blog/category/${post.category.slug}`}
            className="text-primary hover:text-primary/80 mb-2 inline-block text-sm font-medium tracking-wider uppercase transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {post.category.name}
          </Link>
        )}
      </div>

      <Link href={`/blog/${post.slug}`} className="block px-3 pb-3 sm:px-6 sm:pb-3">
        <h2 className="text-foreground mb-0 line-clamp-2 text-3xl font-bold sm:mb-px">
          {post.title}
        </h2>
        {post.excerpt && (
          <p className="text-muted-foreground mb-0 line-clamp-3 text-lg sm:text-xl">
            {post.excerpt}
          </p>
        )}
      </Link>

      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs sm:mb-3 sm:text-sm">
          <time className="text-base" dateTime={post.published_at}>
            {new Date(post.published_at).toLocaleDateString("ro-RO", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </time>
          {post.authors && post.authors.length > 0 && (
            <>
              <span>•</span>
              <Link
                href={`/blog/author/${post.authors[0].slug}`}
                className="hover:text-foreground flex items-center gap-1 transition-colors sm:gap-2"
              >
                {post.authors[0].image_url && (
                  <Image
                    src={post.authors[0].image_url || "/placeholder.svg"}
                    alt={post.authors[0].name}
                    width={16}
                    height={16}
                    className="rounded-full sm:h-5 sm:w-5"
                  />
                )}
                <span className="text-base">{post.authors[0].name}</span>
              </Link>
            </>
          )}
        </div>

        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/blog/tag/${tag.slug}`}
                className="bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-full px-2 py-0.5 text-base transition-all duration-200 sm:px-3 sm:py-1"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
