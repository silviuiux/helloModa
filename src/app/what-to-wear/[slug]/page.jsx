import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuideBySlug } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";
import GuideLayout from "@/components/guides/GuideLayout.jsx";
import GuideHeroImage from "@/components/guides/GuideHeroImage.jsx";
import GuideShowcase from "@/components/guides/GuideShowcase.jsx";
import GarmentArt from "@/components/GarmentArt.jsx";
import { ArrowRight } from "@/components/Icons.jsx";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export function generateMetadata({ params }) {
  const guide = getGuideBySlug(params.slug);
  if (!guide) return {};
  const url = `${SITE_URL}/what-to-wear/${guide.slug}`;
  const imageUrl = `${SITE_URL}/guides/${guide.slug}-hero.jpg`;
  return {
    title: `${guide.title} | helloModa`,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: guide.title,
      description: guide.metaDescription,
      url,
      type: "article",
      images: [{ url: imageUrl }],
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
    image: `${SITE_URL}/guides/${guide.slug}-hero.jpg`,
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

      {/* Split hero: headline + hook on one side, full generated image on the other */}
      <div className="mt-6 grid gap-10 sm:grid-cols-2 sm:items-center">
        <div>
          <p className="label text-accent-deep">{guide.category}</p>
          <h1 className="mt-3 font-display text-[38px] font-medium leading-[0.98] text-ink sm:text-[54px]">
            {guide.title}
          </h1>
          <p className="mt-6 font-script text-[26px] leading-tight text-accent-deep sm:text-[30px]">
            {guide.hook}
          </p>
        </div>
        <GuideHeroImage
          src={`/guides/${guide.slug}-hero.jpg`}
          alt={guide.title}
          className="aspect-[4/5] rounded-xl3"
        />
      </div>

      {/* For her / for him — alternating split with illustrated look tiles
          (not the real hero photo again — repeating one generated image
          across the page would read as repetitive, not "lots of images") */}
      <div className="mt-24 grid gap-8 sm:mt-28 sm:grid-cols-2 sm:items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-xl3 sm:order-1">
          <GarmentArt type="dress" />
        </div>
        <div className="sm:order-2">
          <h2 className="font-display text-[24px] font-medium text-ink">For her</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink">{guide.forHer}</p>
        </div>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 sm:items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-xl3 sm:order-2">
          <GarmentArt type="outerwear" />
        </div>
        <div className="sm:order-1">
          <h2 className="font-display text-[24px] font-medium text-ink">For him</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-ink">{guide.forHim}</p>
        </div>
      </div>

      {/* Fabric & color, with the guide's actual palette rendered as swatches */}
      <section className="mt-24 sm:mt-28">
        <h2 className="font-display text-[24px] font-medium text-ink">Fabric & color</h2>
        <p className="mt-3 max-w-2xl text-[16px] leading-relaxed text-ink">{guide.fabricAndColor}</p>
        {guide.palette?.length > 0 && (
          <div className="mt-5 flex gap-3">
            {guide.palette.map((hex) => (
              <span
                key={hex}
                className="h-10 w-10 rounded-full shadow-soft ring-1 ring-inset ring-white/60"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-display text-[24px] font-medium text-ink">Weather & setting notes</h2>
        <p className="mt-3 text-[16px] leading-relaxed text-ink">{guide.contextNotes}</p>
      </section>

      <GuideShowcase guide={guide} />

      {/* What to avoid — editorial callout */}
      <section className="glass mt-24 rounded-xl3 p-8 sm:mt-28 sm:p-10">
        <h2 className="font-display text-[24px] font-medium text-ink">What to avoid</h2>
        <ul className="mt-4 space-y-3">
          {guide.avoid.map((item) => (
            <li key={item} className="flex gap-3 text-[16px] leading-relaxed text-ink">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16">
        <Link
          href="/register"
          className="inline-flex items-center gap-1.5 rounded-full bg-accent px-5 py-2.5 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.02]"
        >
          Try helloModa
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-16">
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
