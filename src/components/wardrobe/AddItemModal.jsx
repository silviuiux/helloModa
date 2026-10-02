import { useRef, useState } from "react";
import { Plus } from "../Icons.jsx";
import { resizeImageFile, blobToBase64 } from "../../lib/imageResize.js";
import { createClient } from "../../lib/supabase/client.js";

const categories = ["Tops", "Bottoms", "Dresses", "Outerwear", "Shoes", "Bags", "Accessories"];
const iconByCategory = {
  Tops: "shirt",
  Bottoms: "hanger",
  Dresses: "dress",
  Outerwear: "hanger",
  Shoes: "shoe",
  Bags: "bag",
  Accessories: "sparkle",
};
const swatches = ["#1c1a17", "#efe7d8", "#b9966a", "#3c4a47", "#7a5f63", "#c8a44e", "#8d8175", "#39363a"];

export default function AddItemModal({ open, onClose, onAdd }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("Tops");
  const [color, setColor] = useState(swatches[0]);
  const [price, setPrice] = useState("");
  const [photoBlob, setPhotoBlob] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [photoError, setPhotoError] = useState(null);
  const fileInputRef = useRef(null);

  if (!open) return null;

  // Doesn't revoke previewUrl — the caller decides that, since a successful
  // submit hands the blob URL off to the just-added wardrobe item (it stays
  // alive until AppShell swaps in the server-confirmed image).
  function resetForm() {
    setName("");
    setBrand("");
    setCategory("Tops");
    setColor(swatches[0]);
    setPrice("");
    setPhotoBlob(null);
    setPreviewUrl(null);
    setPhotoError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function handleCancel() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    resetForm();
    onClose();
  }

  async function handlePhotoChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoError(null);
    setAnalyzing(true);
    try {
      const resized = await resizeImageFile(file);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPhotoBlob(resized);
      setPreviewUrl(URL.createObjectURL(resized));

      const imageBase64 = await blobToBase64(resized);
      const res = await fetch("/api/wardrobe/tag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, mediaType: "image/jpeg" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't analyze that photo.");

      if (data.tags.name) setName(data.tags.name);
      if (data.tags.category) setCategory(data.tags.category);
      if (data.tags.colorHex) setColor(data.tags.colorHex);
      if (data.tags.brand) setBrand(data.tags.brand);
    } catch (err) {
      console.error("Wardrobe photo tagging failed:", err);
      setPhotoError("Couldn't read that photo — add the details below instead.");
    } finally {
      setAnalyzing(false);
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;

    let imagePath = null;
    if (photoBlob) {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const path = `${user.id}/${crypto.randomUUID()}.jpg`;
        const { error } = await supabase.storage
          .from("wardrobe-photos")
          .upload(path, photoBlob, { contentType: "image/jpeg" });
        if (error) {
          console.error("Failed to upload wardrobe photo:", error.message);
        } else {
          imagePath = path;
        }
      }
    }

    onAdd({
      id: `w-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || "Unbranded",
      category,
      color,
      icon: iconByCategory[category],
      tags: ["New"],
      fav: false,
      image: previewUrl,
      imagePath,
      priceCents: Number.isFinite(parseFloat(price)) && price.trim() ? Math.round(parseFloat(price) * 100) : null,
    });
    resetForm();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-[#fdfcfa]/70 backdrop-blur-xl" onClick={handleCancel} />
      <form
        onSubmit={submit}
        className="animate-fade-up relative max-h-[92svh] w-full max-w-md overflow-y-auto rounded-[26px] bg-white p-7 text-[#2b2633] shadow-[0_60px_120px_-50px_rgba(90,70,160,0.45),0_0_0_1px_rgba(43,38,51,0.05)]"
      >
        <h3 className="font-script text-[34px] leading-none">Add a <span className="font-hand text-[#8f78e8]">piece.</span></h3>
        <p className="mt-3 text-[13.5px] leading-relaxed text-[#2b2633]/55">
          Snap a photo and helloModa fills in the rest — or add the details yourself.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Photo">
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative grid h-20 w-16 shrink-0 place-items-center overflow-hidden rounded-[14px] border border-dashed border-[#8f78e8]/40 bg-[#f7f4fb]">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Plus size={18} className="text-[#2b2633]/45" />
                )}
              </div>
              <span className="text-[13.5px] text-[#2b2633]/60">
                {analyzing
                  ? "Analyzing photo…"
                  : previewUrl
                    ? "Tap to replace photo"
                    : "Tap to take or upload a photo"}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoChange}
                className="sr-only"
              />
            </label>
            {photoError && <p className="mt-1.5 text-[12px] text-[#c2577a]">{photoError}</p>}
          </Field>

          <Field label="Name">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ivory sheer knit"
              className="input"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Optional"
                className="input"
              />
            </Field>
            <Field label="Category">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input appearance-none"
              >
                {categories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Color">
            <div className="flex flex-wrap gap-2">
              {swatches.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setColor(s)}
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-white transition ${
                    color === s ? "ring-[#8f78e8]" : "ring-transparent"
                  }`}
                  style={{ backgroundColor: s }}
                  aria-label={`Pick ${s}`}
                />
              ))}
            </div>
          </Field>

          <Field label="Purchase price (optional)">
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 89.00"
              className="input"
            />
            <p className="mt-1.5 text-[11.5px] text-[#2b2633]/40">Unlocks cost per wear for this piece. Optional — add it anytime.</p>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-full px-4 py-2.5 text-[14px] text-[#2b2633]/55 transition-colors hover:text-[#2b2633]"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={analyzing}
            className="flex items-center gap-1.5 rounded-full bg-[#2b2633] px-5 py-2.5 text-[14px] font-medium text-white transition-colors hover:bg-[#8f78e8] disabled:opacity-60"
          >
            <Plus size={16} />
            Add item
          </button>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#2b2633]/45">{label}</span>
      {children}
    </label>
  );
}
