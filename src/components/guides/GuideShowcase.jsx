import GuideHeroImage from "./GuideHeroImage.jsx";

// A literal, honest "here's how helloModa helps" block — styled with the
// exact same visual grammar as a real chat turn (MessageBubble.jsx: script
// title, narrative copy, quick-reply chips), reusing the guide's own hero
// image rather than a mockup or screenshot. This is what the product
// actually looks like, not an approximation of it.
export default function GuideShowcase({ guide }) {
  return (
    <section className="mt-24 sm:mt-28">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">See it in helloModa</p>
      <div className="mt-5 grid gap-8 sm:grid-cols-2 sm:items-start">
        <GuideHeroImage
          src={`/guides/${guide.slug}-hero.jpg`}
          alt={guide.occasion}
          className="aspect-[4/5] rounded-[22px] shadow-[0_50px_90px_-45px_rgba(90,70,160,0.45)]"
        />
        <div className="flex flex-col">
          <h2 className="font-script text-[44px] leading-[1] text-[#2b2633] sm:text-[52px]">
            {guide.occasion}
          </h2>
          <p className="mt-5 text-[16px] leading-[1.75] text-[#2b2633]/75">{guide.hook}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="font-hand text-[24px] leading-snug text-[#8f78e8]">
              “{guide.promptExample}”
            </span>
          </div>
        </div>
      </div>
      <p className="mt-6 max-w-2xl text-[13.5px] leading-[1.7] text-[#2b2633]/45">
        This is what a helloModa answer looks like. Describe your own version of this occasion
        and get one specific look — built from your wardrobe first, painted on you, not a grid
        of generic options.
      </p>
    </section>
  );
}
