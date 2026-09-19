import GarmentArt from "../GarmentArt.jsx";

// Occasion examples tied to the actual GTM wedge (business plan's "Wedding
// Guest" launch niche + adjacent high-intent moments) — not arbitrary demo
// content. See docs/09-conversation-design.md.
const OCCASION_CARDS = [
  {
    type: "dress",
    label: "Wedding guest",
    prompt: "I'm attending a vineyard wedding in June — smart casual, outdoors.",
  },
  {
    type: "outerwear",
    label: "Big interview",
    prompt: "I have a first-round interview at a tech company next week.",
  },
  {
    type: "top",
    label: "Weekend brunch",
    prompt: "Casual brunch with old friends this weekend — comfortable but put-together.",
  },
];

const EXAMPLE_PROMPTS = [
  "What should I wear to a black-tie gala?",
  "Help me pack for a beach weekend",
  "I need an outfit for a work presentation",
  "Something for a first date, not too much",
];

function firstNameFromEmail(email) {
  if (!email) return null;
  const local = email.split("@")[0];
  const cleaned = local.replace(/[._-]+/g, " ").trim();
  if (!cleaned) return null;
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
}

export default function EmptyState({ userDisplayName, userEmail, onPrompt }) {
  const name = userDisplayName || firstNameFromEmail(userEmail);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col items-center px-4 py-10 text-center sm:py-16">
      <h1 className="font-display text-[36px] font-medium leading-tight text-ink sm:text-[44px]">
        hello{name ? `, ${name}` : ""}
      </h1>
      <p className="mt-2 text-[14px] font-medium text-accent-deep">this is helloModa</p>
      <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-muted">
        Describe an occasion, and I'll style a look from your closet — plus what to add.
      </p>

      <div className="scroll-area mt-9 flex w-full snap-x gap-3 overflow-x-auto pb-2">
        {OCCASION_CARDS.map((c) => (
          <button
            key={c.label}
            onClick={() => onPrompt(c.prompt)}
            className="group relative aspect-[4/5] w-40 shrink-0 snap-start overflow-hidden rounded-xl2 shadow-soft transition-transform hover:-translate-y-0.5 sm:w-48"
          >
            <GarmentArt type={c.type} />
            <div
              className="pointer-events-none absolute inset-x-0 bottom-0 h-16"
              style={{ background: "linear-gradient(to top, rgba(255,255,255,0.9), transparent)" }}
            />
            <span className="absolute bottom-3 left-3 text-[13px] font-medium text-ink">
              {c.label}
            </span>
          </button>
        ))}
      </div>

      <div className="scroll-area mt-4 flex w-full snap-x gap-2 overflow-x-auto pb-1">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPrompt(p)}
            className="glass-soft shrink-0 snap-start whitespace-nowrap rounded-full px-4 py-2 text-[13px] text-muted transition-colors hover:text-accent-deep"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
