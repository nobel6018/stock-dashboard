"use client";

import { useCallback, useEffect, useState } from "react";
import { MacroChart } from "@/components/charts/MacroChart";
import { ChartSyncProvider } from "@/components/charts/ChartSyncContext";
import { InfoTooltip } from "@/components/ui/InfoTooltip";
import type {
  Holding,
  MarketRegime,
  PortfolioSignalsResponse,
  ReentryPhase,
  SignalLevel,
  TargetAllocation,
} from "@/types/my-portfolio";
import {
  DEFAULT_HOLDINGS,
  REGIME_CONFIG,
  SIGNAL_THRESHOLDS,
  SIGNAL_LEVEL_CONFIG,
} from "@/types/my-portfolio";

const STORAGE_KEY = "my-portfolio-holdings";

// ── Signal Level 계산 ─────────────────────────────────

function getSignalLevel(id: string, value: number | null): SignalLevel {
  if (value === null) return "hold";
  const t = SIGNAL_THRESHOLDS[id];
  if (!t) return "hold";

  if (value >= t.sell) return "sell";
  if (value >= t.hold) return "hold";
  if (value <= t.buyStrong) return "buy_strong";
  return "buy";
}

// ── Market Regime 계산 ────────────────────────────────

function computeRegime(
  wtiLevel: SignalLevel,
  treasuryLevel: SignalLevel,
  vixLevel: SignalLevel,
): MarketRegime {
  const levels = [wtiLevel, treasuryLevel, vixLevel];
  const sellCount = levels.filter((l) => l === "sell").length;
  const holdCount = levels.filter((l) => l === "hold").length;
  const buyCount = levels.filter((l) => l === "buy" || l === "buy_strong").length;

  if (sellCount >= 2) return "crisis";
  if (sellCount >= 1) return "defensive";
  if (holdCount >= 2) return "caution";
  if (buyCount === 3) return "aggressive";
  return "normal";
}

// ── Reentry Phases 계산 ───────────────────────────────

