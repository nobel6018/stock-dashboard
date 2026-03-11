import { FearGreedData } from "@/types/market";

const FEAR_GREED_URL =
  "https://production.dataviz.cnn.io/index/fearandgreed/graphdata";

export async function fetchFearGreed(): Promise<FearGreedData> {
  const res = await fetch(FEAR_GREED_URL, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
    },
    next: { revalidate: 1800 },
  });

  if (!res.ok) {
    throw new Error(`Fear & Greed API error: ${res.status}`);
  }

  const data = await res.json();
  const fg = data.fear_and_greed;
  const timeline = data.fear_and_greed_historical?.data ?? [];

  return {
    score: Math.round(fg.score),
    rating: fg.rating,
    timestamp: fg.timestamp,
    previousClose: Math.round(fg.previous_close),
    oneWeekAgo: Math.round(fg.previous_1_week),
    oneMonthAgo: Math.round(fg.previous_1_month),
    oneYearAgo: Math.round(fg.previous_1_year),
    history: timeline.map((pt: { x: number; y: number; rating: string }) => ({
      x: pt.x,
      y: pt.y,
      rating: pt.rating,
    })),
  };
}
