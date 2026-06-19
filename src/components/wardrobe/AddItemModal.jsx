import { useState } from "react";
import { Plus } from "../Icons.jsx";

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

  if (!open) return null;

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      id: `w-${Date.now()}`,
      name: name.trim(),
      brand: brand.trim() || "Unbranded",
      category,
      color,
      icon: iconByCategory[category],
      tags: ["New"],
      fav: false,
    });
    setName("");
    setBrand("");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-ink/30 backdrop-blur-sm" onClick={onClose} />
      <form
        onSubmit={submit}
        className="glass animate-fade-up relative w-full max-w-md rounded-xl3 p-6"
      >
        <h3 className="font-display text-[22px] font-medium text-ink">Add wardrobe item</h3>
        <p className="mt-1 text-[13px] text-muted">
          Log a piece so helloModa can style around it.
        </p>

        <div className="mt-5 space-y-4">
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
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl2 px-4 py-2.5 text-[14px] font-medium text-muted transition-colors hover:text-ink"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-xl2 bg-accent px-4 py-2.5 text-[14px] font-medium text-white shadow-soft transition-all hover:bg-accent-deep hover:scale-[1.02]"
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
