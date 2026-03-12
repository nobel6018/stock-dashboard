"use client";

import npsData from "@/lib/data/nps-holdings.json";

const ALLOCATION_COLORS: Record<string, string> = {
  국내주식: "#4ade80",
  해외주식: "#60a5fa",
  국내채권: "#fbbf24",
  해외채권: "#f472b6",
  대체투자: "#a78bfa",
};

function formatValueBillion(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`;
  return `${v.toLocaleString()}억`;
}

export default function NpsPage() {
  const allocation = npsData.assetAllocation;
  const allocationEntries = Object.entries(allocation).filter(
    ([key]) => key !== "기준일",
  ) as [string, number][];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">국민연금 포트폴리오</h1>
        <p className="mt-1 text-sm text-zinc-500">
          기준일: {npsData.referenceDate} · 총 {npsData.totalHoldings}개 해외주식
          보유 · 출처: {npsData.source}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-1">
          <h2 className="mb-4 text-lg font-semibold">자산배분 현황</h2>
          <div className="space-y-3">
            {allocationEntries.map(([key, value]) => (
              <div key={key}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{
                        backgroundColor: ALLOCATION_COLORS[key] || "#6b7280",
                      }}
                    />
                    {key}
                  </span>
                  <span className="font-mono text-zinc-300">{value}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(value / 40) * 100}%`,
                      backgroundColor: ALLOCATION_COLORS[key] || "#6b7280",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">해외주식 Top 20</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">종목</th>
                  <th className="py-2 pr-3 text-right">평가액</th>
                  <th className="py-2 pr-3 text-right">비중</th>
                  <th className="py-2 text-right">지분율</th>
                </tr>
              </thead>
              <tbody>
                {npsData.topForeignHoldings.map((h) => (
                  <tr
                    key={h.rank}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                  >
                    <td className="py-2.5 pr-3 text-zinc-600">{h.rank}</td>
                    <td className="py-2.5 pr-3 font-medium text-white">
                      {h.name}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-zinc-300">
                      {formatValueBillion(h.valueBillion)}
                    </td>
                    <td className="py-2.5 pr-3 text-right font-mono text-zinc-300">
                      {h.weight}%
                    </td>
                    <td className="py-2.5 text-right font-mono text-zinc-400">
                      {h.ownershipPct}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>

    </div>
  );
}
