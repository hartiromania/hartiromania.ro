const BLOG_ID = process.env.ZENBLOG_BLOG_ID || "";
const API_BASE = "https://www.zenblog.com/api/public";

export interface ZenblogPost {
  title: string;
  html_content: string;
  slug: string;
  category?: {
    name: string;
    slug: string;
  };
  tags?: {
    name: string;
    slug: string;
  }[];
  excerpt?: string;
  published_at: string;
  cover_image?: string;
  authors?: {
    slug: string;
    name: string;
    image_url?: string;
    website?: string;
    twitter?: string;
  }[];
}

interface PostsResponse {
  data: ZenblogPost[];
  total?: number;
  offset?: number;
  limit?: number;
}

interface PostResponse {
  data: ZenblogPost;
}

// Direct REST API client for Zenblog
export const zenblogApi = {
  posts: {
    async list(options?: {
      category?: string;
      tags?: string[];
      author?: string;
      limit?: number;
      offset?: number;
    }): Promise<{ data: ZenblogPost[] }> {
      if (!BLOG_ID) {
        console.error("[zenblog] ZENBLOG_BLOG_ID lipsește");
        return { data: [] };
      }

      const params = new URLSearchParams();
      if (options?.category) params.append("category", options.category);
      if (options?.tags) params.append("tags", options.tags.join(","));
      if (options?.author) params.append("author", options.author);
      if (options?.limit) params.append("limit", options.limit.toString());
      if (options?.offset) params.append("offset", options.offset.toString());

      const queryString = params.toString();
      const url = `${API_BASE}/blogs/${BLOG_ID}/posts${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        const text = await response.text();
        console.error(`[zenblog] listare eșuată (${response.status}):`, text);
        return { data: [] };
      }

      const json: PostsResponse = await response.json();
      return json;
    },

    /** Toate articolele, pagină cu pagină (pentru sitemap și llms.txt). */
    async listAll(): Promise<ZenblogPost[]> {
      const pageSize = 100;
      const all: ZenblogPost[] = [];
      // ponytail: limită de 20 de pagini (2.000 de articole), ca o eroare de paginare
      // să nu poată bucla la nesfârșit.
      for (let page = 0; page < 20; page++) {
        const { data } = await this.list({ limit: pageSize, offset: page * pageSize });
        all.push(...data);
        if (data.length < pageSize) break;
      }
      return all;
    },

    async get(options: { slug: string }): Promise<{ data: ZenblogPost | null }> {
      if (!BLOG_ID) {
        return { data: null };
      }

      const url = `${API_BASE}/blogs/${BLOG_ID}/posts/${options.slug}`;

      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
        },
        next: { revalidate: 60 },
      });

      if (!response.ok) {
        return { data: null };
      }

      const json: PostResponse = await response.json();
      return json;
    },
  },
};
