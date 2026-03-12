"use client";

import { useEffect, useRef, useState } from "react";

interface InfoTooltipProps {
  text: string;
}

export function InfoTooltip({ text }: InfoTooltipProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div ref={ref} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-white/[0.06] text-[10px] text-zinc-500 hover:bg-white/10 hover:text-zinc-300"
      >
        i
      </button>
      {open && (
        <div className="absolute left-0 top-6 z-50 w-64 rounded-lg border border-white/[0.08] bg-zinc-900 px-3 py-2 text-xs leading-relaxed text-zinc-400 shadow-xl">
          {text}
        </div>
      )}
    </div>
  );
}
