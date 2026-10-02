import Link from "next/link";
import { notFound } from "next/navigation";
import { guides, getGuideBySlug } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";
import GuideLayout from "@/components/guides/GuideLayout.jsx";
import GuideHeroImage from "@/components/guides/GuideHeroImage.jsx";
import GuideShowcase from "@/components/guides/GuideShowcase.jsx";
import PlaceholderImage from "@/components/PlaceholderImage.jsx";
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

      <nav className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">
        <Link href="/what-to-wear" className="transition-colors hover:text-[#8f78e8]">
          Occasion guides
        </Link>
        <span className="mx-2">·</span>
        <span>{guide.occasion}</span>
      </nav>

      {/* Split hero: headline + hook on one side, full generated image on the other */}
      <div className="mt-8 grid gap-12 sm:grid-cols-2 sm:items-center">
        <div>
          <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#8f78e8]">{guide.category}</p>
          <h1 className="mt-4 font-script text-[42px] leading-[1.02] text-[#2b2633] sm:text-[60px]">
            {guide.title}
          </h1>
          <p className="mt-6 font-script text-[24px] italic leading-snug text-[#2b2633]/70 sm:text-[28px]">
            {guide.hook}
          </p>
        </div>
        <GuideHeroImage
          src={`/guides/${guide.slug}-hero.jpg`}
          alt={guide.title}
          className="aspect-[4/5] rounded-[22px] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.45)]"
        />
      </div>

      {/* For her / for him — alternating split with their own placeholder
          photos (not the hero photo again — repeating one image across the
          page would read as repetitive, not "lots of images") */}
      <div className="mt-24 grid gap-8 sm:mt-28 sm:grid-cols-2 sm:items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.4)] sm:order-1">
          <PlaceholderImage seed={`${guide.slug}-her`} width={800} height={1000} />
        </div>
        <div className="sm:order-2">
          <h2 className="font-script text-[34px] leading-none text-[#2b2633]">For her</h2>
          <p className="mt-4 text-[16px] leading-[1.75] text-[#2b2633]/75">{guide.forHer}</p>
        </div>
      </div>

      <div className="mt-16 grid gap-8 sm:grid-cols-2 sm:items-center">
        <div className="aspect-[4/5] overflow-hidden rounded-[22px] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.4)] sm:order-2">
          <PlaceholderImage seed={`${guide.slug}-him`} width={800} height={1000} />
        </div>
        <div className="sm:order-1">
          <h2 className="font-script text-[34px] leading-none text-[#2b2633]">For him</h2>
          <p className="mt-4 text-[16px] leading-[1.75] text-[#2b2633]/75">{guide.forHim}</p>
        </div>
      </div>

      {/* Fabric & color, with the guide's actual palette rendered as swatches */}
      <section className="mt-24 sm:mt-28">
        <h2 className="font-script text-[34px] leading-none text-[#2b2633]">Fabric &amp; colour</h2>
        <p className="mt-4 max-w-2xl text-[16px] leading-[1.75] text-[#2b2633]/75">{guide.fabricAndColor}</p>
        {guide.palette?.length > 0 && (
          <div className="mt-5 flex gap-3">
            {guide.palette.map((hex) => (
              <span
                key={hex}
                className="h-11 w-11 rounded-full shadow-[0_10px_24px_-10px_rgba(43,38,51,0.35)] ring-1 ring-inset ring-white/60"
                style={{ backgroundColor: hex }}
                title={hex}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mt-16 max-w-2xl">
        <h2 className="font-script text-[34px] leading-none text-[#2b2633]">Weather &amp; setting</h2>
        <p className="mt-4 text-[16px] leading-[1.75] text-[#2b2633]/75">{guide.contextNotes}</p>
      </section>

      <GuideShowcase guide={guide} />

      {/* What to avoid — editorial callout */}
      <section className="mt-24 border-y border-[#2b2633]/10 py-10 sm:mt-28 sm:py-12">
        <h2 className="font-script text-[34px] leading-none text-[#2b2633]">What to <span className="font-hand text-[#8f78e8]">skip.</span></h2>
        <ul className="mt-4 space-y-3">
          {guide.avoid.map((item) => (
            <li key={item} className="flex gap-3 text-[16px] leading-[1.7] text-[#2b2633]/75">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8f78e8]" />
              {item}
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-16">
        <Link
          href="/register"
          className="inline-flex items-center gap-2 rounded-full bg-[#2b2633] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#8f78e8]"
        >
          Get this styled for you
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-16">
        <h2 className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">Other occasions</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {guides
            .filter((g) => g.slug !== guide.slug)
            .map((g) => (
              <Link
                key={g.slug}
                href={`/what-to-wear/${g.slug}`}
                className="rounded-full bg-white/60 px-4 py-1.5 text-[13px] text-[#2b2633]/60 ring-1 ring-[#2b2633]/10 transition-colors hover:text-[#2b2633] hover:ring-[#8f78e8]/50"
              >
                {g.occasion}
              </Link>
            ))}
        </div>
      </div>
    </GuideLayout>
  );
}
