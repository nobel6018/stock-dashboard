import { TimeSeriesPoint } from "./macro";

// ── Holdings ──────────────────────────────────────────

export interface Holding {
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  leverageMultiplier: number;
}

export const DEFAULT_HOLDINGS: Holding[] = [
  { symbol: "QQQ", name: "QQQ (1x)", shares: 0, avgCost: 0, leverageMultiplier: 1 },
  { symbol: "QLD", name: "QLD (2x)", shares: 0, avgCost: 0, leverageMultiplier: 2 },
  { symbol: "TQQQ", name: "TQQQ (3x)", shares: 0, avgCost: 0, leverageMultiplier: 3 },
];

// ── Signals ───────────────────────────────────────────

export type SignalLevel = "buy_strong" | "buy" | "hold" | "sell";

export interface SignalThreshold {
  /** 이 값 이상이면 sell (위험) */
  sell: number;
  /** 이 값 이상이면 hold (경계) */
  hold: number;
  /** 이 값 이하이면 buy (매수 가능) */
  buy: number;
  /** 이 값 이하이면 buy_strong (적극 매수) */
  buyStrong: number;
}

export const SIGNAL_THRESHOLDS: Record<string, SignalThreshold> = {
  wti: { sell: 120, hold: 90, buy: 90, buyStrong: 75 },
  treasury10y: { sell: 5.0, hold: 4.0, buy: 4.0, buyStrong: 3.5 },
  vix: { sell: 30, hold: 20, buy: 20, buyStrong: 15 },
};

export const SIGNAL_LEVEL_CONFIG: Record<SignalLevel, {
  label: string;
  color: string;
  bg: string;
}> = {
  sell: { label: "매도", color: "text-red-400", bg: "bg-red-400/10" },
  hold: { label: "경계", color: "text-amber-400", bg: "bg-amber-400/10" },
  buy: { label: "매수 가능", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  buy_strong: { label: "적극 매수", color: "text-emerald-300", bg: "bg-emerald-300/10" },
};

export interface SignalData {
  id: string;
  name: string;
  value: number | null;
  level: SignalLevel;
  history: TimeSeriesPoint[];
  color: string;
}

// ── Market Regime ─────────────────────────────────────

export type MarketRegime = "aggressive" | "normal" | "caution" | "defensive" | "crisis";

export interface TargetAllocation {
  symbol: string;
  name: string;
  targetWeight: number;
}

export interface RegimeConfig {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
  targets: TargetAllocation[];
}

export const REGIME_CONFIG: Record<MarketRegime, RegimeConfig> = {
  aggressive: {
    label: "공격",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    description: "모든 신호 안정. 레버리지 적극 활용 가능.",
    targets: [
      { symbol: "QQQ", name: "QQQ", targetWeight: 35 },
      { symbol: "QLD", name: "QLD (2x)", targetWeight: 30 },
      { symbol: "TQQQ", name: "TQQQ (3x)", targetWeight: 25 },
      { symbol: "CASH", name: "현금/MMF", targetWeight: 10 },
    ],
  },
  normal: {
    label: "정상",
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    border: "border-blue-400/20",
    description: "대부분 안정. 레버리지 소량 유지.",
    targets: [
      { symbol: "QQQ", name: "QQQ", targetWeight: 50 },
      { symbol: "QLD", name: "QLD (2x)", targetWeight: 20 },
      { symbol: "TQQQ", name: "TQQQ (3x)", targetWeight: 10 },
      { symbol: "CASH", name: "현금/MMF", targetWeight: 20 },
    ],
  },
  caution: {
    label: "경계",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    description: "경고 신호 감지. TQQQ 전량 매도, QLD 대폭 축소.",
    targets: [
      { symbol: "QQQ", name: "QQQ", targetWeight: 40 },
      { symbol: "QLD", name: "QLD (2x)", targetWeight: 10 },
      { symbol: "TQQQ", name: "TQQQ (3x)", targetWeight: 0 },
      { symbol: "CASH", name: "현금/MMF", targetWeight: 35 },
      { symbol: "GLD", name: "금 (GLD)", targetWeight: 10 },
      { symbol: "SHY", name: "단기채 (SHY)", targetWeight: 5 },
    ],
  },
  defensive: {
    label: "방어",
    color: "text-orange-400",
    bg: "bg-orange-400/10",
    border: "border-orange-400/20",
    description: "위험 신호 발생. 레버리지 전량 매도.",
    targets: [
      { symbol: "QQQ", name: "QQQ", targetWeight: 30 },
      { symbol: "QLD", name: "QLD (2x)", targetWeight: 0 },
      { symbol: "TQQQ", name: "TQQQ (3x)", targetWeight: 0 },
      { symbol: "CASH", name: "현금/MMF", targetWeight: 45 },
      { symbol: "GLD", name: "금 (GLD)", targetWeight: 15 },
      { symbol: "SHY", name: "단기채 (SHY)", targetWeight: 10 },
    ],
  },
  crisis: {
    label: "위기",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    description: "복수 위험 신호. 최대 방어 + 바닥 매수 대기.",
    targets: [
      { symbol: "QQQ", name: "QQQ", targetWeight: 20 },
      { symbol: "QLD", name: "QLD (2x)", targetWeight: 0 },
      { symbol: "TQQQ", name: "TQQQ (3x)", targetWeight: 0 },
      { symbol: "CASH", name: "현금/MMF", targetWeight: 50 },
      { symbol: "GLD", name: "금 (GLD)", targetWeight: 15 },
      { symbol: "SHY", name: "단기채 (SHY)", targetWeight: 15 },
    ],
  },
};

// ── Reentry Phases ────────────────────────────────────

export interface ReentryCondition {
  label: string;
  met: boolean;
  detail: string;
}

export interface ReentryPhase {
  phase: number;
  title: string;
  target: string;
  conditions: ReentryCondition[];
  allMet: boolean;
}

// ── API Response ──────────────────────────────────────

export interface PortfolioSignalsResponse {
  signals: {
    wti: { current: number | null; history: TimeSeriesPoint[] };
    treasury10y: { current: number | null; history: TimeSeriesPoint[] };
    vix: { current: number | null; avg5: number | null; history: TimeSeriesPoint[] };
  };
  etfPrices: Record<string, { price: number; changePercent: number }>;
  nasdaq: {
    current: number | null;
    ma200: number | null;
    low52w: number | null;
    high52w: number | null;
  };
  fedRate: {
    current: number | null;
    threeMonthsAgo: number | null;
    sixMonthsAgo: number | null;
  };
}
