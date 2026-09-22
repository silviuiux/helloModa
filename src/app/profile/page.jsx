import { createClient } from "@/lib/supabase/server";
import { signAvatarUrl } from "@/lib/profileImages";
import { getUsageSummary } from "@/lib/usage";
import ProfileForm from "@/components/profile/ProfileForm.jsx";
import UsageSummary from "@/components/profile/UsageSummary.jsx";

// Auth is already enforced by middleware (src/middleware.js).
export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();
  if (error) {
    console.error("Failed to load profile:", error.message);
  }

  const avatarUrl = profile?.avatar_url ? await signAvatarUrl(supabase, profile.avatar_url) : null;
  const usage = await getUsageSummary(supabase, user.id).catch((err) => {
    console.error("Failed to load usage summary:", err.message);
    return null;
  });

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: "radial-gradient(125% 100% at 16% 4%, #f6f5f9 0%, #eeecf3 50%, #e8e5ef 100%)",
      }}
    >
      <ProfileForm profile={profile} avatarUrl={avatarUrl} userEmail={user.email} usage={usage} />
    </div>
  );
}
