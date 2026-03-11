import { TimeSeriesPoint } from "@/types/macro";

const ECOS_BASE = "https://ecos.bok.or.kr/api/StatisticSearch";

export async function fetchEcosSeries(
  statCode: string,
  startDate: string,
  endDate: string,
  itemCode1: string = "BBHS00",
): Promise<TimeSeriesPoint[]> {
  const apiKey = process.env.ECOS_API_KEY;
  if (!apiKey) {
    throw new Error("ECOS_API_KEY is not set");
  }

  const url = `${ECOS_BASE}/${apiKey}/json/kr/1/1000/${statCode}/M/${startDate}/${endDate}/${itemCode1}`;

  const res = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`ECOS API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  if (data.StatisticSearch?.row) {
    return data.StatisticSearch.row.map(
      (row: { TIME: string; DATA_VALUE: string }) => ({
        time: `${row.TIME.substring(0, 4)}-${row.TIME.substring(4, 6)}-01`,
        value: parseFloat(row.DATA_VALUE),
      }),
    );
  }

  return [];
}

export function getEcosDateRange(period: string): { start: string; end: string } {
  const now = new Date();
  const endDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  let startDate: string;
  switch (period) {
    case "1M":
      now.setMonth(now.getMonth() - 1);
      break;
    case "3M":
      now.setMonth(now.getMonth() - 3);
      break;
    case "6M":
      now.setMonth(now.getMonth() - 6);
      break;
    case "1Y":
      now.setFullYear(now.getFullYear() - 1);
      break;
    case "3Y":
      now.setFullYear(now.getFullYear() - 3);
      break;
    case "5Y":
      now.setFullYear(now.getFullYear() - 5);
      break;
    case "ALL":
      startDate = "200310";
      return { start: startDate, end: endDate };
    default:
      now.setFullYear(now.getFullYear() - 1);
  }
  startDate = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return { start: startDate, end: endDate };
}
