// Split a price into whole + cents for the superscript-cents display
// (e.g. 159.99 -> { whole: "159", cents: "99" }). Romanian lei convention.
export function priceParts(value) {
  if (value == null) return null;
  const fixed = Number(value).toFixed(2);
  const [whole, cents] = fixed.split(".");
  return { whole, cents };
}
