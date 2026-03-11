"use client";

import { useEffect, useState } from "react";
import { SectorData } from "@/types/market";

function getHeatColor(value: number): string {
  if (value >= 2) return "bg-emerald-500/60 text-emerald-100";
  if (value >= 1) return "bg-emerald-500/40 text-emerald-200";
  if (value >= 0.3) return "bg-emerald-500/20 text-emerald-300";
  if (value >= -0.3) return "bg-white/[0.06] text-zinc-300";
  if (value >= -1) return "bg-red-500/20 text-red-300";
  if (value >= -2) return "bg-red-500/40 text-red-200";
  return "bg-red-500/60 text-red-100";
}

export function SectorHeatmap() {
  const [data, setData] = useState<SectorData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
      {data.map((sector) => {
        const colorClass = getHeatColor(sector.dailyChange);
        return (
          <div
            key={sector.symbol}
            className={`flex flex-col items-center justify-center rounded-lg px-2 py-3 ${colorClass}`}
          >
            <div className="text-xs font-medium">{sector.nameKo}</div>
            <div className="mt-0.5 text-sm font-bold">
              {sector.dailyChange >= 0 ? "+" : ""}
              {sector.dailyChange.toFixed(1)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
