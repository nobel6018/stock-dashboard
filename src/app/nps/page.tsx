"use client";

import npsData from "@/lib/data/nps-holdings.json";

const ALLOCATION_COLORS: Record<string, string> = {
  국내주식: "#4ade80",
  해외주식: "#60a5fa",
  국내채권: "#fbbf24",
  해외채권: "#f472b6",
  대체투자: "#a78bfa",
  단기자금: "#6b7280",
};

function formatTrilion(billion: number): string {
  return `${(billion / 10000).toFixed(1)}조`;
}

function formatValueBillion(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`;
  return `${v.toLocaleString()}억`;
}

type Holding = {
  rank: number;
  name: string;
  valueBillion: number;
  weight: number;
  ownershipPct: number;
};

function HoldingsTable({
  title,
  holdings,
  referenceDate,
  totalCount,
}: {
  title: string;
  holdings: Holding[];
  referenceDate: string;
  totalCount: number;
}) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-zinc-500">
          {referenceDate} · {totalCount.toLocaleString()}개 종목
        </span>
      </div>
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
            {holdings.map((h) => (
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
  );
}

export default function NpsPage() {
  const { portfolio, foreignStocks, domesticStocks } = npsData;
  const allocationEntries = Object.entries(portfolio.allocation).filter(
    ([key]) => key !== "단기자금",
  ) as [string, number][];
  const maxAllocation = Math.max(...allocationEntries.map(([, v]) => v));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">국민연금 포트폴리오</h1>
        <p className="mt-1 text-sm text-zinc-500">
          자산현황: {portfolio.referenceDate} 기준 · 총{" "}
          {formatTrilion(portfolio.totalBillion)} · 주식보유:{" "}
          {foreignStocks.referenceDate} 기준 · 출처: {npsData.source}
        </p>
      </div>

      {/* 자산배분 + 연도별 추이 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                  <span className="flex items-center gap-3">
                    <span className="text-xs text-zinc-500">
                      {formatTrilion(
                        portfolio.assets[
                          key as keyof typeof portfolio.assets
                        ] as number,
                      )}
                    </span>
                    <span className="w-12 text-right font-mono text-zinc-300">
                      {value}%
                    </span>
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(value / maxAllocation) * 100}%`,
                      backgroundColor: ALLOCATION_COLORS[key] || "#6b7280",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-2">
          <h2 className="mb-4 text-lg font-semibold">연도별 자산 추이</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                  <th className="py-2 pr-3">연도</th>
                  <th className="py-2 pr-3 text-right">총자산</th>
                  {allocationEntries.map(([key]) => (
                    <th key={key} className="py-2 pr-3 text-right">
                      <span className="flex items-center justify-end gap-1">
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{
                            backgroundColor:
                              ALLOCATION_COLORS[key] || "#6b7280",
                          }}
                        />
                        {key}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {portfolio.history.map(
                  (row: Record<string, string | number>) => (
                    <tr
                      key={row.year}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                    >
                      <td className="py-2.5 pr-3 font-medium text-white">
                        {row.year}
                      </td>
                      <td className="py-2.5 pr-3 text-right font-mono text-zinc-300">
                        {formatTrilion(row.total as number)}
                      </td>
                      {allocationEntries.map(([key]) => (
                        <td
                          key={key}
                          className="py-2.5 pr-3 text-right font-mono text-zinc-400"
                        >
                          {formatTrilion((row[key] as number) || 0)}
                        </td>
                      ))}
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* 주식 보유 현황 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <HoldingsTable
          title="해외주식 Top 20"
          holdings={foreignStocks.top20}
          referenceDate={foreignStocks.referenceDate}
          totalCount={foreignStocks.totalCount}
        />
        <HoldingsTable
          title="국내주식 Top 20"
          holdings={domesticStocks.top20}
          referenceDate={domesticStocks.referenceDate}
          totalCount={domesticStocks.totalCount}
        />
      </div>
    </div>
  );
}
