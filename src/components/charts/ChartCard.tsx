"use client";

import { useCallback, useEffect, useState } from "react";
import { MacroChart } from "./MacroChart";
import { PeriodSelector } from "./PeriodSelector";
import { useChartSync } from "./ChartSyncContext";
import { MacroIndicator, TimeSeriesPoint } from "@/types/macro";
import { formatNumber, formatChange } from "@/lib/utils/formatters";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

interface ChartCardProps {
  indicator: MacroIndicator;
}

export function ChartCard({ indicator }: ChartCardProps) {
  const [data, setData] = useState<TimeSeriesPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { period, setPeriod } = useChartSync()!;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/macro/${indicator.id}?period=${period}`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json.data);
    } catch {
      setError("데이터를 불러올 수 없습니다");
    } finally {
      setLoading(false);
    }
  }, [indicator.id, period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const currentValue = data.length > 0 ? data[data.length - 1].value : null;
  const periodStartValue = data.length > 1 ? data[0].value : null;
  const change =
    currentValue !== null && periodStartValue !== null
      ? formatChange(currentValue, periodStartValue)
      : null;

  return (
    <div className="flex flex-col rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-medium text-zinc-400">
            {indicator.nameKo}
            <InfoTooltip text={indicator.description} />
          </h3>
          <div className="mt-1 flex items-baseline gap-2">
            {currentValue !== null ? (
              <>
                <span className="text-2xl font-semibold text-white">
                  {formatNumber(currentValue, indicator.unit)}
                </span>
                {change && (
                  <span
                    className={`text-xs font-medium ${change.positive ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {change.value}
                  </span>
                )}
              </>
            ) : (
              <span className="text-2xl text-zinc-600">—</span>
            )}
          </div>
        </div>
        <PeriodSelector selected={period} onChange={setPeriod} />
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
        {!loading && !error && data.length > 0 && (
          <MacroChart data={data} color={indicator.color} />
        )}
      </div>
    </div>
  );
}
