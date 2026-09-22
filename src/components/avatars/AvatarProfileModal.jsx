"use client";

import { useRef, useState } from "react";
import { Plus, Check, Refresh } from "../Icons.jsx";
import { resizeImageFile, blobToBase64 } from "../../lib/imageResize.js";
import { createAvatarProfile, updateAvatarProfile } from "../../actions/avatars.js";
import { avatarConsentCopy } from "../../lib/avatarConsent.js";
import { BUILD_OPTIONS, suggestBuildFromBMI } from "../../lib/avatarBuild.js";

// Direct request 2026-09-22: two gender options only (drives "man"/"woman"
// vs "boy"/"girl" phrasing in the generation prompt via age, not a
// separate child option here).
const GENDER_OPTIONS = ["Woman", "Man"];

function toFields(p) {
  return {
    displayName: p?.display_name || "",
    relationship: p?.relationship || "",
    gender: p?.gender || "",
    age: p?.age ?? "",
    build: p?.build || "",
    heightCm: p?.height_cm ?? "",
    weightKg: p?.weight_kg ?? "",
    bustCm: p?.bust_cm ?? "",
    waistCm: p?.waist_cm ?? "",
    hipCm: p?.hip_cm ?? "",
    sizeTop: p?.size_top || "",
    sizeBottom: p?.size_bottom || "",
    sizeShoe: p?.size_shoe || "",
  };
}

