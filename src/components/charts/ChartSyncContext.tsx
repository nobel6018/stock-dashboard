"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { IChartApi, ISeriesApi, SeriesType } from "lightweight-charts";

interface ChartEntry {
  chart: IChartApi;
  series: ISeriesApi<SeriesType>;
}

interface ChartSyncContextValue {
  period: string;
  setPeriod: (period: string) => void;
  registerChart: (id: string, entry: ChartEntry) => void;
  unregisterChart: (id: string) => void;
  handleCrosshairMove: (
    sourceId: string,
    time: string | number | undefined,
    point: { x: number; y: number } | undefined,
  ) => void;
}

const ChartSyncContext = createContext<ChartSyncContextValue | null>(null);

export function ChartSyncProvider({ children }: { children: ReactNode }) {
  const [period, setPeriod] = useState("1Y");
  const chartsRef = useRef<Map<string, ChartEntry>>(new Map());
  const syncingRef = useRef(false);

  const registerChart = useCallback((id: string, entry: ChartEntry) => {
    chartsRef.current.set(id, entry);
  }, []);

  const unregisterChart = useCallback((id: string) => {
    chartsRef.current.delete(id);
  }, []);

  const handleCrosshairMove = useCallback(
    (
      sourceId: string,
      time: string | number | undefined,
      point: { x: number; y: number } | undefined,
    ) => {
      if (syncingRef.current) return;
      syncingRef.current = true;

      chartsRef.current.forEach((entry, id) => {
        if (id === sourceId) return;
        try {
          if (time && point) {
            entry.chart.setCrosshairPosition(
              NaN,
              time as Parameters<IChartApi["setCrosshairPosition"]>[1],
              entry.series,
            );
          } else {
            entry.chart.clearCrosshairPosition();
          }
        } catch {
          // chart may have been removed
        }
      });

      syncingRef.current = false;
    },
    [],
  );

  return (
    <ChartSyncContext.Provider
      value={{
        period,
        setPeriod,
        registerChart,
        unregisterChart,
        handleCrosshairMove,
      }}
    >
      {children}
    </ChartSyncContext.Provider>
  );
}

export function useChartSync(): ChartSyncContextValue | null {
  return useContext(ChartSyncContext);
}
