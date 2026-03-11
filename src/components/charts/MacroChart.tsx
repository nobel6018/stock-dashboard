"use client";

import { useEffect, useId, useRef } from "react";
import { createChart, ColorType, IChartApi, AreaSeries } from "lightweight-charts";
import { TimeSeriesPoint } from "@/types/macro";
import { useChartSync } from "./ChartSyncContext";

interface MacroChartProps {
  data: TimeSeriesPoint[];
  color: string;
  height?: number;
}

export function MacroChart({ data, color, height = 280 }: MacroChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const chartId = useId();
  const sync = useChartSync();

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
      height,
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: false,
      },
      crosshair: {
        horzLine: { color: "rgba(255, 255, 255, 0.2)" },
        vertLine: { color: "rgba(255, 255, 255, 0.2)" },
      },
    });

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: color,
      topColor: `${color}40`,
      bottomColor: `${color}05`,
      lineWidth: 2,
    });

    areaSeries.setData(data);
    chart.timeScale().fitContent();
    chartRef.current = chart;

    if (sync) {
      sync.registerChart(chartId, { chart, series: areaSeries });

      chart.subscribeCrosshairMove((param) => {
        const time = param.time as string | undefined;
        const point = param.point;
        sync.handleCrosshairMove(chartId, time, point);
      });
    }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(containerRef.current);

    return () => {
      if (sync) {
        sync.unregisterChart(chartId);
      }
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
    };
  }, [data, color, height, chartId, sync]);

  return <div ref={containerRef} />;
}
