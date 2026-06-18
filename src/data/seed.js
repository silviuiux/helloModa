// Mock data for the helloModa shell. Swap for real API/state later.

export const styleMemory = {
  traits: ["Minimal tailoring", "Soft neutrals", "Wide-leg silhouettes"],
  intent: "Dinner outfit with one hero piece and weather-aware layering.",
};

export const lookContext = {
  occasion: "Gallery dinner",
  weather: "62°F · light rain",
  budget: "Mix closet + one buy",
  silhouette: "Relaxed column",
  palette: "Ivory / black",
  risk: "Medium drama",
};

// role: "user" | "ai"
export const seedMessages = [
  {
    id: "m1",
    role: "user",
    text: "I need something elegant but not formal. I want to wear my black wide-leg trousers and maybe add one fresh piece.",
  },
  {
    id: "m2",
    role: "ai",
    title: "The relaxed gallery column",
    hero: ["#e4e2f0", "#d7d4e9"],
    text: "Start with the trousers as the anchor. I'd soften them with an ivory sheer knit, sculptural flats, and a cropped rain shell so the look stays gallery-ready without feeling corporate.",
    cards: [
      { id: "c1", name: "Ivory sheer knit", role: "Top layer", source: "shop", icon: "shirt", price: "$118" },
      { id: "c2", name: "Satin micro bag", role: "Accent", source: "closet", icon: "bag", price: "In closet" },
      { id: "c3", name: "Cropped rain shell", role: "Weather", source: "shop", icon: "hanger", price: "$96" },
    ],
    followup:
      "Before I finalize, should I prioritize comfort, drama, or weather protection?",
  },
];

export const composerPrompts = [
  "Make it more dramatic",
  "Keep it under $120",
  "Show closet-only options",
];

// Wardrobe seed — color is a swatch used in lieu of real imagery.
export const wardrobeItems = [
  { id: "w1", name: "Black wide-leg trousers", category: "Bottoms", tags: ["Hero", "Tailoring"], color: "#1c1a17", brand: "Toteme", icon: "hanger", fav: true },
  { id: "w2", name: "Ivory sheer knit", category: "Tops", tags: ["Layer"], color: "#efe7d8", brand: "COS", icon: "shirt", fav: true },
  { id: "w3", name: "Camel wool coat", category: "Outerwear", tags: ["Winter"], color: "#b9966a", brand: "Max Mara", icon: "hanger", fav: false },
  { id: "w4", name: "Satin micro bag", category: "Bags", tags: ["Evening"], color: "#2a2622", brand: "By Far", icon: "bag", fav: true },
  { id: "w5", name: "Sculptural flats", category: "Shoes", tags: ["Comfort"], color: "#cdbfab", brand: "The Row", icon: "shoe", fav: false },
  { id: "w6", name: "Cropped rain shell", category: "Outerwear", tags: ["Weather"], color: "#3c4a47", brand: "Rains", icon: "hanger", fav: false },
  { id: "w7", name: "Pleated midi skirt", category: "Bottoms", tags: ["Soft"], color: "#8d8175", brand: "Arket", icon: "hanger", fav: false },
  { id: "w8", name: "White cotton shirt", category: "Tops", tags: ["Staple"], color: "#f6f1e8", brand: "Uniqlo", icon: "shirt", fav: false },
  { id: "w9", name: "Gold hoop earrings", category: "Accessories", tags: ["Accent"], color: "#c8a44e", brand: "Mejuri", icon: "sparkle", fav: true },
  { id: "w10", name: "Leather ankle boots", category: "Shoes", tags: ["Autumn"], color: "#4a3528", brand: "Vagabond", icon: "shoe", fav: false },
  { id: "w11", name: "Charcoal blazer", category: "Outerwear", tags: ["Tailoring"], color: "#39363a", brand: "Theory", icon: "shirt", fav: false },
  { id: "w12", name: "Silk slip dress", category: "Dresses", tags: ["Evening", "Hero"], color: "#7a5f63", brand: "Reformation", icon: "dress", fav: true },
];

export const wardrobeCategories = [
  "All",
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Bags",
  "Accessories",
];
