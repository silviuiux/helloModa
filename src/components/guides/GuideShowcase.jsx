import GuideHeroImage from "./GuideHeroImage.jsx";

// A literal, honest "here's how helloModa helps" block — styled with the
// exact same visual grammar as a real chat turn (MessageBubble.jsx: script
// title, narrative copy, quick-reply chips), reusing the guide's own hero
// image rather than a mockup or screenshot. This is what the product
// actually looks like, not an approximation of it.
export default function GuideShowcase({ guide }) {
  return (
    <section className="mt-24 sm:mt-28">
      <p className="label text-faint">See it in helloModa</p>
      <div className="mt-5 grid gap-8 sm:grid-cols-2 sm:items-start">
        <GuideHeroImage
          src={`/guides/${guide.slug}-hero.jpg`}
          alt={guide.occasion}
          className="aspect-[4/5] rounded-xl2"
        />
        <div className="flex flex-col">
          <h2 className="font-script text-[44px] leading-[0.9] text-ink sm:text-[52px]">
            {guide.occasion}
          </h2>
          <p className="mt-4 text-[16px] leading-relaxed text-ink">{guide.hook}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="glass-soft rounded-full px-3.5 py-1.5 text-[13px] text-accent-deep">
              "{guide.promptExample}"
            </span>
          </div>
        </div>
      </div>
      <p className="mt-5 max-w-2xl text-[13px] leading-relaxed text-faint">
        This is what a helloModa turn looks like — describe your own occasion and get one
        specific direction, pulling from your closet first, not a grid of generic options.
      </p>
    </section>
  );
}
