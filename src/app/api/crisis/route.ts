import { NextResponse } from "next/server";
import { fetchFredSeries } from "@/lib/api/fred";
import { fetchYahooMacroSeries } from "@/lib/api/yahoo";
import { fetchFearGreed } from "@/lib/api/feargreed";

export interface CrisisSignal {
  id: string;
  name: string;
  description: string;
  status: "safe" | "warning" | "danger";
  statusLabel: string;
  currentValue: number | null;
  unit: string;
  detail: string;
  history: { time: string; value: number }[];
  color: string;
}

function getStartDate(monthsAgo: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - monthsAgo);
  return d.toISOString().split("T")[0];
}

async function getYieldCurveSignal(): Promise<CrisisSignal> {
  const history = await fetchFredSeries("T10Y2Y", getStartDate(36));
  const current = history.length > 0 ? history[history.length - 1].value : null;

  let status: CrisisSignal["status"] = "safe";
  let statusLabel = "정상";
  let detail = "장단기 금리차가 양수로 정상 상태입니다.";

  if (current !== null) {
    if (current < 0) {
      status = "danger";
      statusLabel = "역전 중";
      detail = `10Y-2Y 스프레드가 ${current.toFixed(2)}%로 역전 상태입니다. 역사적으로 침체 선행지표입니다.`;
    } else if (current < 0.5) {
      status = "warning";
      statusLabel = "경계";
      detail = `스프레드가 ${current.toFixed(2)}%로 축소되어 있습니다. 역전 직후 해소 시점이 가장 위험합니다.`;
    } else {
      detail = `스프레드 ${current.toFixed(2)}%로 정상 범위입니다.`;
    }
  }

  return {
    id: "yield-curve",
    name: "장단기 금리 역전 (10Y-2Y)",
    description: "2년물 금리가 10년물보다 높으면 역전. 역사적으로 가장 정확한 침체 선행지표.",
    status,
    statusLabel,
    currentValue: current,
    unit: "%",
    detail,
    history,
    color: "#818cf8",
  };
}

async function getCreditSpreadSignal(): Promise<CrisisSignal> {
  const history = await fetchFredSeries("BAMLH0A0HYM2", getStartDate(36));
  const current = history.length > 0 ? history[history.length - 1].value : null;

  let status: CrisisSignal["status"] = "safe";
  let statusLabel = "정상";
  let detail = "하이일드 스프레드가 안정적입니다.";

  if (current !== null) {
    if (current >= 5) {
      status = "danger";
      statusLabel = "위험";
      detail = `하이일드 스프레드 ${current.toFixed(2)}%p — 신용시장 경색 신호입니다.`;
    } else if (current >= 4) {
      status = "warning";
      statusLabel = "경계";
      detail = `하이일드 스프레드 ${current.toFixed(2)}%p — 스트레스가 누적되고 있습니다.`;
    } else {
      detail = `하이일드 스프레드 ${current.toFixed(2)}%p로 안정적입니다.`;
    }
  }

  return {
    id: "credit-spread",
    name: "신용 스프레드 (하이일드 OAS)",
    description: "하이일드 채권과 국채의 금리 차이. 확대될수록 기업 부도 위험 인식 상승.",
    status,
    statusLabel,
    currentValue: current,
    unit: "%p",
    detail,
    history,
    color: "#f59e0b",
  };
}

