"use client";

import { Holding } from "@/types/portfolio";
import { formatLargeNumber } from "@/lib/utils/formatters";

interface HoldingsTableProps {
  holdings: Holding[];
  maxRows?: number;
}

const CHANGE_BADGE: Record<string, { label: string; className: string }> = {
  new: { label: "NEW", className: "bg-emerald-400/10 text-emerald-400" },
  add: { label: "ADD", className: "bg-blue-400/10 text-blue-400" },
  reduce: { label: "REDUCE", className: "bg-amber-400/10 text-amber-400" },
  sold: { label: "SOLD", className: "bg-red-400/10 text-red-400" },
  unchanged: { label: "", className: "" },
};

export function HoldingsTable({ holdings, maxRows }: HoldingsTableProps) {
  const display = maxRows ? holdings.slice(0, maxRows) : holdings;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
            <th className="py-2 pr-4">#</th>
            <th className="py-2 pr-4">종목</th>
            <th className="py-2 pr-4 text-right">비중</th>
            <th className="py-2 pr-4 text-right">가치</th>
            <th className="py-2 pr-4 text-right">주수</th>
            <th className="py-2">변동</th>
          </tr>
        </thead>
        <tbody>
          {display.map((holding, i) => {
            const badge = CHANGE_BADGE[holding.change || "unchanged"];
            return (
              <tr
                key={`${holding.name}-${i}`}
                className="border-b border-white/[0.03] hover:bg-white/[0.02]"
              >
                <td className="py-2.5 pr-4 text-zinc-600">{i + 1}</td>
                <td className="py-2.5 pr-4">
                  <div>
                    <span className="font-medium text-white">
                      {holding.ticker || holding.cusip || "—"}
                    </span>
                    <span className="ml-2 text-xs text-zinc-500">
                      {holding.name}
                    </span>
                  </div>
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-zinc-300">
                  {holding.weight.toFixed(1)}%
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-zinc-400">
                  {formatLargeNumber(holding.value)}
                </td>
                <td className="py-2.5 pr-4 text-right font-mono text-zinc-500">
                  {holding.shares.toLocaleString()}
                </td>
                <td className="py-2.5">
                  {badge.label && (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${badge.className}`}
                    >
                      {badge.label}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
