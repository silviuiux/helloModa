import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuideBySlug } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";
import GuideLayout from "@/components/guides/GuideLayout.jsx";
import { ArrowRight } from "@/components/Icons.jsx";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return {};
  const url = `${SITE_URL}/what-to-wear/${guide.slug}`;
  return {
    title: `${guide.title} | helloModa`,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url,
      type: "article",
    },
  };
}

export default function GuidePage({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.title,
    description: guide.metaDescription,
    author: { "@type": "Organization", name: "helloModa" },
    publisher: { "@type": "Organization", name: "helloModa" },
    mainEntityOfPage: `${SITE_URL}/what-to-wear/${guide.slug}`,
  };

  return (
    <GuideLayout>
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mt-6 text-[13px] text-faint">
        <Link href="/what-to-wear" className="hover:text-accent-deep">
          Style guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-muted">{guide.occasion}</span>
      </nav>

      <h1 className="mt-3 font-display text-[34px] font-medium leading-tight text-ink sm:text-[44px]">
        {guide.title}
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink">{guide.hook}</p>

      <div className="mt-10 space-y-8">
        <Section title="For her">{guide.forHer}</Section>
        <Section title="For him">{guide.forHim}</Section>
        <Section title="Fabric & color">{guide.fabricAndColor}</Section>
        <Section title="Weather notes">{guide.weatherNotes}</Section>

        <section>
          <h2 className="font-display text-[20px] font-medium text-ink">What to avoid</h2>
          <ul className="mt-3 space-y-2">
            {guide.avoid.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-ink">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="glass mt-12 rounded-xl3 p-6 sm:p-8">
        <p className="label text-faint">Want it tailored to you</p>
        <p className="mt-2 font-script text-[32px] leading-tight text-ink">
          "{guide.promptExample}"
        </p>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          helloModa turns a prompt like that into one specific outfit direction — pulling from
          your own closet first, styled for the actual occasion, not a generic template.
        </p>
        <Link
          href="/register"
          className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.02]"
        >
          Try helloModa
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-12">
        <h2 className="font-display text-[18px] font-medium text-ink">Other occasions</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {guides
            .filter((g) => g.slug !== guide.slug)
            .map((g) => (
              <Link
                key={g.slug}
                href={`/what-to-wear/${g.slug}`}
                className="glass-soft rounded-full px-3.5 py-1.5 text-[13px] text-muted transition-colors hover:text-accent-deep"
              >
                {g.occasion}
              </Link>
            ))}
        </div>
      </div>
    </GuideLayout>
  );
}

function Section({ title, children }) {
  return (
    <section>
      <h2 className="font-display text-[20px] font-medium text-ink">{title}</h2>
      <p className="mt-2 text-[15px] leading-relaxed text-ink">{children}</p>
    </section>
  );
}
