import { NextResponse } from "next/server";
import { fetchFredSeries } from "@/lib/api/fred";
import { getPresidentByFiscalYear } from "@/lib/data/spending/presidents";
import type { AnnualSpendingPoint } from "@/types/spending";

export const revalidate = 86400;

/**
 * 회계연도별 미국 정부 지출 데이터를 반환한다.
 *
 * - FYONET: 회계연도별 순지출 (millions USD, FY 종료일 = 9/30)
 * - GFDEGDQ188S: GDP 대비 총 연방 부채 비율 (%, 분기). FY 종료(9/30)에 가까운
 *   Q3 (7/1) 값을 해당 FY의 종료 시점 부채 비율로 사용.
 */
export async function GET() {
  try {
    const [outlaysRaw, debtRatioRaw] = await Promise.all([
      fetchFredSeries("FYONET"),
      fetchFredSeries("GFDEGDQ188S"),
    ]);

    // 9월 30일 또는 같은 회계연도 종료일 → fiscalYear
    const outlaysByFY = new Map<number, number>();
    for (const p of outlaysRaw) {
      const date = new Date(p.time);
      const fy = date.getUTCFullYear();
      // millions → trillions
      outlaysByFY.set(fy, p.value / 1_000_000);
    }

    // GFDEGDQ188S는 분기 데이터. 각 FY 종료(9/30)에 가장 가까운 Q3(7/1) 값을 사용
    const debtRatioByFY = new Map<number, number>();
    for (const p of debtRatioRaw) {
      const date = new Date(p.time);
      // Q3 = 7월 1일 시작 데이터 (FRED는 분기 시작일 기준)
      if (date.getUTCMonth() === 6) {
        debtRatioByFY.set(date.getUTCFullYear(), p.value);
      }
    }

    const fiscalYears = Array.from(outlaysByFY.keys()).sort((a, b) => b - a);

    const data: AnnualSpendingPoint[] = fiscalYears.map((fy) => {
      const outlaysT = outlaysByFY.get(fy)!;
      const prevOutlays = outlaysByFY.get(fy - 1);
      const yoyChangePct =
        prevOutlays !== undefined
          ? ((outlaysT - prevOutlays) / prevOutlays) * 100
          : null;
      const president = getPresidentByFiscalYear(fy);

      return {
        fiscalYear: fy,
        outlaysT,
        debtToGdpPct: debtRatioByFY.get(fy) ?? null,
        yoyChangePct,
        president: president?.name ?? null,
        party: president?.party ?? null,
      };
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Failed to fetch annual spending:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
