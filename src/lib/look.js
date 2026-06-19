import { catalog } from "../data/seed.js";

// Pick a different product of the same type when the user taps "swap".
export function pickAlternative(card) {
  const pool = catalog[card.type] || [];
  const options = pool.filter((p) => p.name !== card.name);
  if (!options.length) return card;
  const next = options[Math.floor(Math.random() * options.length)];
  return { ...card, ...next }; // keep the slot id, swap product details
}

// Map a stylist card to a wardrobe item shape (used by the heart / save action).
const TYPE_CATEGORY = {
  top: "Tops",
  bottoms: "Bottoms",
  dress: "Dresses",
  outerwear: "Outerwear",
  shoe: "Shoes",
  bag: "Bags",
  accessory: "Accessories",
};
const TYPE_ICON = {
  top: "shirt",
  bottoms: "hanger",
  dress: "dress",
  outerwear: "hanger",
  shoe: "shoe",
  bag: "bag",
  accessory: "sparkle",
};
const TYPE_COLOR = {
  top: "#e7e3d6",
  bottoms: "#39363a",
  dress: "#7a5f63",
  outerwear: "#3c4a47",
  shoe: "#cdbfab",
  bag: "#2a2622",
  accessory: "#c8a44e",
};

export function cardToWardrobeItem(card) {
  return {
    id: `saved-${card.id}`,
    name: card.name,
    brand: card.brand,
    category: TYPE_CATEGORY[card.type] || "Tops",
    icon: TYPE_ICON[card.type] || "shirt",
    color: TYPE_COLOR[card.type] || "#e4e2f0",
    tags: ["Saved"],
    fav: true,
  };
}
