"use client";

import { useRef, useState } from "react";
import { Plus, X, Check } from "../Icons.jsx";
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
    <div className="mx-auto w-full max-w-2xl px-6 pb-32 pt-28 sm:pt-36">
      <p className="text-[10.5px] font-medium uppercase tracking-[0.24em] text-[#2b2633]/45">{userEmail}</p>
      <h1 className="mt-4 font-script text-[46px] leading-[1.02] text-[#2b2633] sm:text-[60px]">
        Your profile, <span className="font-hand text-[#8f78e8]">your style.</span>
      </h1>
      <p className="mt-5 max-w-lg text-[15px] leading-[1.7] text-[#2b2633]/60">
        The more helloModa knows about your fit and taste, the closer every look lands.
      </p>

      <div className="mb-6 mt-12">
        <UsageSummary usage={usage} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-12">
        <Section title="Photo & name">
          <div className="flex items-center gap-4">
            <label className="relative grid h-20 w-20 shrink-0 cursor-pointer place-items-center overflow-hidden rounded-full border border-dashed border-[#8f78e8]/40 bg-white/60">
              {avatarPreview ? (
                <img src={avatarPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <Plus size={20} className="text-[#2b2633]/45" />
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
                      ? "bg-[#2b2633] text-white"
                      : "bg-white/60 text-[#2b2633]/60 ring-1 ring-[#2b2633]/10 hover:text-[#2b2633]"
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
            className="flex items-center gap-1.5 rounded-full bg-[#2b2633] text-white transition-colors hover:bg-[#8f78e8] px-6 py-3 text-[14px] font-medium disabled:opacity-60"
          >
            {status === "saved" && <Check size={16} />}
            {status === "saving" ? "Saving…" : status === "saved" ? "Saved" : "Save profile"}
          </button>
          {status === "error" && <p className="text-[13px] text-[#c2577a]">{error}</p>}
        </div>
      </form>

      <style>{`
        .input{
          width:100%; height:42px; padding:0; border:0; border-bottom:1px solid rgba(43,38,51,0.15);
          border-radius:0; background:transparent; color:#2b2633; font-size:15px; outline:none;
        }
        .input:focus{ border-bottom-color:#8f78e8; box-shadow:none; }
      `}</style>
    </div>
  );
}

function Section({ title, hint, children }) {
  return (
    <section className="border-t border-[#2b2633]/10 pt-6">
      <h2 className="font-script text-[30px] leading-none text-[#2b2633]">{title}</h2>
      {hint && <p className="mt-2 text-[13px] text-[#2b2633]/50">{hint}</p>}
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#2b2633]/45">{label}</span>
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
            className="flex items-center gap-1.5 rounded-full bg-[#2b2633] px-3.5 py-1.5 text-[13px] text-white"
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
          className="h-9 min-w-[10rem] flex-1 border-0 border-b border-[#2b2633]/15 bg-transparent px-0 text-[14px] text-[#2b2633] placeholder:text-[#2b2633]/35 focus:border-[#8f78e8] focus:outline-none focus:ring-0"
        />
      </div>
      {remainingSuggestions.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-2">
          {remainingSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="rounded-full px-3 py-1.5 text-[12.5px] bg-white/60 text-[#2b2633]/60 ring-1 ring-[#2b2633]/10 hover:text-[#2b2633]"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
