export interface AnnualSpendingPoint {
  /** 회계연도 (FY 종료년 기준, 예: 2025 = FY2025 = 2024-10 ~ 2025-09) */
  fiscalYear: number;
  /** 정부 지출 (조 USD, FYONET) */
  outlaysT: number;
  /** PCE 개인소비지출 (조 USD, PCECA, 캘린더 연도 기준) */
  pceT: number | null;
  /** 소비 대비 지출 비중 (%, outlaysT / pceT × 100) */
  outlaysToPcePct: number | null;
  /** GDP 대비 부채 비율 (%, GFDEGDQ188S, FY-end Q3 값) */
  debtToGdpPct: number | null;
  /** YoY 변화율 (%) */
  yoyChangePct: number | null;
  /** 집권 대통령 */
  president: string | null;
  /** 정당 */
  party: "민주" | "공화" | "기타" | null;
}

export interface MonthlySpendingPoint {
  /** YYYY-MM */
  month: string;
  /** 월 라벨 한글 */
  monthLabel: string;
  /** 회계연도 내 순서 (1~12, October=1) */
  fiscalMonthIndex: number;
  /** 총 지출 (조 USD) */
  outlaysT: number;
  /** 총 수입 (조 USD) */
  receiptsT: number;
  /** 적자 (조 USD, +면 적자, -면 흑자) */
  deficitT: number;
}
