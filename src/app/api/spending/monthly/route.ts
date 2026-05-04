import { NextRequest, NextResponse } from "next/server";
import type { MonthlySpendingPoint } from "@/types/spending";

export const revalidate = 86400;

const TREASURY_API =
  "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_1";

const MONTH_LABELS_KO = [
  "10월",
  "11월",
  "12월",
  "1월",
  "2월",
  "3월",
  "4월",
  "5월",
  "6월",
  "7월",
  "8월",
  "9월",
];

const ENGLISH_TO_FISCAL_INDEX: Record<string, number> = {
  October: 1,
  November: 2,
  December: 3,
  January: 4,
  February: 5,
  March: 6,
  April: 7,
  May: 8,
  June: 9,
  July: 10,
  August: 11,
  September: 12,
};

interface TreasuryRecord {
  record_date: string;
  classification_desc: string;
  current_month_gross_outly_amt: string;
  current_month_gross_rcpt_amt: string;
  record_type_cd: string;
  record_fiscal_year: string;
}

/**
 * 특정 회계연도의 월별 정부 지출/수입을 반환한다.
 * Treasury Fiscal Data API의 MTS Table 1 사용.
 *
 * @param fy URL query "?fy=2025" (FY2025 = 2024-10 ~ 2025-09)
 */
export async function GET(req: NextRequest) {
  const fy = req.nextUrl.searchParams.get("fy");
  if (!fy || !/^\d{4}$/.test(fy)) {
    return NextResponse.json({ error: "Invalid fy" }, { status: 400 });
  }

  const url = new URL(TREASURY_API);
  url.searchParams.set("filter", `record_fiscal_year:eq:${fy}`);
  url.searchParams.set("page[size]", "100");
  url.searchParams.set("sort", "record_date");

  try {
    const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
    if (!res.ok) {
      throw new Error(`Treasury API error: ${res.status}`);
    }
    const json = await res.json();

    const records: TreasuryRecord[] = json.data ?? [];

    // record_type_cd === "MTH" 인 행만이 월별 데이터 (FY 합계는 제외)
    const monthly = records
      .filter(
        (r) =>
          r.record_type_cd === "MTH" &&
          ENGLISH_TO_FISCAL_INDEX[r.classification_desc] !== undefined,
      )
      // 같은 월에 여러 행이 있을 수 있어(소계 등) 첫 번째만
      .reduce<TreasuryRecord[]>((acc, r) => {
        if (!acc.some((x) => x.classification_desc === r.classification_desc)) {
          acc.push(r);
        }
        return acc;
      }, []);

    const data: MonthlySpendingPoint[] = monthly
      .map((r) => {
        const fiscalIdx = ENGLISH_TO_FISCAL_INDEX[r.classification_desc];
        const outlays = parseFloat(r.current_month_gross_outly_amt) || 0;
        const receipts = parseFloat(r.current_month_gross_rcpt_amt) || 0;

        // FY2025 → October=2024-10, November=2024-11, December=2024-12,
        // January=2025-01, ..., September=2025-09
        const fyNum = parseInt(fy, 10);
        const calendarYear = fiscalIdx <= 3 ? fyNum - 1 : fyNum;
        const calendarMonth =
          fiscalIdx <= 3
            ? 9 + fiscalIdx // 10, 11, 12
            : fiscalIdx - 3; // 1..9
        const month = `${calendarYear}-${String(calendarMonth).padStart(2, "0")}`;

        return {
          month,
          monthLabel: MONTH_LABELS_KO[fiscalIdx - 1],
          fiscalMonthIndex: fiscalIdx,
          outlaysT: outlays / 1e12,
          receiptsT: receipts / 1e12,
          deficitT: (outlays - receipts) / 1e12,
        };
      })
      .sort((a, b) => a.fiscalMonthIndex - b.fiscalMonthIndex);

    return NextResponse.json({ data });
  } catch (error) {
    console.error(`Failed to fetch monthly spending (fy=${fy}):`, error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
