import { listOutfitHistory } from "@/actions/conversations";
import OutfitHistoryList from "@/components/outfits/OutfitHistoryList.jsx";

// Auth is already enforced by middleware (src/middleware.js).
export default async function OutfitsPage() {
  const rows = await listOutfitHistory();

  return (
    <div
      className="min-h-screen w-full"
    >
      <OutfitHistoryList rows={rows} />
    </div>
  );
}
