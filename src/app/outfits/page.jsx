import { listOutfitHistory } from "@/actions/conversations";
import OutfitHistoryList from "@/components/outfits/OutfitHistoryList.jsx";

// Auth is already enforced by middleware (src/middleware.js).
export default async function OutfitsPage() {
  const rows = await listOutfitHistory();

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <OutfitHistoryList rows={rows} />
    </div>
  );
}
