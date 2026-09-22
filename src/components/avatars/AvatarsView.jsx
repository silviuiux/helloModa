"use client";

import { useState } from "react";
import Link from "next/link";
import { Home, Plus } from "../Icons.jsx";
import { deleteAvatarProfile } from "../../actions/avatars.js";
import AvatarCard from "./AvatarCard.jsx";
import AvatarProfileModal from "./AvatarProfileModal.jsx";

const MAX_FAMILY = 3;

function AddTile({ label, sublabel, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group grid aspect-[3/4] place-items-center rounded-bubble border border-dashed border-accent-soft bg-white/30 text-muted backdrop-blur-md transition-colors hover:border-accent hover:bg-white/50 hover:text-accent-deep"
    >
      <span className="text-center">
        <span className="glass-circle mx-auto grid h-12 w-12 place-items-center rounded-full transition-transform group-hover:scale-105">
          <Plus size={22} />
        </span>
        <span className="mt-2.5 block text-[13px] font-medium">{label}</span>
        {sublabel && <span className="mt-0.5 block text-[11.5px] text-faint">{sublabel}</span>}
      </span>
    </button>
  );
}

export default function AvatarsView({ profiles, selfDefaults }) {
  const [list, setList] = useState(profiles);
  const [editing, setEditing] = useState(null); // { profile, isSelf } | null

  const selfProfile = list.find((p) => p.is_self) || null;
  const familyProfiles = list.filter((p) => !p.is_self);

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
    <div className="mx-auto w-full max-w-content px-4 pb-24 pt-10 sm:px-6 sm:pt-14">
      <div className="mb-4 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to helloModa"
          className="glass-circle grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink"
        >
          <Home size={17} />
        </Link>
        <h1 className="font-script text-[40px] leading-none text-ink sm:text-[52px]">hello—Avatar</h1>
      </div>
      <p className="mb-10 max-w-lg text-[14px] text-muted">
        Watercolor avatars helloModa styles outfits on in chat — yourself, plus up to {MAX_FAMILY} family
        members, each with their own measurements. A reference photo is used once to paint the avatar,
        then discarded — only the finished painting is kept.
      </p>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {selfProfile ? (
          <AvatarCard profile={selfProfile} onEdit={(p) => setEditing({ profile: p, isSelf: true })} onDelete={handleDeleted} />
        ) : (
          <AddTile label="Set up your avatar" sublabel="You" onClick={() => setEditing({ profile: null, isSelf: true })} />
        )}

        {familyProfiles.map((p) => (
          <AvatarCard key={p.id} profile={p} onEdit={(prof) => setEditing({ profile: prof, isSelf: false })} onDelete={handleDeleted} />
        ))}

        {familyProfiles.length < MAX_FAMILY && (
          <AddTile
            label="Add family member"
            sublabel={`${MAX_FAMILY - familyProfiles.length} of ${MAX_FAMILY} left`}
            onClick={() => setEditing({ profile: null, isSelf: false })}
          />
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
