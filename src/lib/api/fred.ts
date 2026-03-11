import { TimeSeriesPoint } from "@/types/macro";

const FRED_BASE = "https://api.stlouisfed.org/fred/series/observations";

export async function fetchFredSeries(
  seriesId: string,
  startDate?: string,
  endDate?: string,
): Promise<TimeSeriesPoint[]> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error("FRED_API_KEY is not set");
  }

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: "json",
    sort_order: "asc",
  });

  if (startDate) params.set("observation_start", startDate);
  if (endDate) params.set("observation_end", endDate);

  const res = await fetch(`${FRED_BASE}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`FRED API error: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  return data.observations
    .filter((obs: { value: string }) => obs.value !== ".")
    .map((obs: { date: string; value: string }) => ({
      time: obs.date,
      value: parseFloat(obs.value),
    }));
}

export function getStartDateForPeriod(period: string): string {
  const now = new Date();
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
      return "2000-01-01";
    default:
      now.setFullYear(now.getFullYear() - 1);
  }
  return now.toISOString().split("T")[0];
}
