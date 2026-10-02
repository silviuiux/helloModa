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
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">Occasion guides</p>
      <h1 className="mt-5 font-script text-[46px] leading-[1.02] text-[#2b2633] sm:text-[68px]">
        What to wear, <span className="font-hand text-[#8f78e8]">by occasion.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-[16px] leading-[1.7] text-[#2b2633]/60">
        What works at a beach wedding looks wrong at a job interview — so generic style advice
        only gets you so far. Pick your occasion for specific, practical guidance: what to wear,
        what to skip, and how to handle the weather and the setting.
      </p>

      {categories.map((category, i) => (
        <section key={category} className={i === 0 ? "mt-16 sm:mt-20" : "mt-24 sm:mt-28"}>
          <h2 className="border-b border-[#2b2633]/10 pb-3 text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">{category}</h2>
          <div className="mt-8 grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-3">
            {guides
              .filter((g) => g.category === category)
              .map((g) => (
                <Link key={g.slug} href={`/what-to-wear/${g.slug}`} className="group">
                  <div className="aspect-[4/5] overflow-hidden rounded-[20px] shadow-[0_40px_80px_-45px_rgba(90,70,160,0.45),0_0_0_1px_rgba(43,38,51,0.04)] transition-transform duration-500 group-hover:-translate-y-1">
                    <GuideHeroImage
                      src={`/guides/${g.slug}-hero.jpg`}
                      alt={g.occasion}
                      className="h-full w-full"
                    />
                  </div>
                  <h3 className="mt-5 font-script text-[26px] leading-tight text-[#2b2633] transition-colors group-hover:text-[#8f78e8]">
                    {g.occasion}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[1.65] text-[#2b2633]/55">{g.hook}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </GuideLayout>
  );
}