async function getVixSignal(): Promise<CrisisSignal> {
  const history = await fetchYahooMacroSeries("^VIX", getStartDate(12));
  const current = history.length > 0 ? history[history.length - 1].value : null;

  // 최근 5거래일 평균으로 "지속" 여부 판단
  const recent5 = history.slice(-5);
  const avg5 = recent5.length > 0
    ? recent5.reduce((s, p) => s + p.value, 0) / recent5.length
    : null;

  let status: CrisisSignal["status"] = "safe";
  let statusLabel = "안정";
  let detail = "VIX가 안정 구간입니다.";

  if (avg5 !== null) {
    if (avg5 >= 30) {
      status = "danger";
      statusLabel = "공포";
      detail = `VIX 5일 평균 ${avg5.toFixed(1)} — 공포가 지속되고 있습니다.`;
    } else if (avg5 >= 20) {
      status = "warning";
      statusLabel = "경계";
      detail = `VIX 5일 평균 ${avg5.toFixed(1)} — 불안감이 높아지고 있습니다.`;
    } else {
      detail = `VIX 5일 평균 ${avg5.toFixed(1)}로 안정 구간입니다.`;
    }
  }

  return {
    id: "vix",
    name: "VIX 공포지수",
    description: "S&P 500 옵션 내재변동성. 20 이하 안정, 20~30 경계, 30 이상 공포.",
    status,
    statusLabel,
    currentValue: current,
    unit: "",
    detail,
    history,
    color: "#f87171",
  };
}

async function getFedRateSignal(): Promise<CrisisSignal> {
  const history = await fetchFredSeries("FEDFUNDS", getStartDate(36));
  const current = history.length > 0 ? history[history.length - 1].value : null;

  // 6개월 전 대비 변화 확인
  const sixMonthsAgo = history.length >= 7 ? history[history.length - 7] : null;
  const rateDiff = current !== null && sixMonthsAgo
    ? current - sixMonthsAgo.value
    : null;

  let status: CrisisSignal["status"] = "safe";
  let statusLabel = "안정";
  let detail = "연준 금리가 안정적입니다.";

  if (rateDiff !== null && current !== null) {
    if (rateDiff <= -1.0) {
      status = "danger";
      statusLabel = "급격한 인하";
      detail = `6개월간 ${rateDiff.toFixed(2)}%p 인하 — 연준이 위기를 인지하고 긴급 대응 중일 수 있습니다.`;
    } else if (rateDiff <= -0.5) {
      status = "warning";
      statusLabel = "인하 시작";
      detail = `6개월간 ${rateDiff.toFixed(2)}%p 인하 — 금리 인하 사이클 진입 신호입니다.`;
    } else if (rateDiff > 0) {
      detail = `6개월간 ${rateDiff.toFixed(2)}%p 인상. 현재 ${current.toFixed(2)}%.`;
    } else {
      detail = `6개월간 변동 ${rateDiff.toFixed(2)}%p. 현재 ${current.toFixed(2)}%.`;
    }
  }

  return {
    id: "fed-rate",
    name: "연준 기준금리 (Fed Funds Rate)",
    description: "급격한 금리 인하는 연준이 경기 악화를 감지했다는 신호. 인하 시작 시점이 위기 임박 신호.",
    status,
    statusLabel,
    currentValue: current,
    unit: "%",
    detail,
    history,
    color: "#34d399",
  };
}

async function getIGSpreadSignal(): Promise<CrisisSignal> {
  const history = await fetchFredSeries("BAMLC0A0CM", getStartDate(36));
  const current = history.length > 0 ? history[history.length - 1].value : null;

  let status: CrisisSignal["status"] = "safe";
  let statusLabel = "정상";
  let detail = "투자등급 스프레드가 안정적입니다.";

  if (current !== null) {
    if (current >= 2.0) {
      status = "danger";
      statusLabel = "위험";
      detail = `IG 스프레드 ${current.toFixed(2)}%p — 금융기관 신용위험이 높습니다.`;
    } else if (current >= 1.5) {
      status = "warning";
      statusLabel = "경계";
      detail = `IG 스프레드 ${current.toFixed(2)}%p — 스트레스가 감지됩니다.`;
    } else {
      detail = `IG 스프레드 ${current.toFixed(2)}%p로 안정적입니다.`;
    }
  }

  return {
    id: "ig-spread",
    name: "금융기관 신용 스프레드 (IG OAS)",
    description: "투자등급 회사채 스프레드. CDS 대용 지표로, 금융기관 부도 위험을 반영.",
    status,
    statusLabel,
    currentValue: current,
    unit: "%p",
    detail,
    history,
    color: "#a78bfa",
  };
}

