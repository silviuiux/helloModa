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
    <div
      className="min-h-screen w-full"
    >
      <AvatarsView profiles={profiles} selfDefaults={selfProfile} maxAvatars={maxAvatars} />
    </div>
  );
}
