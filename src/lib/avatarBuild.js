// Shared between the avatar modal (client, for the selector + live BMI
// suggestion) and the generation route (server, for the prompt text) so
// the two can't drift. Direct request 2026-09-22: avatars shouldn't all
// default to a slim/athletic figure — a BMI-based suggestion is offered,
// but "athletic" is deliberately never auto-suggested (build/weight alone
// don't imply muscle tone) and every suggestion stays a one-tap override,
// never forced.
export const BUILD_OPTIONS = [
  { key: "slim", label: "Slim" },
  { key: "average", label: "Average" },
  { key: "athletic", label: "Athletic" },
  { key: "fuller", label: "Fuller" },
  { key: "heavyset", label: "Heavyset" },
];

const BUILD_PROMPT = {
  slim: "slim, slender build",
  average: "average, proportionate build",
  athletic: "athletic build with visible muscle tone",
  fuller: "fuller-figured build — visibly carrying extra weight through the midsection and limbs, not slim",
  heavyset: "heavyset, plus-size build — clearly overweight with a rounded midsection, realistically proportioned, not slimmed down",
};

// BMI-only suggestion — a starting point, always overridable in the UI.
// Never returns "athletic": that's a muscle-tone judgment BMI can't make.
export function suggestBuildFromBMI(heightCm, weightKg) {
  const h = Number(heightCm);
  const w = Number(weightKg);
  if (!h || !w) return null;
  const bmi = w / (h / 100) ** 2;
  if (bmi < 18.5) return "slim";
  if (bmi < 25) return "average";
  if (bmi < 30) return "fuller";
  return "heavyset";
}

export function buildPromptPhrase(buildKey) {
  return BUILD_PROMPT[buildKey] || null;
}
