"use client";

import { useCallback, useEffect, useState } from "react";
import { MacroChart } from "@/components/charts/MacroChart";
import { PeriodSelector } from "@/components/charts/PeriodSelector";
import { TimeSeriesPoint } from "@/types/macro";

interface MacroSignalCardProps {
  title: string;
  seriesId: string;
  unit: string;
  color: string;
  defaultPeriod?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
  showZeroLine?: boolean;
}

export function MacroSignalCard({
  title,
  seriesId,
  unit,
  color,
  defaultPeriod = "1Y",
  warningThreshold,
  dangerThreshold,
}: MacroSignalCardProps) {
  const [data, setData] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(defaultPeriod);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/macro/${seriesId}?period=${period}`);
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json.data);
    } catch {
      console.error(`Failed to fetch ${seriesId}`);
    } finally {
      setLoading(false);
    }
  }, [seriesId, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentValue = data.length > 0 ? data[data.length - 1].value : null;

  let valueColor = "text-white";
  if (currentValue !== null) {
    if (dangerThreshold !== undefined && currentValue >= dangerThreshold) {
      valueColor = "text-red-400";
    } else if (
      warningThreshold !== undefined &&
      currentValue >= warningThreshold
    ) {
      valueColor = "text-amber-400";
    }
  }

  const formatValue = (v: number) => {
    if (unit === "%") return `${v.toFixed(2)}%`;
    return v.toFixed(2);
  };

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">{title}</h3>
          {currentValue !== null ? (
            <div className={`mt-1 text-2xl font-semibold ${valueColor}`}>
              {formatValue(currentValue)}
            </div>
          ) : (
            <div className="mt-1 text-2xl text-zinc-600">—</div>
          )}
        </div>
        <PeriodSelector selected={period} onChange={setPeriod} />
      </div>

      <div className="relative min-h-[200px]">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
          </div>
        ) : data.length > 0 ? (
          <MacroChart data={data} color={color} height={200} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-sm text-zinc-500">
            데이터 없음
          </div>
        )}
      </div>
    </div>
  );
}
