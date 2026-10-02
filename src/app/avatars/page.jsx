import Link from "next/link";
import PaperPage from "@/components/tete/PaperPage.jsx";
import { createClient } from "@/lib/supabase/server";
import { listAvatarProfiles } from "@/actions/avatars";
import { signAvatarProfiles } from "@/lib/avatarImages";
import { getUserPlan } from "@/lib/usage";
import { limitsFor } from "@/lib/plans";
import AvatarsView from "@/components/avatars/AvatarsView.jsx";

// Auth is already enforced by middleware (src/middleware.js).
export default async function AvatarsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows = await listAvatarProfiles().catch((err) => {
    console.error("Failed to load avatar profiles:", err.message);
    return [];
  });
  const profiles = await signAvatarProfiles(supabase, rows);
  const plan = await getUserPlan(supabase, user.id);
  const maxAvatars = limitsFor(plan).maxAvatars;

  // Prefills "Set up your avatar" with measurements the user already gave
  // on /profile, rather than asking them to re-enter the same numbers.
  const { data: selfProfile } = await supabase
    .from("profiles")
    .select("gender, height_cm, weight_kg, bust_cm, waist_cm, hip_cm, size_top, size_bottom, size_shoe")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <PaperPage
      right={
        <Link
          href="/"
          className="rounded-full bg-white/70 px-4 py-2 text-[13px] text-[#2b2633] ring-1 ring-[#2b2633]/10 backdrop-blur-md transition-colors hover:ring-[#8f78e8]/50"
        >
          Back to styling
        </Link>
      }
    >
      <AvatarsView profiles={profiles} selfDefaults={selfProfile} maxAvatars={maxAvatars} />
    </PaperPage>
  );
}
