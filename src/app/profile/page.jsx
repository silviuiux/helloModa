import Link from "next/link";
import PaperPage from "@/components/tete/PaperPage.jsx";
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
      <ProfileForm profile={profile} avatarUrl={avatarUrl} userEmail={user.email} usage={usage} />
    </PaperPage>
  );
}
