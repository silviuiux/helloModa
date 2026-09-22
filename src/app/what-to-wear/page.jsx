import Link from "next/link";
import { guides } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";
import GuideLayout from "@/components/guides/GuideLayout.jsx";
import GuideHeroImage from "@/components/guides/GuideHeroImage.jsx";

export const metadata = {
  title: "Style Guides — What to Wear | helloModa",
  description:
    "Real, specific outfit guides by occasion — weddings, job interviews, first dates, festivals, and more.",
  alternates: { canonical: `${SITE_URL}/what-to-wear` },
  openGraph: {
    title: "Style Guides — What to Wear | helloModa",
    description:
      "Real, specific outfit guides by occasion — weddings, job interviews, first dates, festivals, and more.",
    url: `${SITE_URL}/what-to-wear`,
    type: "website",
  },
};

export default function GuidesIndexPage() {
  const categories = [...new Set(guides.map((g) => g.category))];

  return (
    <GuideLayout>
      <h1 className="mt-6 font-display text-[38px] font-semibold tracking-[-0.03em] leading-[0.98] text-ink sm:text-[56px]">
        What to wear, by occasion
      </h1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-muted">
        Outfit dressing depends more on the specific occasion than most advice admits — what
        works at a beach wedding will look out of place at a job interview. Pick your occasion
        below for real, specific guidance.
      </p>

      {categories.map((category, i) => (
        <section key={category} className={i === 0 ? "mt-16 sm:mt-20" : "mt-24 sm:mt-28"}>
          <h2 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">{category}</h2>
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {guides
              .filter((g) => g.category === category)
              .map((g) => (
                <Link key={g.slug} href={`/what-to-wear/${g.slug}`} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-xl3 transition-transform duration-300 group-hover:-translate-y-1">
                    <GuideHeroImage
                      src={`/guides/${g.slug}-hero.jpg`}
                      alt={g.occasion}
                      className="h-full w-full"
                    />
                  </div>
                  <h3 className="mt-4 font-display text-[20px] font-semibold tracking-[-0.03em] text-ink group-hover:text-accent-deep">
                    {g.occasion}
                  </h3>
                  <p className="mt-1.5 text-[13.5px] leading-relaxed text-muted">{g.hook}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </GuideLayout>
  );
}
