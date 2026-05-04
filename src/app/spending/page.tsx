"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SpendingBarChart } from "@/components/spending/SpendingBarChart";
import { PCEChart } from "@/components/spending/PCEChart";
import { PARTY_COLORS } from "@/lib/data/spending/presidents";
import type {
  AnnualSpendingPoint,
  MonthlySpendingPoint,
} from "@/types/spending";

const PARTY_BAR_COLOR: Record<string, string> = {
  민주: "#3b82f6",
  공화: "#f43f5e",
  기타: "#a1a1aa",
};

function formatT(v: number, digits = 2) {
  return `$${v.toFixed(digits)}T`;
}

function formatPct(v: number | null, digits = 1) {
  if (v === null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(digits)}%`;
}

function SpendingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fyParam = searchParams.get("fy");

  if (fyParam) {
    return (
      <MonthlyView
        fy={parseInt(fyParam, 10)}
        onBack={() => router.push("/spending")}
      />
    );
  }

  return <AnnualView onSelectYear={(fy) => router.push(`/spending?fy=${fy}`)} />;
}

function AnnualView({ onSelectYear }: { onSelectYear: (fy: number) => void }) {
  const [data, setData] = useState<AnnualSpendingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [yearRange, setYearRange] = useState<"30Y" | "50Y" | "All">("30Y");

  useEffect(() => {
    fetch("/api/spending/annual")
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((j) => setData(j.data ?? []))
      .catch(() => setError("데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (data.length === 0) return [];
    const now = new Date().getUTCFullYear();
    const cutoff =
      yearRange === "30Y"
        ? now - 30
        : yearRange === "50Y"
          ? now - 50
          : 0;
    return data.filter((d) => d.fiscalYear >= cutoff);
  }, [data, yearRange]);

  const chartData = useMemo(() => {
    return [...filtered]
      .reverse() // 오래된 → 최신
      .map((d) => ({
        label: String(d.fiscalYear),
        value: d.outlaysT,
        key: d.fiscalYear,
        color: d.party ? PARTY_BAR_COLOR[d.party] : "#a1a1aa",
      }));
  }, [filtered]);

  const latest = data[0];
  const peakOutlays = data[0]
    ? Math.max(...data.map((d) => d.outlaysT))
    : 0;
  const peakOutlaysFY = data.find((d) => d.outlaysT === peakOutlays);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">미국 정부 지출 (회계연도)</h1>
        <p className="mt-1 text-sm text-zinc-500">
          미 연방정부 순지출 (FRED FYONET) · 회계연도 10/1 ~ 9/30 · 막대 클릭 시
          해당 연도 월별 지출
        </p>
      </div>

      {/* KPI 카드 */}
      {latest && (
        <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCard
            label={`최신 (FY${latest.fiscalYear})`}
            value={formatT(latest.outlaysT)}
            sub={
              latest.yoyChangePct !== null
                ? `YoY ${formatPct(latest.yoyChangePct)}`
                : undefined
            }
          />
          <KpiCard
            label="GDP 대비 부채"
            value={
              latest.debtToGdpPct !== null
                ? `${latest.debtToGdpPct.toFixed(1)}%`
                : "—"
            }
            sub={`FY${latest.fiscalYear} 종료 시점`}
          />
          <KpiCard
            label="역대 최고"
            value={peakOutlaysFY ? formatT(peakOutlaysFY.outlaysT) : "—"}
            sub={peakOutlaysFY ? `FY${peakOutlaysFY.fiscalYear}` : undefined}
          />
          <KpiCard
            label="집권 대통령"
            value={latest.president ?? "—"}
            sub={latest.party ? `${latest.party}당` : undefined}
            partyClass={latest.party ? PARTY_COLORS[latest.party] : undefined}
          />
        </div>
      )}

      {/* 차트 */}
      <section className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              연도별 정부 지출
            </div>
            <div className="mt-0.5 text-[11px] text-zinc-500">
              민주(파랑) · 공화(빨강) · 막대 클릭 → 월별 드릴다운
            </div>
          </div>
          <div className="flex gap-1">
            {(["30Y", "50Y", "All"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setYearRange(r)}
                className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                  yearRange === r
                    ? "bg-white/[0.1] text-white"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                }`}
              >
                {r === "All" ? "전체" : r}
              </button>
            ))}
          </div>
        </div>
        {loading && (
          <div className="flex h-[240px] items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
          </div>
        )}
        {error && (
          <div className="flex h-[240px] items-center justify-center text-sm text-zinc-500">
            {error}
          </div>
        )}
        {!loading && !error && (
          <SpendingBarChart
            data={chartData}
            yLabel="조 USD"
            formatValue={(v) => `$${v.toFixed(1)}T`}
            onBarClick={(key) => onSelectYear(Number(key))}
          />
        )}
      </section>

      {/* 표 */}
      <section className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
        <div className="border-b border-white/[0.06] px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
          분석 표 ({filtered.length}개 회계연도)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
              <tr className="border-b border-white/[0.04]">
                <th className="px-4 py-2 text-left">FY</th>
                <th className="px-4 py-2 text-right">정부 지출</th>
                <th className="px-4 py-2 text-right">YoY</th>
                <th className="px-4 py-2 text-right">PCE 소비</th>
                <th className="px-4 py-2 text-right">소비 대비 지출</th>
                <th className="px-4 py-2 text-right">GDP 대비 부채</th>
                <th className="px-4 py-2 text-left">집권 대통령</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((d) => (
                <tr
                  key={d.fiscalYear}
                  onClick={() => onSelectYear(d.fiscalYear)}
                  className="cursor-pointer border-b border-white/[0.04] transition-colors hover:bg-white/[0.04]"
                >
                  <td className="px-4 py-2 font-mono font-medium">
                    {d.fiscalYear}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-100">
                    {formatT(d.outlaysT)}
                  </td>
                  <td
                    className={`px-4 py-2 text-right tabular-nums text-xs ${
                      d.yoyChangePct === null
                        ? "text-zinc-600"
                        : d.yoyChangePct > 0
                          ? "text-rose-300"
                          : "text-emerald-300"
                    }`}
                  >
                    {formatPct(d.yoyChangePct)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                    {d.pceT !== null ? formatT(d.pceT) : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                    {d.outlaysToPcePct !== null
                      ? `${d.outlaysToPcePct.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                    {d.debtToGdpPct !== null
                      ? `${d.debtToGdpPct.toFixed(1)}%`
                      : "—"}
                  </td>
                  <td className="px-4 py-2">
                    {d.president && d.party ? (
                      <span
                        className={`inline-block rounded-full border px-2 py-0.5 text-[11px] ${PARTY_COLORS[d.party]}`}
                      >
                        {d.president}
                      </span>
                    ) : (
                      <span className="text-zinc-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right text-zinc-600">
                    <svg
                      className="ml-auto h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* PCE 월별 차트 */}
      <div className="mt-5">
        <PCEChart />
      </div>

      <UpdateInfo />
    </div>
  );
}

function UpdateInfo() {
  return (
    <details className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] text-xs">
      <summary className="cursor-pointer px-4 py-3 text-[11px] font-medium uppercase tracking-wider text-zinc-400 hover:text-zinc-200">
        데이터 출처와 업데이트 일정
      </summary>
      <div className="space-y-3 border-t border-white/[0.04] px-4 py-3 leading-relaxed text-zinc-400">
        <p>
          모든 데이터는 페이지 접속 시 외부 API에서 라이브 fetch되며 24시간
          캐시됩니다. 별도로 업데이트 작업할 필요는 없고, 원본 기관이 새 데이터를
          내놓으면 24시간 안에 자동으로 반영됩니다.
        </p>
        <table className="w-full text-[11px]">
          <thead className="text-zinc-500">
            <tr className="border-b border-white/[0.04]">
              <th className="py-2 pr-4 text-left">데이터</th>
              <th className="py-2 pr-4 text-left">출처</th>
              <th className="py-2 text-left">발표 시점</th>
            </tr>
          </thead>
          <tbody className="text-zinc-400">
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4 text-zinc-300">정부 지출 (연간)</td>
              <td className="py-2 pr-4">
                FRED <code className="text-emerald-300">FYONET</code>
              </td>
              <td className="py-2">FY 종료 후 10월 (전년 FY 확정치)</td>
            </tr>
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4 text-zinc-300">정부 지출 (월별)</td>
              <td className="py-2 pr-4">U.S. Treasury MTS API</td>
              <td className="py-2">매월 12일경 (전월)</td>
            </tr>
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4 text-zinc-300">PCE 소비 (연간)</td>
              <td className="py-2 pr-4">
                FRED <code className="text-emerald-300">PCECA</code>
              </td>
              <td className="py-2">매년 1분기 (전년 확정)</td>
            </tr>
            <tr className="border-b border-white/[0.04]">
              <td className="py-2 pr-4 text-zinc-300">PCE 소비 (월별)</td>
              <td className="py-2 pr-4">
                FRED <code className="text-emerald-300">PCE</code>
              </td>
              <td className="py-2">매월 4번째 금요일경 (전월)</td>
            </tr>
            <tr>
              <td className="py-2 pr-4 text-zinc-300">GDP 대비 부채</td>
              <td className="py-2 pr-4">
                FRED <code className="text-emerald-300">GFDEGDQ188S</code>
              </td>
              <td className="py-2">분기 종료 후 약 6주</td>
            </tr>
          </tbody>
        </table>
        <p className="text-zinc-500">
          회계연도(FY)는 전년 10/1 ~ 당해 9/30. PCE는 캘린더 연도 기준이라
          FY와 정확히 일치하지 않지만, 분석상 같은 라벨(년도) 옆에 표기.
          대통령은 FY 종료(9/30) 시점 기준.
        </p>
      </div>
    </details>
  );
}

function MonthlyView({ fy, onBack }: { fy: number; onBack: () => void }) {
  const [data, setData] = useState<MonthlySpendingPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/spending/monthly?fy=${fy}`)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((j) => setData(j.data ?? []))
      .catch(() => setError("월별 데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [fy]);

  const totalOutlays = data.reduce((sum, d) => sum + d.outlaysT, 0);
  const totalReceipts = data.reduce((sum, d) => sum + d.receiptsT, 0);
  const totalDeficit = totalOutlays - totalReceipts;

  const chartData = data.map((d) => ({
    label: d.monthLabel,
    value: d.outlaysT,
    key: d.month,
    color: "#22d3ee",
  }));

  return (
    <div>
      <button
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
      >
        <svg
          className="h-3.5 w-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        목록으로
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-semibold">FY{fy} 월별 정부 지출</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {fy - 1}년 10월 ~ {fy}년 9월 · U.S. Treasury Monthly Treasury
          Statement
        </p>
      </div>

      {!loading && !error && data.length > 0 && (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            <KpiCard label="연 지출" value={formatT(totalOutlays)} />
            <KpiCard label="연 수입" value={formatT(totalReceipts)} />
            <KpiCard
              label="연 적자"
              value={formatT(totalDeficit)}
              partyClass={
                totalDeficit > 0
                  ? "border-rose-400/30 bg-rose-400/[0.06] text-rose-300"
                  : "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300"
              }
            />
          </div>

          <section className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <div className="mb-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              월별 지출 (회계연도 순서)
            </div>
            <SpendingBarChart
              data={chartData}
              height={220}
              yLabel="조 USD"
              formatValue={(v) => `$${v.toFixed(2)}T`}
            />
          </section>

          <section className="rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="border-b border-white/[0.06] px-4 py-3 text-xs font-medium uppercase tracking-wider text-zinc-400">
              월별 명세
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase tracking-wider text-zinc-500">
                  <tr className="border-b border-white/[0.04]">
                    <th className="px-4 py-2 text-left">월</th>
                    <th className="px-4 py-2 text-right">지출</th>
                    <th className="px-4 py-2 text-right">수입</th>
                    <th className="px-4 py-2 text-right">월 수지</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((d) => (
                    <tr
                      key={d.month}
                      className="border-b border-white/[0.04]"
                    >
                      <td className="px-4 py-2 font-mono">
                        {d.monthLabel}{" "}
                        <span className="text-[11px] text-zinc-600">
                          ({d.month})
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums">
                        {formatT(d.outlaysT, 3)}
                      </td>
                      <td className="px-4 py-2 text-right tabular-nums text-zinc-300">
                        {formatT(d.receiptsT, 3)}
                      </td>
                      <td
                        className={`px-4 py-2 text-right tabular-nums ${
                          d.deficitT > 0
                            ? "text-rose-300"
                            : "text-emerald-300"
                        }`}
                      >
                        {d.deficitT > 0 ? "-" : "+"}
                        {formatT(Math.abs(d.deficitT), 3)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm text-zinc-500">
          {error}. 1980년 이전 회계연도는 월별 데이터가 제공되지 않습니다.
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  partyClass,
}: {
  label: string;
  value: string;
  sub?: string;
  partyClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="text-[11px] font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        {partyClass ? (
          <span
            className={`rounded-full border px-2 py-0.5 text-sm ${partyClass}`}
          >
            {value}
          </span>
        ) : (
          <span className="text-lg font-semibold text-white">{value}</span>
        )}
      </div>
      {sub && <div className="mt-0.5 text-[11px] text-zinc-500">{sub}</div>}
    </div>
  );
}

export default function SpendingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      }
    >
      <SpendingContent />
    </Suspense>
  );
}
