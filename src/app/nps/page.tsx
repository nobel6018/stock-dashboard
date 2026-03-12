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

const FOREIGN_SECTOR_COLORS: Record<string, string> = {
  IT: "#60a5fa",
  Communication: "#a78bfa",
  Consumer: "#f97316",
  ETF: "#6b7280",
  Finance: "#fbbf24",
  Healthcare: "#34d399",
  Energy: "#f472b6",
  기타: "#374151",
};

const DOMESTIC_SECTOR_COLORS: Record<string, string> = {
  IT: "#60a5fa",
  금융: "#fbbf24",
  자동차: "#f97316",
  바이오: "#34d399",
  "2차전지": "#a78bfa",
  조선: "#22d3ee",
  소재: "#fb923c",
  건설: "#e879f9",
  화학: "#4ade80",
  기타: "#374151",
};

const MATURITY_COLORS: Record<string, string> = {
  단기: "#34d399",
  중기: "#fbbf24",
  장기: "#f472b6",
};

const COUNTRY_FLAG: Record<string, string> = {
  미국: "🇺🇸",
  일본: "🇯🇵",
  중국: "🇨🇳",
  영국: "🇬🇧",
  프랑스: "🇫🇷",
  스페인: "🇪🇸",
  이탈리아: "🇮🇹",
  독일: "🇩🇪",
  캐나다: "🇨🇦",
  호주: "🇦🇺",
  네덜란드: "🇳🇱",
  벨기에: "🇧🇪",
  오스트리아: "🇦🇹",
  스웨덴: "🇸🇪",
  덴마크: "🇩🇰",
  노르웨이: "🇳🇴",
  싱가포르: "🇸🇬",
  한국: "🇰🇷",
  기타: "🌐",
};

function formatTrilion(billion: number): string {
  return `${(billion / 10000).toFixed(1)}조`;
}

function formatValueBillion(v: number): string {
  if (v >= 10000) return `${(v / 10000).toFixed(1)}조`;
  return `${v.toLocaleString()}억`;
}

type StockHolding = {
  rank: number;
  name: string;
  sector?: string;
  valueBillion: number;
  weight: number;
  ownershipPct: number;
};

type BondHolding = {
  rank: number;
  name: string;
  valueBillion: number;
  weight: number;
  type?: string;
  country?: string;
  maturityClass?: string;
  rate?: string;
};

type SectorEntry = {
  sector: string;
  valueBillion: number;
  pct: number;
};