function computeReentryPhases(
  data: PortfolioSignalsResponse,
): ReentryPhase[] {
  const { signals, nasdaq, fedRate } = data;

  // WTI 최근 10거래일 평균
  const wtiRecent10 = signals.wti.history.slice(-10);
  const wtiAvg10 =
    wtiRecent10.length > 0
      ? wtiRecent10.reduce((s, p) => s + p.value, 0) / wtiRecent10.length
      : null;
  const wtiBelow90 = wtiAvg10 !== null && wtiAvg10 < 90;

  const treasuryBelow45 =
    signals.treasury10y.current !== null && signals.treasury10y.current < 4.5;

  // 나스닥 저점 대비 회복률
  const nasdaqRecovery =
    nasdaq.current !== null && nasdaq.low52w !== null && nasdaq.low52w > 0
      ? ((nasdaq.current - nasdaq.low52w) / nasdaq.low52w) * 100
      : 0;
  const nasdaqRecovered20 = nasdaqRecovery >= 20;

  // 금리 인하 여부
  const rateCut1 =
    fedRate.current !== null &&
    fedRate.threeMonthsAgo !== null &&
    fedRate.current < fedRate.threeMonthsAgo;
  const rateCut2 =
    fedRate.current !== null &&
    fedRate.sixMonthsAgo !== null &&
    fedRate.sixMonthsAgo - fedRate.current >= 0.5;

  // VIX 안정
  const vixStable = signals.vix.avg5 !== null && signals.vix.avg5 < 20;

  // 나스닥 > 200DMA
  const aboveMa200 =
    nasdaq.current !== null &&
    nasdaq.ma200 !== null &&
    nasdaq.current > nasdaq.ma200;

  // WTI < $80
  const wtiBelow80 = signals.wti.current !== null && signals.wti.current < 80;

  const phase1Met = wtiBelow90 && treasuryBelow45;
  const phase2Met = phase1Met && nasdaqRecovered20 && rateCut1;
  const phase3Met = phase2Met && vixStable && aboveMa200 && wtiBelow80 && rateCut2;

  return [
    {
      phase: 1,
      title: "QQQ 분할 매수 재개",
      target: "QQQ",
      allMet: phase1Met,
      conditions: [
        {
          label: "WTI 10일 평균 < $90",
          met: wtiBelow90,
          detail: wtiAvg10 !== null ? `현재 $${wtiAvg10.toFixed(1)}` : "데이터 없음",
        },
        {
          label: "10년물 금리 < 4.5%",
          met: treasuryBelow45,
          detail:
            signals.treasury10y.current !== null
              ? `현재 ${signals.treasury10y.current.toFixed(2)}%`
              : "데이터 없음",
        },
      ],
    },
    {
      phase: 2,
      title: "QLD 소량 복귀",
      target: "QLD",
      allMet: phase2Met,
      conditions: [
        {
          label: "Phase 1 조건 충족",
          met: phase1Met,
          detail: phase1Met ? "충족" : "미충족",
        },
        {
          label: "나스닥 저점 대비 +20% 반등",
          met: nasdaqRecovered20,
          detail: `저점 대비 +${nasdaqRecovery.toFixed(1)}%`,
        },
        {
          label: "연준 금리 인하 시작",
          met: rateCut1,
          detail:
            fedRate.current !== null
              ? `현재 ${fedRate.current.toFixed(2)}%`
              : "데이터 없음",
        },
      ],
    },
    {
      phase: 3,
      title: "TQQQ 재진입",
      target: "TQQQ",
      allMet: phase3Met,
      conditions: [
        {
          label: "Phase 2 조건 충족",
          met: phase2Met,
          detail: phase2Met ? "충족" : "미충족",
        },
        {
          label: "VIX 5일 평균 < 20",
          met: vixStable,
          detail:
            signals.vix.avg5 !== null
              ? `현재 ${signals.vix.avg5.toFixed(1)}`
              : "데이터 없음",
        },
        {
          label: "나스닥 > 200일 이평선",
          met: aboveMa200,
          detail:
            nasdaq.current !== null && nasdaq.ma200 !== null
              ? `현재 ${nasdaq.current.toFixed(0)} / MA200 ${nasdaq.ma200.toFixed(0)}`
              : "데이터 없음",
        },
        {
          label: "WTI < $80",
          met: wtiBelow80,
          detail:
            signals.wti.current !== null
              ? `현재 $${signals.wti.current.toFixed(1)}`
              : "데이터 없음",
        },
        {
          label: "연준 금리 인하 2회 이상 (0.5%p+)",
          met: rateCut2,
          detail:
            fedRate.current !== null && fedRate.sixMonthsAgo !== null
              ? `6개월간 ${(fedRate.sixMonthsAgo - fedRate.current).toFixed(2)}%p 변동`
              : "데이터 없음",
        },
      ],
    },
  ];
}

// ── Page Component ────────────────────────────────────

