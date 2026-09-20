// SEO landing pages ("What to wear to [X]") — docs/03-roadmap.md Phase 1 GTM
// wedge, broadened 2026-09-20 beyond wedding-only (wedding was always meant
// as one example occasion, not the whole scope — see that changelog entry).
// Public, indexed content (cleared 2026-09-20, see docs/06-risks-legal.md) —
// static and hand-curated rather than generated per-request, so it stays
// stable for search engines and genuinely useful rather than templated
// filler. Add a guide by adding an object here; the route
// (src/app/what-to-wear/[slug]/page.jsx) picks it up automatically.
// `category` groups guides on the index page — "Wedding Guest" or
// "Everyday Occasions" for now, add a new one freely as the set grows.
// `contextNotes` covers weather for outdoor occasions or venue/culture
// context for others — same field, occasion-appropriate content.
// `heroImagePrompt` feeds scripts/generate-guide-images.mjs — a real
// generated hero image (house watercolor style, src/lib/imageGen.js), saved
// as a static file at public/guides/{slug}-hero.jpg. Run that script after
// adding a guide (needs REPLICATE_API_TOKEN); pages degrade gracefully to
// an illustrated placeholder until the file exists (GuideHeroImage.jsx).
// `palette` is a handful of hex swatches matching the guide's described
// color story — rendered as literal color chips, not an image.
export const guides = [
  {
    slug: "beach-wedding",
    occasion: "Beach Wedding",
    category: "Wedding Guest",
    title: "What to Wear to a Beach Wedding",
    heroImagePrompt:
      "A woman in a flowing sand-toned linen midi dress walking barefoot along a beach wedding aisle at golden hour, soft ocean breeze, warm sunset light",
    palette: ["#e8dcc8", "#9dc2b8", "#a9c0d6", "#f5f0e6", "#e8b3a0"],
    metaDescription:
      "A real guide to beach wedding guest attire — what actually works on sand, in wind, and in humidity, for her and for him.",
    hook: "Beach weddings look effortless in photos and are the easiest occasion to get wrong in person — heels sink, structured fabric wilts, and \"resort wear\" can tip into too casual. Here's what actually holds up.",
    forHer:
      "Lean into flowing, unstructured silhouettes — a midi or maxi dress in a soft, breathable fabric (linen-blend, crepe, or a lightweight viscose) moves well in sea air and doesn't cling in humidity. Florals and soft solids both work; avoid anything stark white, which reads as competing with the dress. Skip heels entirely — a wedge or a flat sandal is not a compromise here, it's the right call.",
    forHim:
      "Linen or a linen-cotton blend shirt, short or long sleeve depending on the time of day, worn untucked or loosely tucked. Chinos or lightweight tailored trousers in a pale neutral — navy, tan, or sage — read intentional without a jacket. If the invite says \"jacket encouraged,\" bring one but expect to take it off; pick something unstructured that won't look wrinkled after an hour on a chair.",
    fabricAndColor:
      "Natural fibers only if you can help it — linen, cotton, lightweight viscose. Synthetic blends trap heat and show sweat differently than natural fabric does, which matters more here than at an indoor venue. Color-wise, think sun-bleached: sand, seafoam, dusty blue, warm white (not stark white), soft coral.",
    contextNotes:
      "Wind is the real variable, not just heat — a full maxi skirt can become a liability during the ceremony itself. If the venue is genuinely exposed (no tent, right on the sand), a slightly shorter hem or a dress with some weight to the fabric behaves better than the lightest option in your closet.",
    avoid: [
      "Heels of any kind — they sink, and there's no elegant recovery from that",
      "Stark white or ivory — still the bride's territory even at the most casual wedding",
      "Heavy structured fabric (wool, thick cotton twill) — it will show heat and creasing within the hour",
      "A full suit with tie, unless the invitation explicitly asks for it",
    ],
    promptExample: "What should I wear to a beach wedding this summer?",
  },
  {
    slug: "black-tie-wedding",
    occasion: "Black-Tie Wedding",
    category: "Wedding Guest",
    title: "What to Wear to a Black-Tie Wedding",
    heroImagePrompt:
      "A couple in black-tie eveningwear, her in a full-length emerald silk gown and him in a classic black tuxedo, at an elegant indoor gala reception, warm chandelier light",
    palette: ["#1a1a1a", "#1c2440", "#1f4d3a", "#5c1a2b", "#1e3a5f"],
    metaDescription:
      "What \"black tie\" actually requires for a wedding guest — the real dress code rules, and where a little personal style is still allowed.",
    hook: "\"Black tie\" is the one dress code on a wedding invitation that isn't a suggestion — it's a specific, well-defined standard, and showing up underdressed is more noticeable here than anywhere else on this list.",
    forHer:
      "A full-length evening gown is the safest, most correct choice — cocktail-length is generally acceptable for black tie (though not for black tie optional's stricter cousin), but full-length reads as more considered. Rich, formal fabrics — silk, satin, velvet in cooler months — over anything casual like jersey or cotton. This is the one occasion where more embellishment (a structured bodice, a statement sleeve) is appropriate rather than excessive.",
    forHim:
      "A tuxedo, properly: black dinner jacket, matching trousers, a white dress shirt, and a black bow tie — not a long tie, not a skinny suit substituted in. If you don't own one, this is worth renting correctly rather than approximating with a dark suit; guests notice the difference more than you'd expect. Patent leather or highly polished black dress shoes, black socks.",
    fabricAndColor:
      "Black, midnight navy, or deep jewel tones (emerald, burgundy, sapphire) for her gown. For him, black is the standard — a midnight blue dinner jacket is a well-established, elegant substitute, but nothing lighter or more casual than that.",
    contextNotes:
      "Black tie weddings are almost always indoor, evening events, so weather rarely changes the calculus — the exception is a warm-climate black-tie event, where breathable formal fabrics (a lightweight silk gown, a tropical-wool tuxedo) matter more than the color rules above.",
    avoid: [
      "A cocktail dress that reads more \"office party\" than \"gala\" — black tie sits above typical cocktail attire",
      "A suit-and-tie substitute for him when a tuxedo is genuinely expected — it will read as underdressed, not stylish",
      "Bright, saturated color for a gown — this dress code favors richness and formality over statement color",
      "Sneakers or any daytime shoe, no matter how \"elevated\"",
    ],
    promptExample: "I need a black-tie wedding guest outfit — what actually works?",
  },
  {
    slug: "garden-wedding",
    occasion: "Garden Wedding",
    category: "Wedding Guest",
    title: "What to Wear to a Garden Wedding",
    heroImagePrompt:
      "A woman in a soft floral midi dress and a man in a light grey suit standing together at a lush garden wedding reception, dappled afternoon sunlight through trees",
    palette: ["#a8b89a", "#d4a8ab", "#f2ead9", "#c9bfe0"],
    metaDescription:
      "Garden wedding guest attire that handles grass, sun, and a semi-formal dress code — real outfit guidance, not just a mood board.",
    hook: "A garden wedding sits right in the middle of the formality scale — dressier than beach, softer than black tie — and the real challenge is practical: grass, uneven ground, and often full sun for at least part of the day.",
    forHer:
      "A midi dress in a soft floral, a solid pastel, or a light botanical print suits the setting without competing with it. A wedge, block heel, or a sturdy flat sandal handles grass far better than a stiletto — this is worth prioritizing over the shoe you'd pick for the dress alone. A light cardigan or shawl is worth bringing even in summer; gardens cool down fast once the sun drops.",
    forHim:
      "A suit in a lighter fabric and color than you'd wear indoors — tan, light grey, soft blue — reads appropriately dressed without looking overheated. A dress shirt with the jacket is usually enough; save the tie for anything explicitly formal. Loafers or leather derbies over anything with a slick sole, which struggles on grass and gravel paths.",
    fabricAndColor:
      "Lighter-weight wool, linen blends, and cotton poplin all read well here. Color palette leans soft and organic — sage, dusty rose, cream, soft lavender — rather than the deep jewel tones you'd wear to an evening event.",
    contextNotes:
      "Check whether the ceremony and reception are both outdoors, or just one — a lot of garden venues move the reception under a tent or indoors as the evening cools, which changes what you actually need to carry with you (a wrap, a change of shoes) more than what you wear.",
    avoid: [
      "Stiletto heels — genuinely impractical on grass, not just uncomfortable",
      "All-white or all-black outfits, both of which can read as too formal or too somber against a garden's softness",
      "Heavy fabric that won't breathe if the ceremony runs in full sun",
      "Anything you'd only wear once with dry-clean-only care — garden settings mean grass stains and pollen are a real risk",
    ],
    promptExample: "What should I wear to an outdoor garden wedding in early summer?",
  },
  {
    slug: "vineyard-wedding",
    occasion: "Vineyard Wedding",
    category: "Wedding Guest",
    title: "What to Wear to a Vineyard Wedding",
    heroImagePrompt:
      "A couple in warm earth-toned linen outfits standing among vineyard rows at golden hour, rolling hills in the background",
    palette: ["#c1694a", "#7d7a4a", "#f0e6d2", "#c9a44e"],
    metaDescription:
      "Vineyard wedding guest outfits that match the setting's relaxed elegance — golden-hour-ready, and built for uneven ground and shifting temperatures.",
    hook: "Vineyard weddings have a specific visual identity — golden light, rolling rows, rustic-elegant styling — and the best guest outfits lean into that rather than fighting it with anything too sharp or too casual.",
    forHer:
      "A flowing midi or maxi dress in warm, earthy tones — terracotta, olive, cream, dusty gold — photographs beautifully in the golden-hour light most vineyard weddings are timed around. Choose a low block heel or a wedge over anything with a thin heel; vineyard paths are gravel or uneven soil more often than pavement.",
    forHim:
      "Linen or lightweight cotton trousers with a relaxed button-down, sleeves rolled, works for a daytime ceremony; add a soft blazer as the evening cools, which it reliably does even after a hot afternoon. Suede or leather loafers suit the setting better than anything too polished or formal.",
    fabricAndColor:
      "Natural, textured fabrics — linen, raw silk, soft cotton — echo the setting's own materials (wood, stone, vines) better than anything glossy or synthetic. Warm neutrals and muted earth tones read as considered here; very bright or very cool-toned color can feel out of place against the landscape.",
    contextNotes:
      "The temperature swing from afternoon to evening at a vineyard can be significant, especially in wine country's typically dry climate — bring a layer even if the forecast says warm, since most of these events run into evening.",
    avoid: [
      "Anything with a thin stiletto heel — gravel and soil will make the evening genuinely difficult",
      "Cool-toned brights (icy blue, neon) that clash with the setting's warm, earthy palette",
      "Fully formal black-tie attire unless specifically requested — vineyard weddings are almost always dressy-casual to semi-formal",
      "Fabric that wrinkles badly after a few hours seated outdoors",
    ],
    promptExample: "Help me plan an outfit for a vineyard wedding this fall",
  },
  {
    slug: "fall-wedding",
    occasion: "Fall Wedding",
    category: "Wedding Guest",
    title: "What to Wear to a Fall Wedding",
    heroImagePrompt:
      "A woman in a burgundy midi dress with a tailored coat and a man in a deep navy suit at an outdoor fall wedding, autumn leaves, warm afternoon light",
    palette: ["#722f37", "#2f4a3c", "#c1622d", "#4a2c4a"],
    metaDescription:
      "Fall wedding guest attire that actually matches the season — rich color, real layering, and what to do when the weather can't decide.",
    hook: "Fall weddings give you the most room to have fun with color and texture of any season — but the real challenge is a temperature swing that can run 20 degrees between an afternoon ceremony and an evening reception.",
    forHer:
      "A midi dress in a rich, seasonal color — burgundy, forest green, burnt orange, deep plum — makes the most of the season rather than defaulting to safe neutrals. A tailored coat or a structured wrap that can come on and off through the day is more useful than a delicate shawl, which won't hold up once it's genuinely cold.",
    forHim:
      "A suit in a warmer, richer tone — deep navy, hunter green, chocolate brown — than you'd wear in summer, paired with a subtly textured tie (wool, knit) rather than a slick silk one. A well-fitted overcoat is worth having on hand for an outdoor ceremony, even if you shed it for the reception.",
    fabricAndColor:
      "This is the one season where heavier, textured fabric — wool, tweed, corduroy accents, velvet in small doses — actually works in your favor rather than against you. Jewel tones and warm earth tones both suit the season; this is a good time to wear a color you'd hold back on in summer.",
    contextNotes:
      "Layer with the actual temperature swing in mind, not just the forecast high — a piece you can remove (blazer, wrap, cardigan) serves you better across a full day than a single warm outfit that's wrong for at least half of it.",
    avoid: [
      "Summer-weight fabric that won't hold up once the sun goes down",
      "All-white outfits, which read out of season by fall regardless of the dress code",
      "Showing up with no layer at all to an outdoor ceremony — fall evenings drop faster than they look like they will",
      "Open-toe sandals for an evening reception, even if the afternoon ceremony is mild",
    ],
    promptExample: "What's a good outfit for a fall wedding in October?",
  },
  {
    slug: "winter-wedding",
    occasion: "Winter Wedding",
    category: "Wedding Guest",
    title: "What to Wear to a Winter Wedding",
    heroImagePrompt:
      "A woman in a velvet emerald gown with a wool coat and a man in a heavy wool suit with an overcoat, outside a winter wedding venue, soft snow, warm string lights",
    palette: ["#1f4d3a", "#5c1a2b", "#1a1a1a", "#1c2440"],
    metaDescription:
      "Winter wedding guest attire that handles real cold without sacrificing the outfit — layering, fabric, and what to actually wear over your dress.",
    hook: "Winter weddings are the season most guests get wrong by treating the coat as an afterthought — for an outdoor ceremony or any real walk between venues, what you wear over the outfit matters as much as the outfit itself.",
    forHer:
      "A long-sleeve dress or a sleeveless dress paired with tights and a substantial coat — velvet, wool, or a rich brocade — reads more intentional than draping a thin scarf over a summer dress and hoping for the best. Darker, richer color (emerald, burgundy, black, deep navy) suits the season and photographs well against typical winter venues.",
    forHim:
      "A wool suit in a heavier weight than you'd wear the rest of the year, with a proper wool overcoat rather than a casual jacket layered on top. A knit tie or a wool pocket square adds seasonal texture without straying from formal. Leather gloves and a real scarf, if you're walking between an outdoor ceremony and an indoor reception.",
    fabricAndColor:
      "Wool, velvet, and heavier silk blends hold up to cold in a way summer fabrics simply can't — this isn't just about warmth, thin fabric also drapes and photographs differently in cold, dry air. Jewel tones, black, and deep neutrals all suit winter's low light better than pastels do.",
    contextNotes:
      "If any part of the event is outdoors — even just photos — plan the coat as part of the outfit, not a layer you'll shed at the door. A coat that clashes with or ignores the dress underneath is one of the most common winter-wedding missteps.",
    avoid: [
      "A thin shawl standing in for a real coat at an outdoor winter ceremony",
      "Open-toe shoes, however elegant, for any event with an outdoor component",
      "Pastels or warm-weather color, which tend to read visually flat against winter's low light",
      "Fabric with no structure or weight — it won't hold up to cold, wind, or a long coat check line",
    ],
    promptExample: "I have a winter wedding to attend — what should I wear?",
  },
  {
    slug: "job-interview",
    occasion: "Job Interview",
    category: "Everyday Occasions",
    title: "What to Wear to a Job Interview",
    heroImagePrompt:
      "A woman in a tailored blazer and trousers walking confidently into a modern office lobby, natural daylight, composed and professional",
    palette: ["#1c2440", "#3a3a3f", "#1a1a1a", "#f2f0ec"],
    metaDescription:
      "What to actually wear to a job interview by industry and culture — real guidance, not just \"dress professionally.\"",
    hook: "A job interview isn't really governed by a written dress code, since most companies don't have one — the real skill is reading the room correctly. Overdressing signals you don't know the culture; underdressing suggests you didn't take it seriously.",
    forHer:
      "Tailored trousers with a structured blazer, or a sheath or midi dress with a blazer over it, scales cleanly from conservative to creative industries by how much you dress it down. Finance, law, and corporate roles call for a full, matched suit; startup and creative roles call for one notch above what current employees actually wear, not two.",
    forHim:
      "A full suit and tie for finance, law, and traditional corporate interviews; a dress shirt, chinos, and a blazer (no tie) reads correctly for most tech and startup interviews. Always bring a jacket you can remove rather than showing up without one and hoping the room reads as casual enough.",
    fabricAndColor:
      "Structured fabric holds its shape through a long, stressful day better than anything soft or clingy. Stick to a neutral base — navy, charcoal, black — with at most one considered color accent; busy patterns compete with what you're actually saying.",
    contextNotes:
      "Research the company's actual culture — team photos, office tour videos, Glassdoor reviews — rather than assuming from industry stereotypes alone. When genuinely unsure, one notch more formal than the room is a safer error than one notch more casual.",
    avoid: [
      "Wrinkled or visibly worn clothing — small details read as a proxy for competence here",
      "Strong fragrance in a small interview room",
      "Anything you have to keep adjusting during the interview — that's a sign it doesn't actually fit",
      "Dressing for the job you're leaving rather than the one you're interviewing for",
    ],
    promptExample: "What should I wear to a job interview at a tech startup?",
  },
  {
    slug: "first-date",
    occasion: "First Date",
    category: "Everyday Occasions",
    title: "What to Wear on a First Date",
    heroImagePrompt:
      "A man in a well-fitted casual button-down and dark jeans sitting at a cozy restaurant table set for two, warm evening light",
    palette: ["#d9c7b8", "#33465c", "#232323", "#f0e9de"],
    metaDescription:
      "First date outfit guidance that actually accounts for the venue and the plan — comfortable, considered, not overthought.",
    hook: "The real goal of a first-date outfit is comfort with intention — something that lets you actually be present instead of adjusting a waistband all night, but that still shows you made an effort.",
    forHer:
      "Match the outfit to the actual plan, not a generic \"date look\" — a relaxed dress or well-fitted separates for coffee or a casual dinner, something a little more considered for a nicer restaurant. Wear a piece that's genuinely you rather than what you think a first date is supposed to look like, and pick shoes you can actually walk in if the date includes any walking.",
    forHim:
      "A well-fitted casual button-down or a quality tee with a simple layer, dark jeans or chinos, works for most first dates without trying too hard. Skip a blazer if you're not used to wearing one — the unfamiliarity shows more than the absence would.",
    fabricAndColor:
      "Wear a color you actually feel good in rather than a color you think reads as \"date-appropriate\" — fit matters far more here than any specific palette.",
    contextNotes:
      "If you don't know the venue or the plan, ask rather than guess — dinner, drinks, and an activity date all call for genuinely different outfits, and guessing wrong is more noticeable than asking.",
    avoid: [
      "Anything brand new you haven't tested — save the debut for a lower-stakes day",
      "Over-applying fragrance or cologne",
      "An outfit that needs constant adjustment through the evening",
      "Dressing for a type you think you should have, instead of your own actual style",
    ],
    promptExample: "Help me put together a first date outfit for a casual dinner",
  },
  {
    slug: "summer-festival",
    occasion: "Summer Festival",
    category: "Everyday Occasions",
    title: "What to Wear to a Summer Festival",
    heroImagePrompt:
      "A woman in breathable festival separates and sunglasses at an outdoor summer music festival, golden afternoon light, crowd softly blurred in the background",
    palette: ["#e8dcc8", "#a9c9dc", "#e8c96a", "#e8927a"],
    metaDescription:
      "Festival outfit guidance built for standing all day in real weather — not just the outfit you'll photograph in the first hour.",
    hook: "Festival outfits get planned for photos and regretted by hour six — the real brief is something you can stand, dance, and sweat in for eight-plus hours that still looks considered.",
    forHer:
      "Breathable separates beat one heavy piece — shorts or a flowy skirt with a top you can tie up as the day heats, plus a light layer for the temperature drop after dark. Wear shoes you've actually broken in; this is not the day to debut new ones.",
    forHim:
      "Lightweight or technical fabrics, shorts or lightweight trousers, and a breathable button-down or tee hold up far better than anything heavy. A hat and sunglasses are functional gear here, not just styling.",
    fabricAndColor:
      "Moisture-wicking or natural breathable fabric over anything synthetic that traps heat. Lighter colors reflect heat better for a full day in direct sun.",
    contextNotes:
      "Check whether the festival is single-day or multi-day, since that changes what's worth packing, and check the actual ground conditions (grass, mud, pavement) before picking footwear rather than after.",
    avoid: [
      "Brand-new shoes",
      "All-black in full sun for a full day outdoors",
      "Anything you're precious about — festivals are genuinely hard on clothes",
      "No sun protection plan (hat, sunscreen) — not an outfit note exactly, but it wrecks the day if skipped",
    ],
    promptExample: "What should I wear to an outdoor music festival this summer?",
  },
];

export function getGuideBySlug(slug) {
  return guides.find((g) => g.slug === slug);
}
