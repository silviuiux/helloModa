import Link from "next/link";
import { guides } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";
import GuideLayout from "@/components/guides/GuideLayout.jsx";

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
      <h1 className="mt-6 font-display text-[34px] font-medium leading-tight text-ink sm:text-[42px]">
        What to wear, by occasion
      </h1>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">
        Outfit dressing depends more on the specific occasion than most advice admits — what
        works at a beach wedding will look out of place at a job interview. Pick your occasion
        below for real, specific guidance.
      </p>

      {categories.map((category) => (
        <section key={category} className="mt-12 first:mt-10">
          <h2 className="font-display text-[20px] font-medium text-ink">{category}</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides
              .filter((g) => g.category === category)
              .map((g) => (
                <Link
                  key={g.slug}
                  href={`/what-to-wear/${g.slug}`}
                  className="glass group rounded-xl3 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <h3 className="font-display text-[20px] font-medium text-ink group-hover:text-accent-deep">
                    {g.occasion}
                  </h3>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{g.hook}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </GuideLayout>
  );
}
