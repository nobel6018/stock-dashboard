"use client";

import { useCallback, useEffect, useState } from "react";
import type { CrisisSignal } from "@/app/api/crisis/route";
import { MacroChart } from "@/components/charts/MacroChart";
import { ChartSyncProvider } from "@/components/charts/ChartSyncContext";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface CrisisData {
  crisisScore: number;
  overallLevel: "low" | "moderate" | "high" | "critical";
  overallLabel: string;
  dangerCount: number;
  warningCount: number;
  safeCount: number;
  signals: CrisisSignal[];
  fearGreedScore: number | null;
  fearGreedRating: string | null;
}

const LEVEL_CONFIG = {
  low: { color: "text-emerald-400", bg: "bg-emerald-400", ring: "ring-emerald-400/20", barColor: "bg-emerald-400" },
  moderate: { color: "text-amber-400", bg: "bg-amber-400", ring: "ring-amber-400/20", barColor: "bg-amber-400" },
  high: { color: "text-orange-400", bg: "bg-orange-400", ring: "ring-orange-400/20", barColor: "bg-orange-400" },
  critical: { color: "text-red-400", bg: "bg-red-400", ring: "ring-red-400/20", barColor: "bg-red-400" },
};

const STATUS_CONFIG = {
  safe: { icon: "\u2713", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
  warning: { icon: "!", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
  danger: { icon: "\u2717", color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20" },
};

export default function CrisisPage() {
  const [data, setData] = useState<CrisisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/crisis");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch {
      setError("위기 신호 데이터를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
          <p className="text-sm text-zinc-500">위기 신호 분석 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-zinc-500">{error}</p>
      </div>
    );
  }

  const levelCfg = LEVEL_CONFIG[data.overallLevel];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">위기 신호 체크리스트</h1>
        <p className="mt-1 text-sm text-zinc-500">
          금융위기 선행지표 6가지를 실시간 모니터링합니다
        </p>
      </div>

      {/* Overall Crisis Gauge */}
      <section className="mb-8">
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            {/* Score */}
            <div className="flex items-center gap-6">
              <div className={`flex h-24 w-24 flex-col items-center justify-center rounded-full ring-4 ${levelCfg.ring}`}>
                <span className={`text-3xl font-bold ${levelCfg.color}`}>
                  {data.crisisScore}
                </span>
                <span className="text-[10px] text-zinc-500">/ 100</span>
              </div>
              <div>
                <div className={`text-lg font-semibold ${levelCfg.color}`}>
                  {data.overallLabel}
                </div>
                <p className="mt-1 text-sm text-zinc-400">
                  종합 위기 점수
                  <InfoTooltip text="각 신호의 상태(위험=2점, 경계=1점, 안정=0점)를 합산하여 100점 만점으로 환산합니다." />
                </p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex-1 lg:max-w-md">
              <div className="mb-2 flex justify-between text-xs text-zinc-500">
                <span>안정</span>
                <span>경계</span>
                <span>위험</span>
                <span>위기</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${levelCfg.barColor}`}
                  style={{ width: `${Math.max(data.crisisScore, 3)}%` }}
                />
              </div>
              <div className="mt-3 flex gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
                  위험 {data.dangerCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
                  경계 {data.warningCount}
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
                  안정 {data.safeCount}
                </span>
              </div>
            </div>

            {/* Fear & Greed */}
            {data.fearGreedScore !== null && (
              <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] px-5 py-3 text-center">
                <div className="text-xs text-zinc-500">Fear & Greed</div>
                <div className={`text-2xl font-bold ${
                  data.fearGreedScore <= 25
                    ? "text-red-400"
                    : data.fearGreedScore <= 45
                      ? "text-orange-400"
                      : data.fearGreedScore <= 55
                        ? "text-zinc-300"
                        : data.fearGreedScore <= 75
                          ? "text-emerald-300"
                          : "text-emerald-400"
                }`}>
                  {data.fearGreedScore}
                </div>
                <div className="text-[10px] text-zinc-500">{data.fearGreedRating}</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Individual Signals */}
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          개별 신호
        </h2>
        <ChartSyncProvider>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.signals.map((signal) => (
              <SignalCard key={signal.id} signal={signal} />
            ))}
          </div>
        </ChartSyncProvider>
      </section>

      {/* Strategy Guide */}
      <section className="mt-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          위기 레벨별 대응 전략
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StrategyCard
            level="안정 (0~19)"
            color="text-emerald-400"
            borderColor="border-emerald-400/20"
            items={["평소 포트폴리오 유지", "주식 비중 정상 운영", "리밸런싱 주기적 점검"]}
          />
          <StrategyCard
            level="경계 (20~39)"
            color="text-amber-400"
            borderColor="border-amber-400/20"
            items={["현금 비중 15~20% 확보", "하이일드 채권 축소", "방어주/금 ETF 비중 확대"]}
          />
          <StrategyCard
            level="위험 (40~69)"
            color="text-orange-400"
            borderColor="border-orange-400/20"
            items={["현금 비중 30~40%로 확대", "성장주 → 가치주 전환", "달러/국채/금 비중 확대"]}
          />
          <StrategyCard
            level="위기 임박 (70~100)"
            color="text-red-400"
            borderColor="border-red-400/20"
            items={["현금 확보 최우선", "저점 매수 대기 자금 확보", "패닉셀 절대 금지", "분할 매수 계획 수립"]}
          />
        </div>
      </section>
    </div>
  );
}

function SignalCard({ signal }: { signal: CrisisSignal }) {
  const cfg = STATUS_CONFIG[signal.status];

  return (
    <div className={`flex flex-col rounded-xl border ${cfg.border} bg-white/[0.02] p-4`}>
      {/* Header */}
      <div className="mb-3 flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${cfg.bg} ${cfg.color}`}>
              {cfg.icon}
            </span>
            <h3 className="text-sm font-medium text-zinc-300">
              {signal.name}
              <InfoTooltip text={signal.description} />
            </h3>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            {signal.currentValue !== null ? (
              <span className={`text-xl font-semibold ${cfg.color}`}>
                {signal.unit === "%" || signal.unit === "%p"
                  ? `${signal.currentValue.toFixed(2)}${signal.unit}`
                  : signal.currentValue.toFixed(1)}
              </span>
            ) : (
              <span className="text-xl text-zinc-600">--</span>
            )}
            <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${cfg.bg} ${cfg.color}`}>
              {signal.statusLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Detail text */}
      <p className="mb-3 text-xs leading-relaxed text-zinc-500">
        {signal.detail}
      </p>

      {/* Mini chart */}
      <div className="relative min-h-[160px]">
        {signal.history.length > 0 ? (
          <MacroChart data={signal.history} color={signal.color} height={160} />
        ) : (
          <div className="flex h-[160px] items-center justify-center text-xs text-zinc-600">
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}

function StrategyCard({
  level,
  color,
  borderColor,
  items,
}: {
  level: string;
  color: string;
  borderColor: string;
  items: string[];
}) {
  return (
    <div className={`rounded-xl border ${borderColor} bg-white/[0.02] p-4`}>
      <h3 className={`mb-3 text-sm font-semibold ${color}`}>{level}</h3>
      <ul className="space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-xs text-zinc-400">
            <span className={`mt-0.5 ${color}`}>&bull;</span>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
