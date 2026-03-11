"use client";

import { useEffect, useState } from "react";
import { FearGreedData } from "@/types/market";

function getRatingKo(rating: string): string {
  const map: Record<string, string> = {
    "Extreme Fear": "극도의 공포",
    Fear: "공포",
    Neutral: "중립",
    Greed: "탐욕",
    "Extreme Greed": "극도의 탐욕",
  };
  return map[rating] || rating;
}

function getGaugeColor(score: number): string {
  if (score <= 25) return "#ef4444";
  if (score <= 45) return "#f97316";
  if (score <= 55) return "#eab308";
  if (score <= 75) return "#84cc16";
  return "#22c55e";
}

export function FearGreedGauge() {
  const [data, setData] = useState<FearGreedData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/feargreed")
      .then((res) => res.json())
      .then((json) => {
        if (!json.error) setData(json);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  const color = getGaugeColor(data.score);
  const angle = (data.score / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Gauge */}
      <div className="relative h-[120px] w-[220px]">
        <svg viewBox="0 0 220 120" className="h-full w-full">
          {/* Background arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 20 110 A 90 90 0 0 1 200 110"
            fill="none"
            stroke={color}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${(data.score / 100) * 283} 283`}
            className="transition-all duration-1000"
          />
          {/* Needle */}
          <g transform={`rotate(${angle}, 110, 110)`}>
            <line
              x1="110"
              y1="110"
              x2="110"
              y2="35"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="110" cy="110" r="4" fill="white" />
          </g>
          {/* Labels */}
          <text x="20" y="118" fill="#71717a" fontSize="10" textAnchor="middle">
            0
          </text>
          <text
            x="200"
            y="118"
            fill="#71717a"
            fontSize="10"
            textAnchor="middle"
          >
            100
          </text>
        </svg>
      </div>

      {/* Score + Rating */}
      <div className="text-center">
        <div className="text-3xl font-bold" style={{ color }}>
          {data.score}
        </div>
        <div className="text-sm font-medium" style={{ color }}>
          {getRatingKo(data.rating)}
        </div>
      </div>

      {/* History comparison */}
      <div className="grid w-full grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
          <span className="text-zinc-500">전일</span>
          <span className="text-zinc-300">{data.previousClose}</span>
        </div>
        <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
          <span className="text-zinc-500">1주 전</span>
          <span className="text-zinc-300">{data.oneWeekAgo}</span>
        </div>
        <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
          <span className="text-zinc-500">1달 전</span>
          <span className="text-zinc-300">{data.oneMonthAgo}</span>
        </div>
        <div className="flex justify-between rounded-lg bg-white/[0.03] px-3 py-1.5">
          <span className="text-zinc-500">1년 전</span>
          <span className="text-zinc-300">{data.oneYearAgo}</span>
        </div>
      </div>
    </div>
  );
}
