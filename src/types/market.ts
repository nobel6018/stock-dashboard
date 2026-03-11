export interface FearGreedData {
  score: number;
  rating: string;
  timestamp: string;
  previousClose: number;
  oneWeekAgo: number;
  oneMonthAgo: number;
  oneYearAgo: number;
  history: { x: number; y: number; rating: string }[];
}

export interface IndexData {
  symbol: string;
  name: string;
  nameKo: string;
  price: number;
  change: number;
  changePercent: number;
  volume?: number;
}

export interface SectorData {
  symbol: string;
  name: string;
  nameKo: string;
  return1M: number;
  return3M: number;
  dailyChange: number;
}

export const MAJOR_INDICES = [
  { symbol: "^GSPC", name: "S&P 500", nameKo: "S&P 500" },
  { symbol: "^IXIC", name: "NASDAQ", nameKo: "나스닥" },
  { symbol: "^DJI", name: "Dow Jones", nameKo: "다우존스" },
  { symbol: "^KS11", name: "KOSPI", nameKo: "코스피" },
  { symbol: "^KQ11", name: "KOSDAQ", nameKo: "코스닥" },
] as const;

export const SECTOR_ETFS = [
  { symbol: "XLK", name: "Technology", nameKo: "IT" },
  { symbol: "XLE", name: "Energy", nameKo: "에너지" },
  { symbol: "XLF", name: "Financials", nameKo: "금융" },
  { symbol: "XLV", name: "Health Care", nameKo: "헬스케어" },
  { symbol: "XLY", name: "Consumer Disc.", nameKo: "경기소비재" },
  { symbol: "XLP", name: "Consumer Staples", nameKo: "필수소비재" },
  { symbol: "XLI", name: "Industrials", nameKo: "산업재" },
  { symbol: "XLB", name: "Materials", nameKo: "소재" },
  { symbol: "XLRE", name: "Real Estate", nameKo: "부동산" },
  { symbol: "XLC", name: "Communication", nameKo: "커뮤니케이션" },
  { symbol: "XLU", name: "Utilities", nameKo: "유틸리티" },
] as const;
