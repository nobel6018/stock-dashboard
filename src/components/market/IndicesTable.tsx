"use client";

import { useEffect, useState } from "react";
import { IndexData } from "@/types/market";

export function IndicesTable() {
  const [data, setData] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/indices")
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
    <div className="space-y-2">
      {data.map((idx) => {
        const isPositive = idx.changePercent >= 0;
        return (
          <div
            key={idx.symbol}
            className="flex items-center justify-between rounded-lg bg-white/[0.03] px-4 py-3"
          >
            <div>
              <div className="text-sm font-medium text-white">{idx.nameKo}</div>
              <div className="text-xs text-zinc-500">{idx.name}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {idx.price.toLocaleString("en-US", {
                  minimumFractionDigits: idx.price > 1000 ? 0 : 2,
                  maximumFractionDigits: idx.price > 1000 ? 0 : 2,
                })}
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  isPositive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                <span>{isPositive ? "▲" : "▼"}</span>
                <span>
                  {isPositive ? "+" : ""}
                  {idx.changePercent.toFixed(2)}%
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
