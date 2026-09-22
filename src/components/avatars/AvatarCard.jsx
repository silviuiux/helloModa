import { X } from "../Icons.jsx";

function measurementSummary(profile) {
  const parts = [];
  if (profile.height_cm) parts.push(`${profile.height_cm}cm`);
  if (profile.size_top) parts.push(`top ${profile.size_top}`);
  if (profile.size_bottom) parts.push(`bottom ${profile.size_bottom}`);
  return parts.join(" · ");
}

export default function AvatarCard({ profile, onEdit, onDelete }) {
  const summary = measurementSummary(profile);

  return (
    <div className="group relative aspect-[3/4] overflow-hidden rounded-bubble shadow-soft">
      <button onClick={() => onEdit(profile)} className="absolute inset-0 h-full w-full text-left">
        {profile.avatar_image_signed_url ? (
          <img
            src={profile.avatar_image_signed_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="glass flex h-full w-full flex-col items-center justify-center gap-2 px-4 text-center">
            <p className="text-[13px] font-medium text-accent-deep">No avatar painted yet</p>
            <p className="text-[11.5px] text-muted">Tap to add a photo</p>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(to top, rgba(20,16,24,0.72), transparent)" }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="label text-white/70">{profile.is_self ? "You" : profile.relationship || "Family"}</p>
          <h3 className="mt-0.5 font-script text-[24px] leading-none text-white">{profile.display_name}</h3>
          {summary && <p className="mt-1.5 text-[11px] text-white/75">{summary}</p>}
        </div>
      </button>
      <button
        onClick={() => onDelete(profile)}
        aria-label={`Remove ${profile.display_name}`}
        className="glass-circle absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full text-ink opacity-0 transition-all group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
