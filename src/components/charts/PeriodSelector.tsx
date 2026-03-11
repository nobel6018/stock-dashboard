"use client";

import { cn } from "@/lib/utils";

const PERIODS = ["1M", "3M", "6M", "1Y", "3Y", "5Y", "ALL"] as const;

interface PeriodSelectorProps {
  selected: string;
  onChange: (period: string) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <div className="flex gap-1">
      {PERIODS.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium transition-colors",
            selected === p
              ? "bg-white/10 text-white"
              : "text-zinc-500 hover:text-zinc-300",
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
