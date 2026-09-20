import Link from "next/link";
import { guides } from "@/data/guides.js";
import { SITE_URL } from "@/lib/siteConfig.js";
import GuideLayout from "@/components/guides/GuideLayout.jsx";

export const metadata = {
  title: "Wedding Guest Style Guides — What to Wear | helloModa",
  description:
    "Real, specific wedding guest outfit guides by occasion — beach, black-tie, garden, vineyard, fall, and winter weddings.",
  alternates: { canonical: `${SITE_URL}/what-to-wear` },
  openGraph: {
    title: "Wedding Guest Style Guides — What to Wear | helloModa",
    description:
      "Real, specific wedding guest outfit guides by occasion — beach, black-tie, garden, vineyard, fall, and winter weddings.",
    url: `${SITE_URL}/what-to-wear`,
    type: "website",
  },
};

export default function GuidesIndexPage() {
  return (
    <GuideLayout>
      <h1 className="mt-6 font-display text-[34px] font-medium leading-tight text-ink sm:text-[42px]">
        What to wear, by occasion
      </h1>
      <p className="mt-3 max-w-2xl text-[15.5px] leading-relaxed text-muted">
        Wedding guest dressing depends more on the specific occasion than most advice admits —
        what works at a beach wedding will look out of place at a black-tie one. Pick your
        occasion below for real, specific guidance.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {guides.map((g) => (
          <Link
            key={g.slug}
            href={`/what-to-wear/${g.slug}`}
            className="glass group rounded-xl3 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
          >
            <h2 className="font-display text-[20px] font-medium text-ink group-hover:text-accent-deep">
              {g.occasion}
            </h2>
            <p className="mt-2 text-[13.5px] leading-relaxed text-muted">{g.hook}</p>
          </Link>
        ))}
      </div>
    </GuideLayout>
  );
}
