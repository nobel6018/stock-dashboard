"use client";

import { useEffect, useRef, useState } from "react";
import {
  createChart,
  ColorType,
  IChartApi,
  AreaSeries,
} from "lightweight-charts";

type Period = "1Y" | "3Y" | "5Y" | "10Y" | "All";

const PERIODS: Period[] = ["1Y", "3Y", "5Y", "10Y", "All"];

interface PCEPoint {
  time: string;
  value: number;
}

export function PCEChart() {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [period, setPeriod] = useState<Period>("5Y");
  const [data, setData] = useState<PCEPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`/api/spending/pce?period=${period}`)
      .then((r) => {
        if (!r.ok) throw new Error("fetch failed");
        return r.json();
      })
      .then((j) => setData(j.data ?? []))
      .catch(() => setError("PCE 데이터를 불러올 수 없습니다"))
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    if (!containerRef.current || data.length === 0) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#9ca3af",
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.04)" },
        horzLines: { color: "rgba(255, 255, 255, 0.04)" },
      },
      width: containerRef.current.clientWidth,
      height: 280,
      rightPriceScale: { borderColor: "rgba(255, 255, 255, 0.1)" },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: false,
      },
      crosshair: {
        horzLine: { color: "rgba(255, 255, 255, 0.2)" },
        vertLine: { color: "rgba(255, 255, 255, 0.2)" },
      },
      localization: {
        priceFormatter: (v: number) => `$${v.toFixed(2)}T`,
      },
    });

    const series = chart.addSeries(AreaSeries, {
      lineColor: "#a78bfa",
      topColor: "#a78bfa40",
      bottomColor: "#a78bfa05",
      lineWidth: 2,
      priceFormat: {
        type: "custom",
        formatter: (v: number) => `$${v.toFixed(2)}T`,
        minMove: 0.01,
      },
    });

    series.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    ro.observe(containerRef.current);

    return () => {
      ro.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data]);

  const latestValue = data.length > 0 ? data[data.length - 1].value : null;
  const firstValue = data.length > 0 ? data[0].value : null;
  const changePct =
    latestValue !== null && firstValue !== null && firstValue !== 0
      ? ((latestValue - firstValue) / firstValue) * 100
      : null;

  return (
    <section className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            개인소비지출 (PCE) — 월별
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            {latestValue !== null ? (
              <>
                <span className="text-2xl font-semibold text-white">
                  ${latestValue.toFixed(2)}T
                </span>
                {changePct !== null && (
                  <span
                    className={`text-xs font-medium ${
                      changePct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {period} {changePct >= 0 ? "+" : ""}
                    {changePct.toFixed(1)}%
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl text-zinc-600">—</span>
            )}
          </div>
          <div className="mt-1 text-[11px] text-zinc-500">
            FRED PCE · 명목 · 월 1회 발표 · 단위 환산: 조 USD
          </div>
        </div>
        <div className="flex shrink-0 gap-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2 py-1 text-[11px] transition-colors ${
                period === p
                  ? "bg-white/[0.1] text-white"
                  : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
              }`}
            >
              {p === "All" ? "전체" : p}
            </button>
          ))}
        </div>
      </div>

      <div className="relative min-h-[280px]">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
            {error}
          </div>
        )}
        <div ref={containerRef} className={loading ? "opacity-30" : ""} />
      </div>

      <div className="mt-3 rounded-md border border-white/[0.05] bg-white/[0.02] px-3 py-2 text-[11px] leading-relaxed text-zinc-500">
        <span className="font-medium text-zinc-400">참고:</span> PCE는 BEA가
        매월 발표하는 통계입니다. 주/일 단위 PCE 데이터는 존재하지 않으며,
        고빈도 소비 지표가 필요한 경우 Redbook(주간 소매), 신용카드 사용량
        지표 등을 별도로 봐야 합니다.
      </div>
    </section>
  );
}
