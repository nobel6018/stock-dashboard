export interface TimeSeriesPoint {
  time: string;
  value: number;
}

export interface MacroIndicator {
  id: string;
  name: string;
  nameKo: string;
  seriesId: string;
  source: "fred" | "ecos";
  unit: string;
  color: string;
  description: string;
}

export const MACRO_INDICATORS: MacroIndicator[] = [
  {
    id: "us-10y-treasury",
    name: "US 10Y Treasury",
    nameKo: "미국 10년채 금리",
    seriesId: "DGS10",
    source: "fred",
    unit: "%",
    color: "#4ade80",
    description: "미국 10년 만기 국채 수익률",
  },
  {
    id: "us-m2",
    name: "US M2 Money Supply",
    nameKo: "미국 M2 통화량",
    seriesId: "M2SL",
    source: "fred",
    unit: "B USD",
    color: "#60a5fa",
    description: "미국 광의통화 (계절조정)",
  },
  {
    id: "kr-m2",
    name: "Korea M2 Money Supply",
    nameKo: "한국 M2 통화량",
    seriesId: "161Y005",
    source: "ecos",
    unit: "십억원",
    color: "#f472b6",
    description: "한국 광의통화 M2 (평잔, 계절조정)",
  },
  {
    id: "usd-krw",
    name: "USD/KRW",
    nameKo: "원/달러 환율",
    seriesId: "DEXKOUS",
    source: "fred",
    unit: "₩",
    color: "#fbbf24",
    description: "1달러당 원화",
  },
  {
    id: "wti",
    name: "WTI Crude Oil",
    nameKo: "WTI 유가",
    seriesId: "DCOILWTICO",
    source: "fred",
    unit: "$/bbl",
    color: "#fb923c",
    description: "서부 텍사스 중질유",
  },
  {
    id: "brent",
    name: "Brent Crude Oil",
    nameKo: "Brent 유가",
    seriesId: "DCOILBRENTEU",
    source: "fred",
    unit: "$/bbl",
    color: "#a78bfa",
    description: "브렌트유",
  },
  {
    id: "bitcoin",
    name: "Bitcoin",
    nameKo: "비트코인",
    seriesId: "CBBTCUSD",
    source: "fred",
    unit: "$",
    color: "#f7931a",
    description: "비트코인 (Coinbase USD)",
  },
  {
    id: "vix",
    name: "VIX",
    nameKo: "VIX 공포지수",
    seriesId: "VIXCLS",
    source: "fred",
    unit: "",
    color: "#f87171",
    description: "CBOE 변동성 지수",
  },
  {
    id: "yield-spread",
    name: "10Y-2Y Spread",
    nameKo: "장단기 금리차 (10Y-2Y)",
    seriesId: "T10Y2Y",
    source: "fred",
    unit: "%",
    color: "#818cf8",
    description: "10년물-2년물 국채 금리 차이. 양수(정상): 경기 확장 기대. 축소→0 근접: 경기 둔화 신호. 음수(역전): 단기 금리가 장기보다 높은 비정상 상태. 역사적으로 역전이 해소되어 음수→양수로 돌아오는 시점에 실제 침체가 시작되는 경우가 많음 (연준 급격한 금리 인하 → 단기 금리 하락 → 스프레드 양수 전환).",
  },
];
