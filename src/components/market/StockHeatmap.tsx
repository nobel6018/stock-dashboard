"use client";

import { useEffect, useMemo, useState } from "react";

interface HeatmapStock {
  symbol: string;
  name: string;
  sector: string;
  marketCap: number;
  changePercent: number;
}

interface TreemapRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface SectorGroup {
  sector: string;
  stocks: HeatmapStock[];
  totalCap: number;
}

function getChangeColor(change: number): string {
  if (change >= 3) return "bg-emerald-600";
  if (change >= 2) return "bg-emerald-600/80";
  if (change >= 1) return "bg-emerald-600/60";
  if (change >= 0) return "bg-emerald-600/30";
  if (change >= -1) return "bg-red-600/30";
  if (change >= -2) return "bg-red-600/60";
  if (change >= -3) return "bg-red-600/80";
  return "bg-red-600";
}

function squarify(
  items: { value: number; index: number }[],
  container: TreemapRect,
): (TreemapRect & { index: number })[] {
  const results: (TreemapRect & { index: number })[] = [];
  if (items.length === 0) return results;

  const totalValue = items.reduce((s, i) => s + i.value, 0);
  if (totalValue <= 0) return results;

  const sorted = [...items].sort((a, b) => b.value - a.value);
  layoutStrip(sorted, container, totalValue, results);
  return results;
}

function layoutStrip(
  items: { value: number; index: number }[],
  rect: TreemapRect,
  totalValue: number,
  results: (TreemapRect & { index: number })[],
) {
  if (items.length === 0) return;
  if (items.length === 1) {
    results.push({ ...rect, index: items[0].index });
    return;
  }

  const isWide = rect.w >= rect.h;
  let row: { value: number; index: number }[] = [];
  let rowValue = 0;
  let bestAspect = Infinity;

  for (let i = 0; i < items.length; i++) {
    const testRow = [...row, items[i]];
    const testValue = rowValue + items[i].value;
    const stripSize = isWide
      ? (testValue / totalValue) * rect.w
      : (testValue / totalValue) * rect.h;

    let worstAspect = 0;
    for (const item of testRow) {
      const itemSize = isWide
        ? (item.value / testValue) * rect.h
        : (item.value / testValue) * rect.w;
      const aspect = Math.max(stripSize / itemSize, itemSize / stripSize);
      worstAspect = Math.max(worstAspect, aspect);
    }

    if (worstAspect > bestAspect && row.length > 0) {
      const stripFraction = rowValue / totalValue;
      const stripDim = isWide ? stripFraction * rect.w : stripFraction * rect.h;

      let offset = 0;
      for (const item of row) {
        const itemFraction = item.value / rowValue;
        const itemDim = isWide ? itemFraction * rect.h : itemFraction * rect.w;
        results.push({
          x: isWide ? rect.x : rect.x + offset,
          y: isWide ? rect.y + offset : rect.y,
          w: isWide ? stripDim : itemDim,
          h: isWide ? itemDim : stripDim,
          index: item.index,
        });
        offset += itemDim;
      }

      const remaining: TreemapRect = isWide
        ? { x: rect.x + stripDim, y: rect.y, w: rect.w - stripDim, h: rect.h }
        : { x: rect.x, y: rect.y + stripDim, w: rect.w, h: rect.h - stripDim };

      layoutStrip(items.slice(i), remaining, totalValue - rowValue, results);
      return;
    }

    row = testRow;
    rowValue = testValue;
    bestAspect = worstAspect;
  }

  let offset = 0;
  for (const item of row) {
    const itemFraction = item.value / rowValue;
    const itemDim = isWide ? itemFraction * rect.h : itemFraction * rect.w;
    const stripDim = isWide ? rect.w : rect.h;
    results.push({
      x: isWide ? rect.x : rect.x + offset,
      y: isWide ? rect.y + offset : rect.y,
      w: isWide ? stripDim : itemDim,
      h: isWide ? itemDim : stripDim,
      index: item.index,
    });
    offset += itemDim;
  }
}

const SECTOR_COLORS: Record<string, string> = {
  Technology: "border-blue-500/30",
  Communication: "border-purple-500/30",
  "Consumer Cyclical": "border-amber-500/30",
  "Consumer Defensive": "border-lime-500/30",
  Healthcare: "border-cyan-500/30",
  Financials: "border-yellow-500/30",
  Industrials: "border-orange-500/30",
  Energy: "border-rose-500/30",
  Utilities: "border-teal-500/30",
  "Real Estate": "border-indigo-500/30",
  Materials: "border-pink-500/30",
};

