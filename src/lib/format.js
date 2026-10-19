// Split a price into whole + cents for the superscript-cents display
// (e.g. 159.99 -> { whole: "159", cents: "99" }). Romanian lei convention.
export function priceParts(value) {
  if (value == null) return null;
  const fixed = Number(value).toFixed(2);
  const [whole, cents] = fixed.split(".");
  return { whole, cents };
}

// Catalog rows carry their own currency (Italist is USD). An unknown or
// empty code falls back to EUR rather than throwing from Intl.
export function formatPrice(amount, currency = "EUR") {
  const code = typeof currency === "string" && /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : "EUR";
  try {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat("en-IE", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    }).format(amount);
  }
}
