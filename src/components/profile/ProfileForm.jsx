"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { Home, Plus, X, Check } from "../Icons.jsx";
import { resizeImageFile } from "../../lib/imageResize.js";
import { createClient } from "../../lib/supabase/client.js";
import { updateProfile } from "../../actions/profile.js";
import { track } from "../../lib/analytics.js";
import UsageSummary from "./UsageSummary.jsx";

const GENDER_OPTIONS = ["Woman", "Man", "Non-binary", "Prefer not to say"];
const STYLE_SUGGESTIONS = [
  "Minimal tailoring",
  "Soft neutrals",
  "Romantic",
  "Edgy",
  "Preppy",
  "Bohemian",
  "Classic",
  "Streetwear",
  "Glam",
  "Bold color",
];

export default function ProfileForm({ profile, avatarUrl, userEmail, usage }) {
  const [displayName, setDisplayName] = useState(profile?.display_name || "");
  const [gender, setGender] = useState(profile?.gender || "");
  const [heightCm, setHeightCm] = useState(profile?.height_cm ?? "");
  const [weightKg, setWeightKg] = useState(profile?.weight_kg ?? "");
  const [bustCm, setBustCm] = useState(profile?.bust_cm ?? "");
  const [waistCm, setWaistCm] = useState(profile?.waist_cm ?? "");
  const [hipCm, setHipCm] = useState(profile?.hip_cm ?? "");
  const [sizeTop, setSizeTop] = useState(profile?.size_top || "");
  const [sizeBottom, setSizeBottom] = useState(profile?.size_bottom || "");
  const [sizeShoe, setSizeShoe] = useState(profile?.size_shoe || "");
  const [styleTraits, setStyleTraits] = useState(profile?.style_traits || []);
  const [favoriteBrands, setFavoriteBrands] = useState(profile?.favorite_brands || []);
  const [avoidBrands, setAvoidBrands] = useState(profile?.avoid_brands || []);

  const [avatarBlob, setAvatarBlob] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const fileInputRef = useRef(null);

  const [status, setStatus] = useState("idle"); // idle | saving | saved | error
  const [error, setError] = useState("");

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file, 512, 0.85);
    if (avatarPreview?.startsWith("blob:")) URL.revokeObjectURL(avatarPreview);
    setAvatarBlob(resized);
    setAvatarPreview(URL.createObjectURL(resized));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("saving");
    setError("");

    let avatarPath;
    if (avatarBlob) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(path, avatarBlob, { contentType: "image/jpeg" });
        if (uploadError) {
          console.error("Failed to upload avatar:", uploadError.message);
        } else {
          avatarPath = path;
        }
      }
    }

    try {
      await updateProfile({
        displayName,
        gender,
        avatarPath,
        heightCm: heightCm === "" ? null : Number(heightCm),
        weightKg: weightKg === "" ? null : Number(weightKg),
        bustCm: bustCm === "" ? null : Number(bustCm),
        waistCm: waistCm === "" ? null : Number(waistCm),
        hipCm: hipCm === "" ? null : Number(hipCm),
        sizeTop,
        sizeBottom,
        sizeShoe,
        styleTraits,
        favoriteBrands,
        avoidBrands,
      });
      track("profile_saved", {
        has_avatar: Boolean(avatarPreview),
        style_trait_count: styleTraits.length,
      });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 2000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setStatus("error");
      setError(err.message || "Couldn't save your profile. Try again.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/"
          aria-label="Back to helloModa"
          className="glass-circle grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink"
        >
          <Home size={17} />
        </Link>
        <div>
          <h1 className="font-display text-[26px] font-medium leading-tight text-ink">Your profile</h1>
          <p className="mt-0.5 text-[13.5px] text-muted">{userEmail}</p>
        </div>
      </div>

      <div className="mb-6">
        <UsageSummary usage={usage} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Section title="Photo & name">
          <div className="flex items-center gap-4">
            <label className="relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-accent-soft bg-white/40">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Plus size={20} className="text-muted" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="sr-only"
              />
            </label>
            <div className="flex-1">
              <Field label="Username">
                <input
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="What should helloModa call you?"
                  className="input"
                />
              </Field>
            </div>
          </div>
        </Section>

        <Section title="About you">
          <Field label="Gender">
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(gender === g ? "" : g)}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                    gender === g
                      ? "bg-accent text-white shadow-soft"
                      : "glass-soft text-muted hover:text-accent-deep"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        <Section title="Measurements" hint="Optional — helps fit and silhouette suggestions, never shown to other users.">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Field label="Height (cm)">
              <input type="number" inputMode="decimal" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} className="input" />
            </Field>
            <Field label="Weight (kg)">
              <input type="number" inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} className="input" />
            </Field>
            <Field label="Bust (cm)">
              <input type="number" inputMode="decimal" value={bustCm} onChange={(e) => setBustCm(e.target.value)} className="input" />
            </Field>
            <Field label="Waist (cm)">
              <input type="number" inputMode="decimal" value={waistCm} onChange={(e) => setWaistCm(e.target.value)} className="input" />
            </Field>
            <Field label="Hip (cm)">
              <input type="number" inputMode="decimal" value={hipCm} onChange={(e) => setHipCm(e.target.value)} className="input" />
            </Field>
          </div>
        </Section>

        <Section title="Sizes">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Top">
              <input value={sizeTop} onChange={(e) => setSizeTop(e.target.value)} placeholder="e.g. M" className="input" />
            </Field>
            <Field label="Bottom">
              <input value={sizeBottom} onChange={(e) => setSizeBottom(e.target.value)} placeholder="e.g. 29" className="input" />
            </Field>
            <Field label="Shoe">
              <input value={sizeShoe} onChange={(e) => setSizeShoe(e.target.value)} placeholder="e.g. US 8" className="input" />
            </Field>
          </div>
        </Section>

        <Section title="Style preferences" hint="Tap a suggestion or add your own — these guide every recommendation.">
          <TagField values={styleTraits} onChange={setStyleTraits} suggestions={STYLE_SUGGESTIONS} placeholder="Add a style, press Enter" />
        </Section>

        <Section title="Brands">
          <Field label="Favorite brands">
            <TagField values={favoriteBrands} onChange={setFavoriteBrands} placeholder="Add a brand, press Enter" />
          </Field>
          <div className="mt-4">
            <Field label="Brands to avoid">
              <TagField values={avoidBrands} onChange={setAvoidBrands} placeholder="Add a brand, press Enter" />
            </Field>
          </div>
        </Section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={status === "saving"}
            className="flex items-center gap-1.5 rounded-xl2 bg-accent px-5 py-2.5 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            {status === "saved" && <Check size={16} />}
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save profile"}
          </button>
          {status === "error" && <p className="text-[13px] text-red-500">{error}</p>}
        </div>
      </form>

      <style>{`
        .input{
          width:100%; height:42px; padding:0 14px; border-radius:12px;
          background:rgba(255,255,255,0.7); border:1px solid #e7e3f1; color:#2b2840;
          font-size:14px; outline:none;
        }
        .input:focus{ border-color:#a789f4; box-shadow:0 0 0 3px rgba(167,137,244,0.18); }
      `}</style>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="glass rounded-xl3 p-5 sm:p-6">
      <h2 className="font-display text-[17px] font-medium text-ink">{title}</h2>
      {hint && <p className="mt-1 text-[12.5px] text-muted">{hint}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block text-muted">{label}</span>
      {children}
    </label>
  );
}

// Chip list + free-text add (Enter/comma), with optional one-tap suggestions
// for values not yet selected. Used for style preferences and brands.
function TagField({ values, onChange, suggestions = [], placeholder }) {
  const [draft, setDraft] = useState("");

  function addTag(raw) {
    const tag = raw.trim();
    if (!tag || values.includes(tag)) return;
    onChange([...values, tag]);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(draft);
      setDraft("");
    }
  }

  const remainingSuggestions = suggestions.filter((s) => !values.includes(s));

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {values.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1.5 rounded-full bg-accent-tint px-3 py-1.5 text-[13px] font-medium text-accent-deep"
          >
            {tag}
            <button type="button" onClick={() => onChange(values.filter((v) => v !== tag))} aria-label={`Remove ${tag}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => {
            addTag(draft);
            setDraft("");
          }}
          placeholder={placeholder}
          className="h-9 min-w-[10rem] flex-1 rounded-full bg-white/60 px-3.5 text-[13px] text-ink placeholder:text-faint focus:outline-none"
        />
      </div>
      {remainingSuggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full px-3 py-1.5 text-[12.5px] text-muted glass-soft hover:text-accent-deep"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