async function getHousingSignal(): Promise<CrisisSignal> {
  const history = await fetchFredSeries("CSUSHPINSA", getStartDate(60));
  const current = history.length > 0 ? history[history.length - 1].value : null;

  // 6개월 전 대비 변화율
  const sixMonthsAgo = history.length >= 7 ? history[history.length - 7] : null;
  const changeRate = current !== null && sixMonthsAgo && sixMonthsAgo.value > 0
    ? ((current - sixMonthsAgo.value) / sixMonthsAgo.value) * 100
    : null;

  let status: CrisisSignal["status"] = "safe";
  let statusLabel = "안정";
  let detail = "주택가격이 안정적입니다.";

  if (changeRate !== null && current !== null) {
    if (changeRate <= -5) {
      status = "danger";
      statusLabel = "급락";
      detail = `6개월 변동 ${changeRate.toFixed(1)}% — 주택시장이 급격히 냉각되고 있습니다.`;
    } else if (changeRate <= -1) {
      status = "warning";
      statusLabel = "하락";
      detail = `6개월 변동 ${changeRate.toFixed(1)}% — 주택가격 하락이 시작되었습니다.`;
    } else {
      detail = `6개월 변동 +${changeRate.toFixed(1)}%. Case-Shiller 지수 ${current.toFixed(1)}.`;
    }
  }

  return {
    id: "housing",
    name: "부동산 가격 (Case-Shiller 지수)",
    description: "미국 주요 20개 도시 주택가격지수. 하락 전환 시 레버리지 투자자 강제 매도 촉발.",
    status,
    statusLabel,
    currentValue: current,
    unit: "",
    detail,
    history,
    color: "#fb923c",
  };
}

export async function GET() {
  try {
    const [yieldCurve, creditSpread, vix, fedRate, igSpread, housing, fearGreed] =
      await Promise.all([
        getYieldCurveSignal(),
        getCreditSpreadSignal(),
        getVixSignal(),
        getFedRateSignal(),
        getIGSpreadSignal(),
        getHousingSignal(),
        fetchFearGreed().catch(() => null),
      ]);

    const signals = [yieldCurve, creditSpread, vix, fedRate, igSpread, housing];

    // 종합 점수 계산: danger=2, warning=1, safe=0 → 0~12점
    const dangerCount = signals.filter((s) => s.status === "danger").length;
    const warningCount = signals.filter((s) => s.status === "warning").length;
    const rawScore = dangerCount * 2 + warningCount;
    // 12점 만점 → 100점 만점으로 변환
    const crisisScore = Math.round((rawScore / 12) * 100);

    let overallLevel: "low" | "moderate" | "high" | "critical";
    let overallLabel: string;
    if (crisisScore >= 70) {
      overallLevel = "critical";
      overallLabel = "위기 임박";
    } else if (crisisScore >= 40) {
      overallLevel = "high";
      overallLabel = "위험 높음";
    } else if (crisisScore >= 20) {
      overallLevel = "moderate";
      overallLabel = "경계";
    } else {
      overallLevel = "low";
      overallLabel = "안정";
    }

    return NextResponse.json({
      crisisScore,
      overallLevel,
      overallLabel,
      dangerCount,
      warningCount,
      safeCount: signals.length - dangerCount - warningCount,
      signals,
      fearGreedScore: fearGreed?.score ?? null,
      fearGreedRating: fearGreed?.rating ?? null,
    });
  } catch (error) {
    console.error("Failed to fetch crisis signals:", error);
    return NextResponse.json(
      { error: "Failed to fetch crisis data" },
      { status: 500 },
    );
  }
}