export function StockHeatmap() {
  const [stocks, setStocks] = useState<HeatmapStock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/heatmap")
      .then((res) => res.json())
      .then((json) => {
        if (json.data) setStocks(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const sectorGroups = useMemo(() => {
    const groups = new Map<string, SectorGroup>();
    for (const stock of stocks) {
      if (!groups.has(stock.sector)) {
        groups.set(stock.sector, { sector: stock.sector, stocks: [], totalCap: 0 });
      }
      const g = groups.get(stock.sector)!;
      g.stocks.push(stock);
      g.totalCap += stock.marketCap;
    }
    return Array.from(groups.values()).sort((a, b) => b.totalCap - a.totalCap);
  }, [stocks]);

  const WIDTH = 1600;
  const HEIGHT = 800;

  const layout = useMemo(() => {
    if (sectorGroups.length === 0) return [];

    const sectorRects = squarify(
      sectorGroups.map((g, i) => ({ value: g.totalCap, index: i })),
      { x: 0, y: 0, w: WIDTH, h: HEIGHT },
    );

    const result: {
      stock: HeatmapStock;
      rect: TreemapRect;
      sectorRect: TreemapRect;
      sector: string;
    }[] = [];

    for (const sr of sectorRects) {
      const group = sectorGroups[sr.index];
      const stockRects = squarify(
        group.stocks.map((s, i) => ({ value: s.marketCap, index: i })),
        { x: sr.x, y: sr.y, w: sr.w, h: sr.h },
      );

      for (const stockRect of stockRects) {
        result.push({
          stock: group.stocks[stockRect.index],
          rect: stockRect,
          sectorRect: sr,
          sector: group.sector,
        });
      }
    }

    return result;
  }, [sectorGroups]);

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
      </div>
    );
  }

  if (stocks.length === 0) {
    return (
      <div className="flex h-[600px] items-center justify-center text-sm text-zinc-500">
        데이터를 불러올 수 없습니다
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-lg">
      <div className="relative" style={{ width: "100%", aspectRatio: `${WIDTH}/${HEIGHT}` }}>
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-full w-full"
          preserveAspectRatio="xMidYMid meet"
        >
          {layout.map(({ stock, rect }) => {
            const isPositive = stock.changePercent >= 0;
            const intensity = Math.min(Math.abs(stock.changePercent) / 2.5, 1);
            const r = isPositive ? Math.round(30 + (0 - 30) * intensity) : Math.round(30 + (220 - 30) * intensity);
            const g = isPositive ? Math.round(30 + (180 - 30) * intensity) : Math.round(30 + (30 - 30) * intensity);
            const b = isPositive ? Math.round(30 + (100 - 30) * intensity) : Math.round(30 + (30 - 30) * intensity);
            const fill = `rgb(${r},${g},${b})`;

            const minDim = Math.min(rect.w, rect.h);
            const showTicker = minDim > 20;
            const showChange = minDim > 30;
            const showName = rect.w > 60 && rect.h > 45;
            const fontSize = Math.max(Math.min(minDim / 4.5, 18), 9);
            const changeFontSize = Math.max(fontSize - 2, 8);

            return (
              <g key={stock.symbol}>
                <rect
                  x={rect.x + 0.5}
                  y={rect.y + 0.5}
                  width={Math.max(rect.w - 1, 0)}
                  height={Math.max(rect.h - 1, 0)}
                  fill={fill}
                  stroke="#18181b"
                  strokeWidth="1"
                  rx="2"
                />
                {showTicker && (
                  <>
                    <text
                      x={rect.x + rect.w / 2}
                      y={rect.y + rect.h / 2 + (showChange ? -changeFontSize / 2 : fontSize / 3)}
                      textAnchor="middle"
                      fill="white"
                      fontSize={fontSize}
                      fontWeight="bold"
                      fontFamily="system-ui, sans-serif"
                    >
                      {stock.symbol}
                    </text>
                    {showChange && (
                      <text
                        x={rect.x + rect.w / 2}
                        y={rect.y + rect.h / 2 + changeFontSize}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.8)"
                        fontSize={changeFontSize}
                        fontFamily="system-ui, sans-serif"
                      >
                        {stock.changePercent >= 0 ? "+" : ""}
                        {stock.changePercent.toFixed(2)}%
                      </text>
                    )}
                    {showName && (
                      <text
                        x={rect.x + rect.w / 2}
                        y={rect.y + rect.h / 2 + changeFontSize + changeFontSize + 2}
                        textAnchor="middle"
                        fill="rgba(255,255,255,0.5)"
                        fontSize={Math.max(changeFontSize - 1, 7)}
                        fontFamily="system-ui, sans-serif"
                      >
                        {stock.name}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}
        </svg>

        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 px-1">
          {sectorGroups.map((g) => (
            <div key={g.sector} className="flex items-center gap-1.5">
              <div className={`h-2.5 w-2.5 rounded-sm border ${SECTOR_COLORS[g.sector] ?? "border-zinc-500/30"} bg-white/[0.06]`} />
              <span className="text-[10px] text-zinc-500">{g.sector}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