function SectorBreakdown({
  breakdown,
  colorMap,
  title,
}: {
  breakdown: SectorEntry[];
  colorMap: Record<string, string>;
  title: string;
}) {
  const max = Math.max(...breakdown.map((s) => s.pct));
  return (
    <div className="mt-4 rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
      <h3 className="mb-3 text-sm font-medium text-zinc-400">{title}</h3>
      <div className="space-y-2">
        {breakdown.map((s) => (
          <div key={s.sector}>
            <div className="mb-1 flex items-center justify-between text-xs">
              <span
                className="flex items-center gap-1.5 font-medium"
                style={{ color: colorMap[s.sector] || "#6b7280" }}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{
                    backgroundColor: colorMap[s.sector] || "#6b7280",
                  }}
                />
                {s.sector}
              </span>
              <span className="text-zinc-400">
                {formatValueBillion(s.valueBillion)}{" "}
                <span className="font-mono text-zinc-500">{s.pct}%</span>
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(s.pct / max) * 100}%`,
                  backgroundColor: colorMap[s.sector] || "#6b7280",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StockTable({
  title,
  holdings,
  referenceDate,
  totalCount,
  sectorBreakdown,
  sectorColorMap,
}: {
  title: string;
  holdings: StockHolding[];
  referenceDate: string;
  totalCount: number;
  sectorBreakdown?: SectorEntry[];
  sectorColorMap?: Record<string, string>;
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
                <td className="py-2.5 pr-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="font-medium text-white">{h.name}</span>
                    {h.sector && (
                      <span
                        className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                        style={{
                          backgroundColor: `${sectorColorMap?.[h.sector] || "#6b7280"}22`,
                          color: sectorColorMap?.[h.sector] || "#9ca3af",
                        }}
                      >
                        {h.sector}
                      </span>
                    )}
                  </div>
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
      {sectorBreakdown && sectorColorMap && (
        <SectorBreakdown
          breakdown={sectorBreakdown}
          colorMap={sectorColorMap}
          title="전체 보유 섹터 비중"
        />
      )}
    </section>
  );
}

function BondTable({
  title,
  holdings,
  referenceDate,
  totalCount,
  nameLabel,
  countLabel,
  showEnriched,
}: {
  title: string;
  holdings: BondHolding[];
  referenceDate: string;
  totalCount: number;
  nameLabel: string;
  countLabel: string;
  showEnriched?: boolean;
}) {
  return (
    <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        <span className="text-xs text-zinc-500">
          {referenceDate} · {totalCount.toLocaleString()}개 {countLabel}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
              <th className="py-2 pr-3">#</th>
              <th className="py-2 pr-3">{nameLabel}</th>
              {showEnriched && <th className="py-2 pr-3">국가 / 만기</th>}
              <th className="py-2 pr-3 text-right">평가액</th>
              <th className="py-2 text-right">비중</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => (
              <tr
                key={h.rank}
                className="border-b border-white/[0.03] hover:bg-white/[0.02]"
              >
                <td className="py-2.5 pr-3 text-zinc-600">{h.rank}</td>
                <td className="max-w-[220px] py-2.5 pr-3">
                  <div className="truncate font-medium text-white">
                    {h.name}
                  </div>
                  {showEnriched && h.rate && (
                    <div className="mt-0.5 font-mono text-[11px] text-zinc-500">
                      {h.rate}
                    </div>
                  )}
                </td>
                {showEnriched && (
                  <td className="py-2.5 pr-3">
                    <div className="flex flex-wrap gap-1">
                      {h.country && (
                        <span className="rounded bg-white/[0.05] px-1.5 py-0.5 text-[10px] text-zinc-300">
                          {COUNTRY_FLAG[h.country] || ""} {h.country}
                        </span>
                      )}
                      {h.maturityClass && (
                        <span
                          className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                          style={{
                            backgroundColor: `${MATURITY_COLORS[h.maturityClass] || "#6b7280"}22`,
                            color:
                              MATURITY_COLORS[h.maturityClass] || "#9ca3af",
                          }}
                        >
                          {h.maturityClass}
                        </span>
                      )}
                    </div>
                  </td>
                )}
                <td className="py-2.5 pr-3 text-right font-mono text-zinc-300">
                  {formatValueBillion(h.valueBillion)}
                </td>
                <td className="py-2.5 text-right font-mono text-zinc-300">
                  {h.weight}%
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
  const {
    portfolio,
    foreignStocks,
    domesticStocks,
    foreignBonds,
    domesticBonds,
  } = npsData;
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
          {formatTrilion(portfolio.totalBillion)} · 보유현황:{" "}
          {foreignStocks.referenceDate} 기준 · 출처: {npsData.source}
        </p>
      </div>

      {/* 자산배분 + 연도별 추이 */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 lg:col-span-1">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">자산배분 현황</h2>
            <span className="text-xs text-zinc-500">
              {portfolio.referenceDate} 기준
            </span>
          </div>
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
          <h2 className="mb-4 text-lg font-semibold">자산 추이</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-xs text-zinc-500">
                  <th className="py-2 pr-3">기준</th>
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
                      key={row.label}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02]"
                    >
                      <td className="py-2.5 pr-3 font-medium text-white">
                        {row.label}
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
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <StockTable
          title="해외주식 Top 20"
          holdings={foreignStocks.top20}
          referenceDate={foreignStocks.referenceDate}
          totalCount={foreignStocks.totalCount}
          sectorBreakdown={
            (foreignStocks as { sectorBreakdown?: SectorEntry[] })
              .sectorBreakdown
          }
          sectorColorMap={FOREIGN_SECTOR_COLORS}
        />
        <StockTable
          title="국내주식 Top 20"
          holdings={domesticStocks.top20}
          referenceDate={domesticStocks.referenceDate}
          totalCount={domesticStocks.totalCount}
          sectorBreakdown={
            (domesticStocks as { sectorBreakdown?: SectorEntry[] })
              .sectorBreakdown
          }
          sectorColorMap={DOMESTIC_SECTOR_COLORS}
        />
      </div>

      {/* 채권 보유 현황 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <BondTable
          title="해외채권 Top 20"
          holdings={foreignBonds.top20}
          referenceDate={foreignBonds.referenceDate}
          totalCount={foreignBonds.totalCount}
          nameLabel="종목"
          countLabel="종목"
          showEnriched
        />
        <BondTable
          title="국내채권 Top 20"
          holdings={domesticBonds.top20}
          referenceDate={domesticBonds.referenceDate}
          totalCount={domesticBonds.totalCount}
          nameLabel="발행기관"
          countLabel="발행기관"
        />
      </div>
    </div>
  );
}
