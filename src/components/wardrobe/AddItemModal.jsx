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
      setPhotoError("Couldn't auto-tag that photo — fill in the details below.");
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
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={handleCancel} />
      <form
        onSubmit={submit}
        className="glass animate-fade-up relative w-full max-w-md rounded-xl3 p-6"
      >
        <h3 className="font-display text-[22px] font-medium text-ink">Add wardrobe item</h3>
        <p className="mt-1 text-[13px] text-muted">
          Snap a photo and helloModa fills in the details — or log it manually.
        </p>

        <div className="mt-5 space-y-4">
          <Field label="Photo">
            <label className="flex cursor-pointer items-center gap-3">
              <div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl2 border border-dashed border-accent-soft bg-white/40">
                {previewUrl ? (
                  <img src={previewUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <Plus size={18} className="text-muted" />
                )}
              </div>
              <span className="text-[13px] text-muted">
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
            {photoError && <p className="mt-1.5 text-[12px] text-red-500">{photoError}</p>}
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
                  className={`h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-canvas transition ${
                    color === s ? "ring-accent" : "ring-transparent"
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
            <p className="mt-1 text-[11.5px] text-faint">Powers cost-per-wear on this piece — skip it, add it anytime.</p>
          </Field>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="rounded-xl2 px-4 py-2.5 text-[14px] font-medium text-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={analyzing}
            className="flex items-center gap-1.5 rounded-xl2 bg-accent px-4 py-2.5 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.02] disabled:opacity-60 disabled:hover:scale-100"
          >
            <Plus size={16} />
            Add item
          </button>
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

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="label mb-1.5 block text-muted">{label}</span>
      {children}
    </label>
  );
}
