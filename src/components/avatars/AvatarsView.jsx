"use client";

import { useState } from "react";
import { Plus } from "../Icons.jsx";
import { deleteAvatarProfile } from "../../actions/avatars.js";
import AvatarCard from "./AvatarCard.jsx";
import AvatarProfileModal from "./AvatarProfileModal.jsx";

function AddTile({ label, sublabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group grid aspect-[3/4] place-items-center rounded-[18px] border border-dashed border-[#8f78e8]/35 bg-white/50 text-[#2b2633]/60 transition-colors hover:border-[#8f78e8] hover:bg-white/80"
    >
      <span className="text-center">
        <span className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white text-[#2b2633]/70 shadow-[0_10px_30px_-12px_rgba(90,70,160,0.35)] transition-transform group-hover:scale-105">
          <Plus size={22} />
        </span>
        <span className="mt-3 block font-hand text-[22px] text-[#8f78e8]">{label}</span>
        {sublabel && <span className="mt-0.5 block text-[11.5px] text-[#2b2633]/40">{sublabel}</span>}
      </span>
    </button>
  );
}

export default function AvatarsView({ profiles, selfDefaults, maxAvatars }) {
  const [list, setList] = useState(profiles);
  const [editing, setEditing] = useState(null); // { profile, isSelf } | null

  const selfProfile = list.find((p) => p.is_self) || null;
  const familyProfiles = list.filter((p) => !p.is_self);
  const maxFamily = Math.max(0, maxAvatars - 1);

  function handleSaved(row) {
    setList((prev) => {
      const exists = prev.some((p) => p.id === row.id);
      return exists ? prev.map((p) => (p.id === row.id ? { ...p, ...row } : p)) : [...prev, row];
    });
  }

  async function handleDeleted(row) {
    setList((prev) => prev.filter((p) => p.id !== row.id));
    try {
      await deleteAvatarProfile(row.id);
    } catch (err) {
      console.error("Failed to delete avatar profile:", err);
      setList((prev) => [...prev, row]);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1100px] px-6 pb-32 pt-28 sm:px-10 sm:pt-36">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">Avatars</p>
      <h1 className="mt-4 font-script text-[46px] leading-[1.02] text-[#2b2633] sm:text-[60px]">
        Styled on <span className="font-hand text-[#8f78e8]">you.</span>
      </h1>
      <p className="mb-12 mt-5 max-w-lg text-[15px] leading-[1.7] text-[#2b2633]/60">
        Watercolor avatars helloModa styles outfits on in chat — yourself
        {maxFamily > 0 ? `, plus up to ${maxFamily} family members` : ""}, each with their own
        measurements. A reference photo is used once to paint the avatar, then discarded — only
        the finished painting is kept.
      </p>

      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7 lg:grid-cols-4">
        {selfProfile ? (
          <AvatarCard profile={selfProfile} onEdit={(p) => setEditing({ profile: p, isSelf: true })} onDelete={handleDeleted} />
        ) : (
          <AddTile label="Set up your avatar" sublabel="You" onClick={() => setEditing({ profile: null, isSelf: true })} />
        )}

        {familyProfiles.map((p) => (
          <AvatarCard key={p.id} profile={p} onEdit={(prof) => setEditing({ profile: prof, isSelf: false })} onDelete={handleDeleted} />
        ))}

        {familyProfiles.length < maxFamily && (
          <AddTile
            label="Add family member"
            sublabel={`${maxFamily - familyProfiles.length} of ${maxFamily} left`}
            onClick={() => setEditing({ profile: null, isSelf: false })}
          />
        )}

        {selfProfile && maxFamily === 0 && (
          <div className="grid aspect-[3/4] place-items-center rounded-[18px] border border-[#2b2633]/10 bg-white/50 p-6 text-center">
            <div>
              <p className="font-script text-[22px] leading-tight text-[#2b2633]">Style the whole family with Pro</p>
              <p className="mt-2 text-[12px] leading-relaxed text-[#2b2633]/50">
                Add up to 3 more people — partner, kids, parents — each with their own avatar, sizes and measurements.
              </p>
            </div>
          </div>
        )}
      </div>

      {editing && (
        <AvatarProfileModal
          open
          profile={editing.profile}
          isSelf={editing.isSelf}
          selfDefaults={selfDefaults}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
