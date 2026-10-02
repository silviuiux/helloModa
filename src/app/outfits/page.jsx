import { listJournalLooks } from "@/actions/conversations";
import JournalTimeline from "@/components/outfits/JournalTimeline.jsx";
import { appHomeFor } from "@/lib/designRoutes";

// Auth is already enforced by middleware (src/middleware.js).
// The style journal as a timeline (2026-10-02): every look worth
// remembering, bookable for a day and marked worn once that day passes.
// `?from=design-0X` (set by the comparison layouts) sends "back" and each
// look's link to that route instead of "/"; anything else falls back to "/".
export default async function OutfitsPage({ searchParams }) {
  const { from } = (await searchParams) || {};
  const home = appHomeFor(typeof from === "string" ? from : null);
  const looks = await listJournalLooks();
  return <JournalTimeline looks={looks} home={home} />;
}
