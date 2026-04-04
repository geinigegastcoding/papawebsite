import fs from "node:fs/promises";
import path from "node:path";

import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const POSTS_DIRECTORY = path.join(process.cwd(), "content", "blog");

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  cover: string;
  featured?: boolean;
  content: string;
};

type RawFrontmatter = Omit<BlogPost, "slug" | "content">;

function toPost(slug: string, source: string): BlogPost {
  const { data, content } = matter(source);
  const frontmatter = data as Partial<RawFrontmatter>;

  return {
    slug,
    title: frontmatter.title ?? slug,
    date: frontmatter.date ?? new Date().toISOString(),
    excerpt: frontmatter.excerpt ?? "",
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    cover: frontmatter.cover ?? "/images/data-connections.jpg",
    featured: frontmatter.featured ?? false,
    content,
  };
}

export async function getAllPosts(): Promise<BlogPost[]> {
  const files = await fs.readdir(POSTS_DIRECTORY);

  const posts = await Promise.all(
    files
      .filter((fileName) => fileName.endsWith(".md"))
      .map(async (fileName) => {
        const slug = fileName.replace(/\.md$/, "");
        const source = await fs.readFile(path.join(POSTS_DIRECTORY, fileName), "utf8");
        return toPost(slug, source);
      }),
  );

  return posts.sort((a, b) => +new Date(b.date) - +new Date(a.date));
}

export async function getFeaturedPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await getAllPosts();
  const featured = posts.filter((post) => post.featured);
  return (featured.length ? featured : posts).slice(0, limit);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const filePath = path.join(POSTS_DIRECTORY, `${slug}.md`);
    const source = await fs.readFile(filePath, "utf8");
    return toPost(slug, source);
  } catch {
    return null;
  }
}

export async function getPostHtml(markdown: string): Promise<string> {
  const processed = await remark().use(html).process(markdown);
  return processed.toString();
}

export function formatDutchDate(date: string) {
  return new Intl.DateTimeFormat("nl-NL", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}
