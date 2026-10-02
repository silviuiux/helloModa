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
    <div className="group relative aspect-[3/4] overflow-hidden rounded-[18px] shadow-[0_30px_60px_-36px_rgba(90,70,160,0.45),0_0_0_1px_rgba(43,38,51,0.04)]">
      <button onClick={() => onEdit(profile)} className="absolute inset-0 h-full w-full text-left">
        {profile.avatar_image_signed_url ? (
          <img
            src={profile.avatar_image_signed_url}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-[#f3eff8] px-4 text-center">
            <p className="font-hand text-[20px] text-[#8f78e8]">No avatar painted yet</p>
            <p className="text-[11.5px] text-[#2b2633]/50">Tap to add a photo</p>
          </div>
        )}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(to top, rgba(30,26,46,0.72), transparent)" }}
        />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <p className="label text-white/75">{profile.is_self ? "You" : profile.relationship || "Family"}</p>
          <h3 className="mt-0.5 font-script text-[24px] leading-none text-white">{profile.display_name}</h3>
          {summary && <p className="mt-1.5 text-[11px] text-white/80">{summary}</p>}
        </div>
      </button>
      <button
        onClick={() => onDelete(profile)}
        aria-label={`Remove ${profile.display_name}`}
        className="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-[#2b2633]/60 opacity-0 backdrop-blur-md transition-all hover:text-[#c2577a] group-hover:opacity-100"
      >
        <X size={14} />
      </button>
    </div>
  );
}
