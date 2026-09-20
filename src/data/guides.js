// SEO landing pages ("What to wear to a [X] wedding") — docs/03-roadmap.md
// Phase 1 GTM wedge. Public, indexed content (cleared 2026-09-20, see
// docs/06-risks-legal.md) — static and hand-curated rather than generated
// per-request, so it stays stable for search engines and genuinely useful
// rather than templated filler. Add a guide by adding an object here; the
// route (src/app/what-to-wear/[slug]/page.jsx) picks it up automatically.
export const guides = [
  {
    slug: "beach-wedding",
    occasion: "Beach Wedding",
    title: "What to Wear to a Beach Wedding",
    metaDescription:
      "A real guide to beach wedding guest attire — what actually works on sand, in wind, and in humidity, for her and for him.",
    hook: "Beach weddings look effortless in photos and are the easiest occasion to get wrong in person — heels sink, structured fabric wilts, and \"resort wear\" can tip into too casual. Here's what actually holds up.",
    forHer:
      "Lean into flowing, unstructured silhouettes — a midi or maxi dress in a soft, breathable fabric (linen-blend, crepe, or a lightweight viscose) moves well in sea air and doesn't cling in humidity. Florals and soft solids both work; avoid anything stark white, which reads as competing with the dress. Skip heels entirely — a wedge or a flat sandal is not a compromise here, it's the right call.",
    forHim:
      "Linen or a linen-cotton blend shirt, short or long sleeve depending on the time of day, worn untucked or loosely tucked. Chinos or lightweight tailored trousers in a pale neutral — navy, tan, or sage — read intentional without a jacket. If the invite says \"jacket encouraged,\" bring one but expect to take it off; pick something unstructured that won't look wrinkled after an hour on a chair.",
    fabricAndColor:
      "Natural fibers only if you can help it — linen, cotton, lightweight viscose. Synthetic blends trap heat and show sweat differently than natural fabric does, which matters more here than at an indoor venue. Color-wise, think sun-bleached: sand, seafoam, dusty blue, warm white (not stark white), soft coral.",
    weatherNotes:
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
    title: "What to Wear to a Black-Tie Wedding",
    metaDescription:
      "What \"black tie\" actually requires for a wedding guest — the real dress code rules, and where a little personal style is still allowed.",
    hook: "\"Black tie\" is the one dress code on a wedding invitation that isn't a suggestion — it's a specific, well-defined standard, and showing up underdressed is more noticeable here than anywhere else on this list.",
    forHer:
      "A full-length evening gown is the safest, most correct choice — cocktail-length is generally acceptable for black tie (though not for black tie optional's stricter cousin), but full-length reads as more considered. Rich, formal fabrics — silk, satin, velvet in cooler months — over anything casual like jersey or cotton. This is the one occasion where more embellishment (a structured bodice, a statement sleeve) is appropriate rather than excessive.",
    forHim:
      "A tuxedo, properly: black dinner jacket, matching trousers, a white dress shirt, and a black bow tie — not a long tie, not a skinny suit substituted in. If you don't own one, this is worth renting correctly rather than approximating with a dark suit; guests notice the difference more than you'd expect. Patent leather or highly polished black dress shoes, black socks.",
    fabricAndColor:
      "Black, midnight navy, or deep jewel tones (emerald, burgundy, sapphire) for her gown. For him, black is the standard — a midnight blue dinner jacket is a well-established, elegant substitute, but nothing lighter or more casual than that.",
    weatherNotes:
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
    title: "What to Wear to a Garden Wedding",
    metaDescription:
      "Garden wedding guest attire that handles grass, sun, and a semi-formal dress code — real outfit guidance, not just a mood board.",
    hook: "A garden wedding sits right in the middle of the formality scale — dressier than beach, softer than black tie — and the real challenge is practical: grass, uneven ground, and often full sun for at least part of the day.",
    forHer:
      "A midi dress in a soft floral, a solid pastel, or a light botanical print suits the setting without competing with it. A wedge, block heel, or a sturdy flat sandal handles grass far better than a stiletto — this is worth prioritizing over the shoe you'd pick for the dress alone. A light cardigan or shawl is worth bringing even in summer; gardens cool down fast once the sun drops.",
    forHim:
      "A suit in a lighter fabric and color than you'd wear indoors — tan, light grey, soft blue — reads appropriately dressed without looking overheated. A dress shirt with the jacket is usually enough; save the tie for anything explicitly formal. Loafers or leather derbies over anything with a slick sole, which struggles on grass and gravel paths.",
    fabricAndColor:
      "Lighter-weight wool, linen blends, and cotton poplin all read well here. Color palette leans soft and organic — sage, dusty rose, cream, soft lavender — rather than the deep jewel tones you'd wear to an evening event.",
    weatherNotes:
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
    title: "What to Wear to a Vineyard Wedding",
    metaDescription:
      "Vineyard wedding guest outfits that match the setting's relaxed elegance — golden-hour-ready, and built for uneven ground and shifting temperatures.",
    hook: "Vineyard weddings have a specific visual identity — golden light, rolling rows, rustic-elegant styling — and the best guest outfits lean into that rather than fighting it with anything too sharp or too casual.",
    forHer:
      "A flowing midi or maxi dress in warm, earthy tones — terracotta, olive, cream, dusty gold — photographs beautifully in the golden-hour light most vineyard weddings are timed around. Choose a low block heel or a wedge over anything with a thin heel; vineyard paths are gravel or uneven soil more often than pavement.",
    forHim:
      "Linen or lightweight cotton trousers with a relaxed button-down, sleeves rolled, works for a daytime ceremony; add a soft blazer as the evening cools, which it reliably does even after a hot afternoon. Suede or leather loafers suit the setting better than anything too polished or formal.",
    fabricAndColor:
      "Natural, textured fabrics — linen, raw silk, soft cotton — echo the setting's own materials (wood, stone, vines) better than anything glossy or synthetic. Warm neutrals and muted earth tones read as considered here; very bright or very cool-toned color can feel out of place against the landscape.",
    weatherNotes:
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
    title: "What to Wear to a Fall Wedding",
    metaDescription:
      "Fall wedding guest attire that actually matches the season — rich color, real layering, and what to do when the weather can't decide.",
    hook: "Fall weddings give you the most room to have fun with color and texture of any season — but the real challenge is a temperature swing that can run 20 degrees between an afternoon ceremony and an evening reception.",
    forHer:
      "A midi dress in a rich, seasonal color — burgundy, forest green, burnt orange, deep plum — makes the most of the season rather than defaulting to safe neutrals. A tailored coat or a structured wrap that can come on and off through the day is more useful than a delicate shawl, which won't hold up once it's genuinely cold.",
    forHim:
      "A suit in a warmer, richer tone — deep navy, hunter green, chocolate brown — than you'd wear in summer, paired with a subtly textured tie (wool, knit) rather than a slick silk one. A well-fitted overcoat is worth having on hand for an outdoor ceremony, even if you shed it for the reception.",
    fabricAndColor:
      "This is the one season where heavier, textured fabric — wool, tweed, corduroy accents, velvet in small doses — actually works in your favor rather than against you. Jewel tones and warm earth tones both suit the season; this is a good time to wear a color you'd hold back on in summer.",
    weatherNotes:
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
    title: "What to Wear to a Winter Wedding",
    metaDescription:
      "Winter wedding guest attire that handles real cold without sacrificing the outfit — layering, fabric, and what to actually wear over your dress.",
    hook: "Winter weddings are the season most guests get wrong by treating the coat as an afterthought — for an outdoor ceremony or any real walk between venues, what you wear over the outfit matters as much as the outfit itself.",
    forHer:
      "A long-sleeve dress or a sleeveless dress paired with tights and a substantial coat — velvet, wool, or a rich brocade — reads more intentional than draping a thin scarf over a summer dress and hoping for the best. Darker, richer color (emerald, burgundy, black, deep navy) suits the season and photographs well against typical winter venues.",
    forHim:
      "A wool suit in a heavier weight than you'd wear the rest of the year, with a proper wool overcoat rather than a casual jacket layered on top. A knit tie or a wool pocket square adds seasonal texture without straying from formal. Leather gloves and a real scarf, if you're walking between an outdoor ceremony and an indoor reception.",
    fabricAndColor:
      "Wool, velvet, and heavier silk blends hold up to cold in a way summer fabrics simply can't — this isn't just about warmth, thin fabric also drapes and photographs differently in cold, dry air. Jewel tones, black, and deep neutrals all suit winter's low light better than pastels do.",
    weatherNotes:
      "If any part of the event is outdoors — even just photos — plan the coat as part of the outfit, not a layer you'll shed at the door. A coat that clashes with or ignores the dress underneath is one of the most common winter-wedding missteps.",
    avoid: [
      "A thin shawl standing in for a real coat at an outdoor winter ceremony",
      "Open-toe shoes, however elegant, for any event with an outdoor component",
      "Pastels or warm-weather color, which tend to read visually flat against winter's low light",
      "Fabric with no structure or weight — it won't hold up to cold, wind, or a long coat check line",
    ],
    promptExample: "I have a winter wedding to attend — what should I wear?",
  },
];

export function getGuideBySlug(slug) {
  return guides.find((g) => g.slug === slug);
}