export default function MyPortfolioPage() {
  const [holdings, setHoldings] = useState<Holding[]>(DEFAULT_HOLDINGS);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<PortfolioSignalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // localStorage에서 보유종목 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Holding[];
        // 기존 저장된 종목과 DEFAULT_HOLDINGS 병합
        const merged = DEFAULT_HOLDINGS.map((dh) => {
          const existing = parsed.find((p) => p.symbol === dh.symbol);
          return existing ? { ...dh, shares: existing.shares, avgCost: existing.avgCost } : dh;
        });
        setHoldings(merged);
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  const saveHoldings = (updated: Holding[]) => {
    setHoldings(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/my-portfolio/signals");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch {
      setError("신호 데이터를 불러올 수 없습니다");
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
          <p className="text-sm text-zinc-500">매크로 신호 분석 중...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-zinc-500">{error}</p>
          <button
            onClick={fetchData}
            className="mt-3 rounded-lg bg-white/[0.06] px-4 py-2 text-xs text-zinc-300 hover:bg-white/[0.1]"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 신호 레벨 계산
  const wtiLevel = getSignalLevel("wti", data.signals.wti.current);
  const treasuryLevel = getSignalLevel("treasury10y", data.signals.treasury10y.current);
  const vixLevel = getSignalLevel("vix", data.signals.vix.avg5);
  const regime = computeRegime(wtiLevel, treasuryLevel, vixLevel);
  const regimeCfg = REGIME_CONFIG[regime];
  const reentryPhases = computeReentryPhases(data);

  // 포트폴리오 가치 계산
  const holdingsWithValue = holdings.map((h) => {
    const priceData = data.etfPrices[h.symbol];
    const currentPrice = priceData?.price ?? 0;
    const changePercent = priceData?.changePercent ?? 0;
    const marketValue = h.shares * currentPrice;
    const costBasis = h.shares * h.avgCost;
    const pnl = marketValue - costBasis;
    const pnlPercent = costBasis > 0 ? (pnl / costBasis) * 100 : 0;
    return { ...h, currentPrice, changePercent, marketValue, costBasis, pnl, pnlPercent };
  });

  const totalValue = holdingsWithValue.reduce((s, h) => s + h.marketValue, 0);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-semibold">내 포트폴리오</h1>
        <p className="mt-1 text-sm text-zinc-500">
          매크로 신호 기반 레버리지 ETF 관리 시스템
        </p>
      </div>

      {/* Row 1: Regime + Portfolio Summary */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <RegimeCard regime={regime} config={regimeCfg} />
        <div className="lg:col-span-2">
          <PortfolioSummary
            holdings={holdingsWithValue}
            totalValue={totalValue}
            editing={editing}
            onToggleEdit={() => setEditing(!editing)}
            onSave={saveHoldings}
          />
        </div>
      </div>

      {/* Row 2: Signal Cards */}
      <section className="mb-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          매크로 3축 신호
        </h2>
        <ChartSyncProvider>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SignalCard
              name="WTI 유가"
              value={data.signals.wti.current}
              unit="$"
              level={wtiLevel}
              history={data.signals.wti.history}
              color="#fb923c"
              thresholdLines={[
                { value: 120, label: "$120 매도", color: "#ef4444" },
                { value: 90, label: "$90 경계", color: "#f59e0b" },
                { value: 75, label: "$75 적극매수", color: "#22c55e" },
              ]}
              tooltip="유가 $90+: 한국 무역수지 흔들림 / $120+: 적자 확정. 스태그플레이션 핵심 변수."
            />
            <SignalCard
              name="미국 10년물 금리"
              value={data.signals.treasury10y.current}
              unit="%"
              level={treasuryLevel}
              history={data.signals.treasury10y.history}
              color="#4ade80"
              thresholdLines={[
                { value: 5.0, label: "5.0% 매도", color: "#ef4444" },
                { value: 4.0, label: "4.0% 경계", color: "#f59e0b" },
                { value: 3.5, label: "3.5% 적극매수", color: "#22c55e" },
              ]}
              tooltip="빅테크 밸류에이션에 직접 영향. 5%+이면 데이터센터 투자 지연, 성장주 할인율 급등."
            />
            <SignalCard
              name="VIX 공포지수"
              value={data.signals.vix.current}
              unit=""
              level={vixLevel}
              history={data.signals.vix.history}
              color="#f87171"
              extra={
                data.signals.vix.avg5 !== null
                  ? `5일 평균: ${data.signals.vix.avg5.toFixed(1)}`
                  : undefined
              }
              thresholdLines={[
                { value: 30, label: "30 공포", color: "#ef4444" },
                { value: 20, label: "20 경계", color: "#f59e0b" },
              ]}
              tooltip="30+: 공포 구간. 40+ + 유가 안정 = 역설적 매수 시그널 (극단적 공포에서 바닥 형성)."
            />
          </div>
        </ChartSyncProvider>
      </section>

      {/* Row 3: Rebalance Recommendations */}
      <section className="mb-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          리밸런싱 권고
        </h2>
        <RebalanceTable
          holdings={holdingsWithValue}
          totalValue={totalValue}
          targets={regimeCfg.targets}
          regime={regime}
        />
      </section>

      {/* Row 4: Reentry Checklist */}
      <section className="mb-6">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          레버리지 재진입 조건
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {reentryPhases.map((phase) => (
            <ReentryCard key={phase.phase} phase={phase} />
          ))}
        </div>
      </section>

      {/* Row 5: Nasdaq Technical */}
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          나스닥 기술적 지표
        </h2>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <NasdaqStat
              label="현재가"
              value={data.nasdaq.current !== null ? data.nasdaq.current.toFixed(0) : "--"}
            />
            <NasdaqStat
              label="200일 이평선"
              value={data.nasdaq.ma200 !== null ? data.nasdaq.ma200.toFixed(0) : "--"}
              sub={
                data.nasdaq.current !== null && data.nasdaq.ma200 !== null
                  ? data.nasdaq.current > data.nasdaq.ma200
                    ? "상회 (상승 추세)"
                    : "하회 (하락 추세)"
                  : undefined
              }
              subColor={
                data.nasdaq.current !== null && data.nasdaq.ma200 !== null
                  ? data.nasdaq.current > data.nasdaq.ma200
                    ? "text-emerald-400"
                    : "text-red-400"
                  : undefined
              }
            />
            <NasdaqStat
              label="52주 최저"
              value={data.nasdaq.low52w !== null ? data.nasdaq.low52w.toFixed(0) : "--"}
              sub={
                data.nasdaq.current !== null && data.nasdaq.low52w !== null
                  ? `저점 대비 +${(((data.nasdaq.current - data.nasdaq.low52w) / data.nasdaq.low52w) * 100).toFixed(1)}%`
                  : undefined
              }
            />
            <NasdaqStat
              label="52주 최고"
              value={data.nasdaq.high52w !== null ? data.nasdaq.high52w.toFixed(0) : "--"}
              sub={
                data.nasdaq.current !== null && data.nasdaq.high52w !== null
                  ? `고점 대비 ${(((data.nasdaq.current - data.nasdaq.high52w) / data.nasdaq.high52w) * 100).toFixed(1)}%`
                  : undefined
              }
            />
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Regime Card ───────────────────────────────────────

function RegimeCard({
  regime,
  config,
}: {
  regime: MarketRegime;
  config: (typeof REGIME_CONFIG)[MarketRegime];
}) {
  const icons: Record<MarketRegime, string> = {
    aggressive: "🟢",
    normal: "🔵",
    caution: "🟡",
    defensive: "🟠",
    crisis: "🔴",
  };

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-6`}>
      <div className="mb-2 text-xs text-zinc-500">시장 레짐</div>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{icons[regime]}</span>
        <div>
          <div className={`text-2xl font-bold ${config.color}`}>{config.label}</div>
          <p className="mt-1 text-xs text-zinc-400">{config.description}</p>
        </div>
      </div>
    </div>
  );
}

// ── Portfolio Summary ─────────────────────────────────

interface HoldingWithValue extends Holding {
  currentPrice: number;
  changePercent: number;
  marketValue: number;
  costBasis: number;
  pnl: number;
  pnlPercent: number;
}

function PortfolioSummary({
  holdings,
  totalValue,
  editing,
  onToggleEdit,
  onSave,
}: {
  holdings: HoldingWithValue[];
  totalValue: number;
  editing: boolean;
  onToggleEdit: () => void;
  onSave: (h: Holding[]) => void;
}) {
  const [editState, setEditState] = useState<Holding[]>(holdings);

  useEffect(() => {
    setEditState(holdings);
  }, [holdings]);

  function handleSave() {
    onSave(editState);
    onToggleEdit();
  }

  const hasHoldings = holdings.some((h) => h.shares > 0);

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500">포트폴리오 현황</div>
          {hasHoldings && (
            <div className="mt-1 text-xl font-semibold text-white">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </div>
          )}
        </div>
        <button
          onClick={editing ? handleSave : onToggleEdit}
          className="rounded-lg bg-white/[0.06] px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/[0.1]"
        >
          {editing ? "저장" : "편집"}
        </button>
      </div>

      {!hasHoldings && !editing && (
        <p className="py-4 text-center text-sm text-zinc-500">
          보유종목을 입력해주세요 (편집 버튼 클릭)
        </p>
      )}

      <div className="space-y-2">
        {(editing ? editState : holdings).map((h, i) => {
          const hv = holdings.find((hh) => hh.symbol === h.symbol);
          const weight = totalValue > 0 && hv ? (hv.marketValue / totalValue) * 100 : 0;

          return (
            <div
              key={h.symbol}
              className="flex items-center gap-3 rounded-lg bg-white/[0.03] px-3 py-2"
            >
              {/* Symbol & Name */}
              <div className="w-24 shrink-0">
                <div className="text-sm font-medium text-zinc-200">{h.symbol}</div>
                <div className="text-[10px] text-zinc-500">{h.leverageMultiplier}x 레버리지</div>
              </div>

              {editing ? (
                /* Edit mode */
                <div className="flex flex-1 items-center gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500">수량</label>
                    <input
                      type="number"
                      value={editState[i].shares || ""}
                      onChange={(e) => {
                        const updated = [...editState];
                        updated[i] = { ...updated[i], shares: Number(e.target.value) || 0 };
                        setEditState(updated);
                      }}
                      className="block w-24 rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500">평균단가 ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editState[i].avgCost || ""}
                      onChange={(e) => {
                        const updated = [...editState];
                        updated[i] = { ...updated[i], avgCost: Number(e.target.value) || 0 };
                        setEditState(updated);
                      }}
                      className="block w-28 rounded border border-white/[0.1] bg-white/[0.04] px-2 py-1 text-sm text-white focus:border-blue-500 focus:outline-none"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              ) : (
                /* Display mode */
                <>
                  <div className="flex-1">
                    {h.shares > 0 ? (
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm text-zinc-200">
                          {h.shares}주 × ${hv?.currentPrice.toFixed(2)}
                        </span>
                        <span
                          className={`text-xs ${hv && hv.changePercent >= 0 ? "text-emerald-400" : "text-red-400"}`}
                        >
                          {hv && hv.changePercent >= 0 ? "+" : ""}
                          {hv?.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-zinc-600">미보유</span>
                    )}
                  </div>
                  <div className="w-20 text-right">
                    {h.shares > 0 && hv ? (
                      <>
                        <div className="text-sm text-zinc-200">
                          ${hv.marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        </div>
                        <div className="text-[10px] text-zinc-500">{weight.toFixed(1)}%</div>
                      </>
                    ) : null}
                  </div>
                  <div className="w-20 text-right">
                    {h.shares > 0 && hv && hv.costBasis > 0 ? (
                      <span
                        className={`text-xs ${hv.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}
                      >
                        {hv.pnl >= 0 ? "+" : ""}${hv.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                        <br />
                        ({hv.pnlPercent >= 0 ? "+" : ""}{hv.pnlPercent.toFixed(1)}%)
                      </span>
                    ) : null}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Signal Card ───────────────────────────────────────

function SignalCard({
  name,
  value,
  unit,
  level,
  history,
  color,
  extra,
  thresholdLines,
  tooltip,
}: {
  name: string;
  value: number | null;
  unit: string;
  level: SignalLevel;
  history: { time: string; value: number }[];
  color: string;
  extra?: string;
  thresholdLines: { value: number; label: string; color: string }[];
  tooltip: string;
}) {
  const levelCfg = SIGNAL_LEVEL_CONFIG[level];

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3">
        <h3 className="text-sm font-medium text-zinc-400">
          {name}
          <InfoTooltip text={tooltip} />
        </h3>
        <div className="mt-1 flex items-baseline gap-2">
          {value !== null ? (
            <span className="text-2xl font-semibold text-white">
              {unit === "$" ? "$" : ""}
              {value.toFixed(unit === "%" ? 2 : 1)}
              {unit === "%" ? "%" : ""}
            </span>
          ) : (
            <span className="text-2xl text-zinc-600">--</span>
          )}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${levelCfg.bg} ${levelCfg.color}`}
          >
            {levelCfg.label}
          </span>
        </div>
        {extra && <div className="mt-1 text-xs text-zinc-500">{extra}</div>}
      </div>

      {/* Threshold reference */}
      <div className="mb-3 flex flex-wrap gap-2">
        {thresholdLines.map((t) => (
          <span
            key={t.label}
            className="rounded-full px-2 py-0.5 text-[10px]"
            style={{ color: t.color, backgroundColor: `${t.color}15` }}
          >
            {t.label}
          </span>
        ))}
      </div>

      {/* Chart */}
      <div className="relative min-h-[160px]">
        {history.length > 0 ? (
          <MacroChart data={history} color={color} height={160} />
        ) : (
          <div className="flex h-[160px] items-center justify-center text-xs text-zinc-600">
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}

// ── Rebalance Table ───────────────────────────────────

function RebalanceTable({
  holdings,
  totalValue,
  targets,
  regime,
}: {
  holdings: HoldingWithValue[];
  totalValue: number;
  targets: TargetAllocation[];
  regime: MarketRegime;
}) {
  const regimeCfg = REGIME_CONFIG[regime];
  const hasHoldings = holdings.some((h) => h.shares > 0);

  if (!hasHoldings) {
    return (
      <div className={`rounded-xl border ${regimeCfg.border} bg-white/[0.02] p-6 text-center`}>
        <p className="text-sm text-zinc-500">
          보유종목을 먼저 입력하면 리밸런싱 권고를 표시합니다
        </p>
      </div>
    );
  }

  return (
    <div className={`rounded-xl border ${regimeCfg.border} bg-white/[0.02] p-4`}>
      <div className="mb-3 flex items-center gap-2">
        <span className={`text-sm font-medium ${regimeCfg.color}`}>
          {regimeCfg.label} 모드 목표 배분
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/[0.06] text-xs text-zinc-500">
              <th className="py-2 text-left font-medium">종목</th>
              <th className="py-2 text-right font-medium">현재 비중</th>
              <th className="py-2 text-center font-medium"></th>
              <th className="py-2 text-right font-medium">목표 비중</th>
              <th className="py-2 text-right font-medium">액션</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((target) => {
              const holding = holdings.find((h) => h.symbol === target.symbol);
              const currentWeight =
                totalValue > 0 && holding
                  ? (holding.marketValue / totalValue) * 100
                  : 0;
              const diff = target.targetWeight - currentWeight;

              let action = "유지";
              let actionColor = "text-zinc-400";
              if (diff < -5) {
                action = `−${Math.abs(diff).toFixed(0)}% 매도`;
                actionColor = "text-red-400";
              } else if (diff > 5) {
                action = `+${diff.toFixed(0)}% 매수`;
                actionColor = "text-emerald-400";
              }

              // CASH, GLD, SHY 등 미보유 자산은 "신규 편입"으로 표시
              if (!holding && target.targetWeight > 0) {
                action = `${target.targetWeight}% 편입`;
                actionColor = "text-blue-400";
              }

              return (
                <tr key={target.symbol} className="border-b border-white/[0.04]">
                  <td className="py-2 text-zinc-200">{target.name}</td>
                  <td className="py-2 text-right text-zinc-400">
                    {holding ? `${currentWeight.toFixed(1)}%` : "0%"}
                  </td>
                  <td className="py-2 text-center text-zinc-600">→</td>
                  <td className="py-2 text-right text-zinc-200">
                    {target.targetWeight}%
                  </td>
                  <td className={`py-2 text-right font-medium ${actionColor}`}>
                    {action}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Reentry Card ──────────────────────────────────────

function ReentryCard({ phase }: { phase: ReentryPhase }) {
  const metCount = phase.conditions.filter((c) => c.met).length;
  const totalCount = phase.conditions.length;
  const progress = (metCount / totalCount) * 100;

  const borderColor = phase.allMet
    ? "border-emerald-400/30"
    : metCount > 0
      ? "border-amber-400/20"
      : "border-white/[0.06]";

  return (
    <div className={`rounded-xl border ${borderColor} bg-white/[0.02] p-4`}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs text-zinc-500">Phase {phase.phase}</div>
          <h3 className="text-sm font-medium text-zinc-200">{phase.title}</h3>
        </div>
        {phase.allMet ? (
          <span className="rounded-full bg-emerald-400/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
            매수 가능
          </span>
        ) : (
          <span className="text-xs text-zinc-500">
            {metCount}/{totalCount}
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-500 ${phase.allMet ? "bg-emerald-400" : "bg-amber-400"}`}
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Conditions */}
      <div className="space-y-2">
        {phase.conditions.map((c) => (
          <div key={c.label} className="flex items-start gap-2">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] ${
                c.met
                  ? "bg-emerald-400/10 text-emerald-400"
                  : "bg-white/[0.04] text-zinc-600"
              }`}
            >
              {c.met ? "✓" : ""}
            </span>
            <div className="flex-1">
              <div className={`text-xs ${c.met ? "text-zinc-300" : "text-zinc-500"}`}>
                {c.label}
              </div>
              <div className="text-[10px] text-zinc-600">{c.detail}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Nasdaq Stat ───────────────────────────────────────

function NasdaqStat({
  label,
  value,
  sub,
  subColor,
}: {
  label: string;
  value: string;
  sub?: string;
  subColor?: string;
}) {
  return (
    <div>
      <div className="text-xs text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-white">{value}</div>
      {sub && (
        <div className={`mt-0.5 text-[10px] ${subColor ?? "text-zinc-500"}`}>{sub}</div>
      )}
    </div>
  );
}
