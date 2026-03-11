"use client";

import fundFlowsData from "@/lib/data/fund-flows.json";

interface FlowEntry {
  week: string;
  equity: number;
  bond: number;
  money: number;
}

const CATEGORIES = [
  { key: "equity" as const, label: "주식", color: "bg-emerald-500" },
  { key: "bond" as const, label: "채권", color: "bg-blue-500" },
  { key: "money" as const, label: "현금", color: "bg-amber-500" },
];

export function FundFlowChart() {
  const flows = fundFlowsData.data as FlowEntry[];
  const maxAbs = Math.max(
    ...flows.flatMap((f) => [
      Math.abs(f.equity),
      Math.abs(f.bond),
      Math.abs(f.money),
    ]),
    1,
  );

  return (
    <div>
      <div className="mb-3 flex items-center gap-4">
        {CATEGORIES.map((cat) => (
          <div key={cat.key} className="flex items-center gap-1.5">
            <div className={`h-2.5 w-2.5 rounded-sm ${cat.color}`} />
            <span className="text-xs text-zinc-400">{cat.label}</span>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {flows.map((flow) => (
          <div key={flow.week}>
            <div className="mb-1 text-xs text-zinc-500">
              {flow.week.slice(5)}
            </div>
            <div className="flex gap-1">
              {CATEGORIES.map((cat) => {
                const value = flow[cat.key];
                const width = (Math.abs(value) / maxAbs) * 100;
                const isPositive = value >= 0;
                return (
                  <div
                    key={cat.key}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-1">
                      <div
                        className={`h-4 rounded-sm ${cat.color} ${isPositive ? "opacity-60" : "opacity-30"}`}
                        style={{ width: `${Math.max(width, 4)}%` }}
                      />
                      <span
                        className={`text-[10px] ${isPositive ? "text-zinc-300" : "text-zinc-500"}`}
                      >
                        {isPositive ? "+" : ""}
                        {value.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 text-right text-[10px] text-zinc-600">
        단위: 십억 달러 · 마지막 업데이트: {fundFlowsData.lastUpdated}
      </div>
    </div>
  );
}
