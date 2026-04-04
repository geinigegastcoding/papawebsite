import Image from "next/image";
import Link from "next/link";

import { SectionHeading } from "@/components/section-heading";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { formatDutchDate, getAllPosts } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description: "Blog van Magis Data Intelligence over analyse, dashboards en informatievoorziening.",
};

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="site-shell">
      <SiteHeader />

      <main>
        <section className="border-b border-white/8 py-16 md:py-24">
          <div className="container-wide grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-end">
            <SectionHeading
              eyebrow="Blog"
              title="Inzichten over data-intelligentie, dashboards en analytische keuzes."
              description="Hier komen artikelen die laten zien hoe Gerhard Magis denkt, analyseert en organisaties helpt om betere informatie uit data te halen."
            />
            <div className="overflow-hidden rounded-[2rem] border border-white/8">
              <Image
                src="/images/data-connections.jpg"
                alt="Abstracte lijnen en dataverbindingen"
                width={1400}
                height={900}
                className="h-[250px] w-full object-cover md:h-[320px]"
                priority
              />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-28">
          <div className="container-wide grid gap-5">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="glass-panel card-hover overflow-hidden rounded-[2rem] border border-white/8 md:grid md:grid-cols-[320px_1fr]"
              >
                <div className="overflow-hidden">
                  <Image
                    src={post.cover}
                    alt={post.title}
                    width={1200}
                    height={900}
                    className="h-64 w-full object-cover md:h-full"
                  />
                </div>
                <div className="p-6 md:p-8">
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

                  <h2 className="font-heading mt-5 text-3xl font-semibold tracking-[-0.04em] text-white">
                    {post.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-base leading-8 text-white/72">{post.excerpt}</p>

                  <Link href={`/blog/${post.slug}`} className="button-secondary mt-8 w-fit">
                    Lees artikel
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
