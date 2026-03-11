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
];
