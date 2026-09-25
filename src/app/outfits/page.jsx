import { listOutfitHistory } from "@/actions/conversations";
import OutfitHistoryList from "@/components/outfits/OutfitHistoryList.jsx";
import { appHomeFor } from "@/lib/designRoutes";

// Auth is already enforced by middleware (src/middleware.js).
// `?from=design-0X` (set by the comparison layouts) sends "back" and each
// look's link to that route instead of "/"; anything else falls back to "/".
export default async function OutfitsPage({ searchParams }) {
  const { from } = (await searchParams) || {};
  const home = appHomeFor(typeof from === "string" ? from : null);
  const rows = await listOutfitHistory();

  return (
    <div
      className="min-h-screen w-full"
    >
      <OutfitHistoryList rows={rows} home={home} />
    </div>
  );
}
