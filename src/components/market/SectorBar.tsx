"use client";

import { useEffect, useState } from "react";
import { SectorData } from "@/types/market";

export function SectorBar() {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"1M" | "3M">("1M");

  useEffect(() => {
    fetch("/api/market/sectors")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  const sorted = [...data].sort((a, b) => {
    const va = period === "1M" ? a.return1M : a.return3M;
    const vb = period === "1M" ? b.return1M : b.return3M;
    return vb - va;
  });

  const maxAbs = Math.max(
    ...sorted.map((s) =>
      Math.abs(period === "1M" ? s.return1M : s.return3M),
    ),
    1,
  );

  return (
    <div>
      <div className="mb-3 flex gap-1">
        {(["1M", "3M"] as const).map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
              period === p
                ? "bg-white/10 text-white"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <div className="space-y-1.5">
        {sorted.map((sector) => {
          const value = period === "1M" ? sector.return1M : sector.return3M;
          const isPositive = value >= 0;
          const barWidth = (Math.abs(value) / maxAbs) * 100;

          return (
            <div key={sector.symbol} className="flex items-center gap-2">
              <div className="w-20 shrink-0 text-right text-xs text-zinc-400">
                {sector.nameKo}
              </div>
              <div className="relative h-5 flex-1">
                <div
                  className={`absolute top-0 h-full rounded-sm transition-all ${
                    isPositive ? "bg-emerald-500/40" : "bg-red-500/40"
                  }`}
                  style={{
                    width: `${barWidth}%`,
                    left: isPositive ? "0%" : undefined,
                    right: !isPositive ? "0%" : undefined,
                  }}
                />
                <span
                  className={`absolute top-0.5 text-xs font-medium ${
                    isPositive
                      ? "left-1 text-emerald-400"
                      : "right-1 text-red-400"
                  }`}
                >
                  {isPositive ? "+" : ""}
                  {value.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
