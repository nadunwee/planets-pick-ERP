import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function AddItemModal({
  isOpen,
  onClose,
  onSubmit,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => firstInputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) onClose();
    }
    if (isOpen) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const raw = Object.fromEntries(formData.entries());
    const payload = {
      name: raw.name,
      type: raw.type,
      currentStock: Number(raw.currentStock),
      minStock: Number(raw.minStock),
      unit: raw.unit,
      unitPrice: Number(raw.unitPrice),
    };
    onSubmit(payload);
    onClose();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-item-title"
          className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8"
          onMouseDown={handleBackdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-md" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,0.08),transparent_70%)]" />

          <motion.div
            className="relative w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-xl border border-white/30 shadow-[0_10px_40px_-5px_rgba(0,0,0,0.4)]"
            initial={{ opacity: 0, scale: 0.9, y: 18 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: { type: "spring", stiffness: 300, damping: 26 },
            }}
            exit={{
              opacity: 0,
              scale: 0.92,
              y: 12,
              transition: { duration: 0.18 },
            }}
          >
            <div className="absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
            <div className="flex items-start justify-between px-6 pt-6">
              <h2
                id="add-item-title"
                className="text-lg font-semibold text-slate-800"
              >
                Add New Item
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="p-2 -m-2 rounded-full text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 active:scale-95 transition"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pt-4 pb-6 space-y-5">
              <div className="grid gap-4">
                {[
                  {
                    label: "Item Name",
                    name: "name",
                    type: "text",
                    placeholder: "e.g. Steel Rod",
                  },
                  {
                    label: "Type",
                    name: "type",
                    type: "text",
                    placeholder: "e.g. Raw Material",
                  },
                  {
                    label: "Current Stock",
                    name: "currentStock",
                    type: "number",
                    placeholder: "0",
                  },
                  {
                    label: "Min Stock",
                    name: "minStock",
                    type: "number",
                    placeholder: "0",
                  },
                  {
                    label: "Unit",
                    name: "unit",
                    type: "text",
                    placeholder: "e.g. pcs / kg",
                  },
                  {
                    label: "Unit Price",
                    name: "unitPrice",
                    type: "number",
                    placeholder: "0.00",
                    step: "0.01",
                  },
                ].map((f, i) => (
                  <div key={f.name} className="flex flex-col gap-1">
                    <label
                      htmlFor={f.name}
                      className="text-xs font-medium text-slate-600"
                    >
                      {f.label}
                    </label>
                    <input
                      id={f.name}
                      name={f.name}
                      type={f.type}
                      step={f.step}
                      placeholder={f.placeholder}
                      ref={i === 0 ? firstInputRef : undefined}
                      required
                      className="rounded-lg border border-slate-300 bg-white/70 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-500 placeholder:text-slate-400"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-600 text-sm font-medium hover:bg-slate-50 active:scale-[.97] transition focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold shadow hover:from-blue-500 hover:to-indigo-500 active:scale-[.97] transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Item
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
