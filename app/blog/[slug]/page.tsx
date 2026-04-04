import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatDutchDate, getAllPosts, getPostBySlug, getPostHtml } from "@/lib/blog";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel niet gevonden",
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const html = await getPostHtml(post.content);

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <article className="pb-20 pt-16 md:pb-28 md:pt-24">
          <div className="container-wide">
            <Link href="/blog" className="button-secondary mb-8 inline-flex w-fit">
              Terug naar blog
            </Link>

            <div className="glass-panel overflow-hidden rounded-[2.3rem] border border-white/8">
              <Image
                src={post.cover}
                alt={post.title}
                width={1600}
                height={900}
                className="h-[260px] w-full object-cover md:h-[420px]"
                priority
              />

              <div className="p-6 md:p-10">
                <div className="flex flex-wrap gap-3">
                  <span className="rounded-full border border-[var(--color-mint)]/18 bg-[var(--color-mint)]/8 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-mint)]">
                    {formatDutchDate(post.date)}
                  </span>
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-white/10 bg-white/4 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/64"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <h1 className="font-heading mt-5 max-w-4xl text-4xl font-semibold tracking-[-0.05em] text-white md:text-6xl">
                  {post.title}
                </h1>
                <p className="mt-5 max-w-3xl text-lg leading-8 text-white/76">{post.excerpt}</p>

                <div
                  className="rich-text mt-10 max-w-3xl text-base md:text-lg"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