// Handles both creating a new avatar_profiles row and editing an existing
// one, plus the (separate, consent-gated) photo -> watercolor generation
// step, which needs a saved row to attach to (avatar_profile_id). A brand
// new profile is saved first — silently, no extra click — the moment the
// photo section becomes relevant, so "fill in details, then add a photo"
// reads as one flow even though it's two requests under the hood.
export default function AvatarProfileModal({ open, onClose, profile, isSelf, selfDefaults, onSaved, onDeleted }) {
  const [fields, setFields] = useState(() => {
    const initial = toFields(profile || (isSelf ? { ...selfDefaults, display_name: "" } : null));
    if (!initial.build) {
      const suggested = suggestBuildFromBMI(initial.heightCm, initial.weightKg);
      if (suggested) initial.build = suggested;
    }
    return initial;
  });
  const [buildTouched, setBuildTouched] = useState(Boolean(profile?.build));
  const [savedProfile, setSavedProfile] = useState(profile || null);
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | error
  const [saveError, setSaveError] = useState("");

  const [photoBlob, setPhotoBlob] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [consent, setConsent] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genError, setGenError] = useState("");
  const [paintedOnce, setPaintedOnce] = useState(false);
  const fileInputRef = useRef(null);

  if (!open) return null;

  function set(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  function setHeightOrWeight(key) {
    return (e) => {
      const value = e.target.value;
      setFields((f) => {
        const next = { ...f, [key]: value };
        if (!buildTouched) {
          const suggested = suggestBuildFromBMI(
            key === "heightCm" ? value : next.heightCm,
            key === "weightKg" ? value : next.weightKg
          );
          if (suggested) next.build = suggested;
        }
        return next;
      });
    };
  }

  function chooseFile() {
    fileInputRef.current?.click();
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file, 1024, 0.88);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoBlob(resized);
    setPhotoPreview(URL.createObjectURL(resized));
    setConsent(false);
    setPaintedOnce(false);
    setGenError("");
  }

  async function saveDetails(e) {
    e?.preventDefault();
    setSaveStatus("saving");
    setSaveError("");
    const numeric = {
      ...fields,
      age: fields.age === "" ? null : Number(fields.age),
      heightCm: fields.heightCm === "" ? null : Number(fields.heightCm),
      weightKg: fields.weightKg === "" ? null : Number(fields.weightKg),
      bustCm: fields.bustCm === "" ? null : Number(fields.bustCm),
      waistCm: fields.waistCm === "" ? null : Number(fields.waistCm),
      hipCm: fields.hipCm === "" ? null : Number(fields.hipCm),
    };
    try {
      const row = savedProfile
        ? await updateAvatarProfile(savedProfile.id, numeric)
        : await createAvatarProfile({ ...numeric, isSelf });
      setSavedProfile(row);
      onSaved(row);
      setSaveStatus("idle");
      return row;
    } catch (err) {
      console.error("Failed to save avatar profile:", err);
      setSaveStatus("error");
      setSaveError(err.message || "Couldn't save. Try again.");
      return null;
    }
  }

  async function handleGenerate() {
    if (!photoBlob || !consent) return;
    setGenerating(true);
    setGenError("");

    // Make sure details are saved first, since generation needs a real id
    // and uses the saved age/build/measurements, not just the form state.
    let target = savedProfile;
    if (!target || fieldsChanged()) {
      target = await saveDetails();
      if (!target) {
        setGenerating(false);
        return;
      }
    }

    try {
      const imageBase64 = await blobToBase64(photoBlob);
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarProfileId: target.id, imageBase64, mediaType: "image/jpeg", consent: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't paint an avatar.");

      const updated = { ...target, avatar_image_signed_url: data.imageUrl };
      setSavedProfile(updated);
      onSaved(updated);
      // Deliberately keeps photoBlob/consent so "Try again" (a different
      // request to the same photo, still in memory — never re-stored) is
      // one click if the result doesn't actually look like the person.
      // The photo itself is discarded the moment this modal closes or a
      // different one is chosen, same as before.
      setPaintedOnce(true);
    } catch (err) {
      console.error("Avatar generation failed:", err);
      setGenError(err.message || "Couldn't paint an avatar right now.");
    } finally {
      setGenerating(false);
    }
  }

  function fieldsChanged() {
    if (!savedProfile) return true;
    const current = toFields(savedProfile);
    return JSON.stringify(current) !== JSON.stringify(fields);
  }

  async function handleDelete() {
    if (!savedProfile) {
      onClose();
      return;
    }
    onDeleted(savedProfile);
    onClose();
  }

  const currentAvatarUrl = paintedOnce
    ? savedProfile?.avatar_image_signed_url
    : photoPreview || savedProfile?.avatar_image_signed_url;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto p-4">
      <div className="absolute inset-0 bg-ink/25 backdrop-blur-md" onClick={onClose} />
      <div className="glass animate-fade-up relative my-8 w-full max-w-lg rounded-xl3 p-6">
        <h3 className="font-display text-[22px] font-semibold tracking-[-0.03em] text-ink">
          {savedProfile ? `Edit ${savedProfile.display_name}` : isSelf ? "Set up your avatar" : "Add a family member"}
        </h3>
        <p className="mt-1 text-[13px] text-muted">
          {isSelf
            ? "Your measurements shape how every look fits. Add a photo (optional) and helloModa paints you in watercolour — the photo is deleted right after."
            : "Their measurements shape how every look fits them when you style on their behalf."}
        </p>

        <form onSubmit={saveDetails} className="mt-5 space-y-4">
          <Field label="Name">
            <input autoFocus value={fields.displayName} onChange={set("displayName")} placeholder="e.g. Mom" className="input" required />
          </Field>

          {!isSelf && (
            <Field label="Relationship">
              <input value={fields.relationship} onChange={set("relationship")} placeholder="e.g. Partner, Daughter" className="input" />
            </Field>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Gender">
              <div className="flex flex-wrap gap-2">
                {GENDER_OPTIONS.map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setFields((f) => ({ ...f, gender: f.gender === g ? "" : g }))}
                    className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                      fields.gender === g ? "bg-accent text-canvas shadow-soft" : "glass-soft text-muted hover:text-accent-deep"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Age">
              <input type="number" inputMode="numeric" min="0" max="120" value={fields.age} onChange={set("age")} placeholder="e.g. 34" className="input" required />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Height (cm)"><input type="number" inputMode="decimal" value={fields.heightCm} onChange={setHeightOrWeight("heightCm")} className="input" /></Field>
            <Field label="Weight (kg)"><input type="number" inputMode="decimal" value={fields.weightKg} onChange={setHeightOrWeight("weightKg")} className="input" /></Field>
            <Field label="Bust (cm)"><input type="number" inputMode="decimal" value={fields.bustCm} onChange={set("bustCm")} className="input" /></Field>
            <Field label="Waist (cm)"><input type="number" inputMode="decimal" value={fields.waistCm} onChange={set("waistCm")} className="input" /></Field>
            <Field label="Hip (cm)"><input type="number" inputMode="decimal" value={fields.hipCm} onChange={set("hipCm")} className="input" /></Field>
          </div>

          <Field label="Body build" hint="Suggested from height/weight — tap to confirm or change it; the avatar is painted to match, not defaulted to slim/athletic.">
            <div className="flex flex-wrap gap-2">
              {BUILD_OPTIONS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => {
                    setBuildTouched(true);
                    setFields((f) => ({ ...f, build: f.build === b.key ? "" : b.key }));
                  }}
                  className={`rounded-full px-3.5 py-1.5 text-[13px] transition-colors ${
                    fields.build === b.key ? "bg-accent text-canvas shadow-soft" : "glass-soft text-muted hover:text-accent-deep"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Top size"><input value={fields.sizeTop} onChange={set("sizeTop")} placeholder="e.g. M" className="input" /></Field>
            <Field label="Bottom size"><input value={fields.sizeBottom} onChange={set("sizeBottom")} placeholder="e.g. 29" className="input" /></Field>
            <Field label="Shoe size"><input value={fields.sizeShoe} onChange={set("sizeShoe")} placeholder="e.g. US 8" className="input" /></Field>
          </div>

          <div className="flex items-center gap-3 pt-1">
            <button type="submit" disabled={saveStatus === "saving"} className="rounded-xl2 bg-accent px-4 py-2.5 text-[14px] font-medium text-canvas shadow-soft transition-all hover:bg-accent-deep disabled:opacity-60">
              {saveStatus === "saving" ? "Saving…" : "Save details"}
            </button>
            {saveStatus === "error" && <p className="text-[12.5px] text-red-500">{saveError}</p>}
          </div>
        </form>

        <div className="mt-6 border-t border-line pt-5">
          <p className="label text-faint">Watercolor avatar</p>
          <p className="mt-1 text-[12.5px] text-muted">
            Used as the model for outfits styled for {isSelf ? "you" : fields.displayName || "this person"} in chat.
          </p>

          <div className="mt-4 flex items-start gap-4">
            <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-xl2 border border-dashed border-accent-soft bg-white/60">
              {currentAvatarUrl ? (
                <img src={currentAvatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Plus size={18} className="text-muted" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <button type="button" onClick={chooseFile} className="text-[13px] font-medium text-accent-deep hover:underline">
                {photoBlob ? "Choose a different photo" : "Choose a reference photo"}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="sr-only" />

              {photoBlob && !paintedOnce && (
                <label className="flex items-start gap-2.5 text-[12px] leading-snug text-muted">
                  <input
                    type="checkbox"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-accent"
                  />
                  {avatarConsentCopy(isSelf)}
                </label>
              )}

              {photoBlob && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!consent || generating}
                    className="flex items-center gap-1.5 rounded-xl2 bg-accent px-4 py-2 text-[13.5px] font-medium text-canvas shadow-soft transition-all hover:bg-accent-deep disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {generating ? (
                      "Painting…"
                    ) : paintedOnce ? (
                      <>
                        <Refresh size={13} /> Try again
                      </>
                    ) : (
                      "Paint my avatar"
                    )}
                  </button>
                  {paintedOnce && !generating && (
                    <span className="text-[11.5px] text-faint">Not quite you? Repaint from the same photo.</span>
                  )}
                </div>
              )}
              {genError && <p className="text-[12.5px] text-red-500">{genError}</p>}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <button type="button" onClick={handleDelete} className="text-[13px] font-medium text-muted hover:text-red-500">
            {savedProfile ? "Remove this avatar" : "Cancel"}
          </button>
          <button type="button" onClick={onClose} className="flex items-center gap-1.5 rounded-xl2 px-4 py-2 text-[13.5px] font-medium text-ink glass-soft">
            <Check size={14} /> Done
          </button>
        </div>
      </div>

      <style>{`
        .input{
          width:100%; height:42px; padding:0 14px; border-radius:12px;
          background:rgba(255,255,255,0.8); border:1px solid #e6e1f0; color:#1e1a2e;
          font-size:14px; outline:none;
        }
        .input:focus{ border-color:#8b6cf0; box-shadow:0 0 0 3px rgba(139,108,240,0.18); }
      `}</style>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block text-muted">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] text-faint">{hint}</span>}
    </label>
  );
}
