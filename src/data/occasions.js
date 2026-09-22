// Home/welcome-screen occasion carousel (src/components/chat/EmptyState.jsx),
// shuffled on each mount so returning users don't see the same static set
// every time. Same pattern as src/data/guides.js: `heroImagePrompt` feeds
// scripts/generate-occasion-images.mjs — a real generated image (house
// watercolor style, src/lib/imageGen.js) saved to
// public/occasions/{slug}-hero.jpg. Run that script after adding a card
// (needs REPLICATE_API_TOKEN); cards degrade gracefully to a seeded
// placeholder photo until the file exists (PlaceholderImage.jsx). `prompt` is what gets sent as the
// first chat message when a card is tapped.
export const occasions = [
  {
    slug: "wedding-guest",
    label: "Wedding guest",
    type: "dress",
    prompt: "I'm attending a vineyard wedding in June — smart casual, outdoors.",
    heroImagePrompt:
      "A well-dressed couple walking between vineyard rows at golden hour, smart-casual wedding-guest attire, warm romantic light",
  },
  {
    slug: "black-tie-event",
    label: "Black-tie event",
    type: "outerwear",
    prompt: "I have a black-tie gala this weekend, help me find something.",
    heroImagePrompt:
      "A couple in formal black-tie evening wear arriving at a grand gala entrance at night, dramatic uplighting, elegant atmosphere",
  },
  {
    slug: "big-interview",
    label: "Big interview",
    type: "bottoms",
    prompt: "I have a first-round interview at a tech company next week.",
    heroImagePrompt:
      "A confident young professional in smart tailored office wear walking through a bright modern office lobby, natural daylight",
  },
  {
    slug: "first-date",
    label: "First date",
    type: "top",
    prompt: "First date this Friday — something comfortable but considered.",
    heroImagePrompt:
      "Two people on a relaxed first date at an evening café table, warm string lights, considered but comfortable outfits",
  },
  {
    slug: "summer-festival",
    label: "Summer festival",
    type: "accessory",
    prompt: "Heading to an outdoor music festival this summer, need an outfit.",
    heroImagePrompt:
      "A group of friends in breezy festival outfits walking through an outdoor music festival at sunset, dusty golden light",
  },
  {
    slug: "weekend-brunch",
    label: "Weekend brunch",
    type: "shoe",
    prompt: "Casual brunch with old friends this weekend — comfortable but put-together.",
    heroImagePrompt:
      "Friends at a sunny weekend brunch on a café terrace, relaxed put-together outfits, bright morning light",
  },
  {
    slug: "weekend-trip",
    label: "Weekend trip",
    type: "bag",
    prompt: "Packing for a long weekend trip — versatile pieces that mix and match.",
    heroImagePrompt:
      "A traveler with a weekend bag walking through a train station or airport, versatile easy-to-mix travel outfit, soft daylight",
  },
  {
    slug: "art-school-graduation",
    label: "Art school graduation",
    type: "dress",
    prompt: "I'm graduating from art school next month, want something creative but polished.",
    heroImagePrompt:
      "A creative graduate in an artistic yet polished outfit standing in a sunlit art studio full of canvases and easels",
  },
  {
    slug: "90s-throwback-party",
    label: "90's throwback party",
    type: "top",
    prompt: "Going to a 90s throwback party — need a fun, authentic look.",
    heroImagePrompt:
      "Friends in authentic 90s-inspired streetwear at a retro throwback party, neon signage, playful nostalgic energy",
  },
  {
    slug: "rooftop-birthday",
    label: "Rooftop birthday",
    type: "outerwear",
    prompt: "It's a friend's rooftop birthday party this weekend, evening in the city.",
    heroImagePrompt:
      "Friends celebrating on a city rooftop at dusk, skyline lights behind them, smart-casual evening outfits",
  },
  {
    slug: "baby-shower",
    label: "Baby shower",
    type: "bottoms",
    prompt: "I'm hosting a baby shower this Sunday — soft, pretty, not too dressy.",
    heroImagePrompt:
      "A host in a soft pastel outfit at a daytime baby shower decorated with flowers, gentle natural light",
  },
  {
    slug: "holiday-office-party",
    label: "Holiday office party",
    type: "dress",
    prompt: "Our office holiday party is coming up — festive but still professional.",
    heroImagePrompt:
      "A professional in a festive but workplace-appropriate outfit at an evening holiday office party, warm string lights and greenery",
  },
  {
    slug: "museum-date",
    label: "Museum date",
    type: "top",
    prompt: "Taking someone to a museum opening this weekend, want to look put-together.",
    heroImagePrompt:
      "A couple in refined casual outfits walking through a bright modern art museum gallery, minimalist architecture",
  },
  {
    slug: "concert-night",
    label: "Concert night",
    type: "shoe",
    prompt: "Going to a concert tonight, need something comfortable I can move in.",
    heroImagePrompt:
      "Friends in comfortable edgy outfits at an evening concert, stage lights glowing behind them in a crowd",
  },
  {
    slug: "ski-weekend",
    label: "Ski weekend",
    type: "outerwear",
    prompt: "Heading to the mountains for a ski weekend — stylish but warm.",
    heroImagePrompt:
      "A couple in stylish warm winter outerwear standing on a snowy mountain lodge deck, crisp alpine daylight",
  },
  {
    slug: "garden-party",
    label: "Garden party",
    type: "dress",
    prompt: "Invited to an afternoon garden party — light and elegant.",
    heroImagePrompt:
      "Guests in light elegant outfits at an afternoon garden party surrounded by blooming flowers, soft dappled sunlight",
  },
  {
    slug: "networking-mixer",
    label: "Networking mixer",
    type: "top",
    prompt: "I have a networking mixer after work, want to look sharp but approachable.",
    heroImagePrompt:
      "A professional in a sharp yet approachable smart-casual outfit mingling at an evening networking event, warm indoor lighting",
  },
  {
    slug: "city-weekend-getaway",
    label: "City weekend getaway",
    type: "bag",
    prompt: "Planning a weekend city getaway — comfortable walking outfit with some polish.",
    heroImagePrompt:
      "A traveler in a comfortable polished outfit walking along a charming city street with a weekend bag, bright afternoon light",
  },
  {
    slug: "new-years-eve",
    label: "New Year's Eve",
    type: "accessory",
    prompt: "New Year's Eve party — want something a little glam.",
    heroImagePrompt:
      "Friends in glamorous evening outfits celebrating at a New Year's Eve party, sparkling lights and confetti in the air",
  },
  {
    slug: "cozy-fall-date",
    label: "Cozy fall date",
    type: "bottoms",
    prompt: "A cozy fall date at a pumpkin patch — cute but practical.",
    heroImagePrompt:
      "A couple in cozy layered fall outfits walking through a pumpkin patch, warm autumn light and falling leaves",
  },
];
