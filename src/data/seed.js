// Static reference data still used by the real (DB-backed) UI.
// Chat content, look context, and the old product catalog were removed here
// once real chat (src/app/api/chat/route.js) and the decluttered conversation
// design (docs/09-conversation-design.md) replaced them.

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
