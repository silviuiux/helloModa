// The design-comparison routes (src/app/design-0X). Kept in one list so
// anything that links "back into the app" (/outfits) can validate a
// `?from=` value instead of trusting it as a path.
export const DESIGN_ROUTES = [
  { slug: "design-01", layout: "studio", name: "Studio" },
  { slug: "design-02", layout: "fitting", name: "Fitting Room" },
  { slug: "design-03", layout: "feed", name: "Feed" },
];

export function appHomeFor(from) {
  return DESIGN_ROUTES.some((d) => d.slug === from) ? `/${from}` : "/";
}
