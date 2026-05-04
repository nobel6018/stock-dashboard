"use client";

import { useEffect, useRef, useState } from "react";

interface BarPoint {
  label: string;
  value: number;
  color?: string;
  highlight?: boolean;
  key?: string | number;
}

interface SpendingBarChartProps {
  data: BarPoint[];
  height?: number;
  yLabel?: string;
  onBarClick?: (key: string | number) => void;
  formatValue?: (v: number) => string;
}

export function SpendingBarChart({
  data,
  height = 240,
  yLabel,
  onBarClick,
  formatValue = (v) => v.toFixed(2),
}: SpendingBarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w > 0) setWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (data.length === 0) {
    return <div ref={containerRef} style={{ height }} />;
  }

  const maxValue = Math.max(...data.map((d) => d.value));
  const padding = { top: 16, bottom: 28, left: 52, right: 12 };
  const innerHeight = height - padding.top - padding.bottom;
  const innerWidth = Math.max(width - padding.left - padding.right, 1);
  const barGap = data.length > 80 ? 1 : 2;
  const barWidth = Math.max(
    (innerWidth - barGap * (data.length - 1)) / data.length,
    1,
  );

  // Y축 tick: 4단계, "보기 좋은" 반올림
  const niceMax = niceCeil(maxValue);
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) =>
    (niceMax * i) / gridSteps,
  );

  function yScale(v: number) {
    return padding.top + innerHeight - (v / niceMax) * innerHeight;
  }

  return (
    <div ref={containerRef} className="w-full" style={{ minHeight: height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {/* Y축 라벨 (좌상단) */}
        {yLabel && (
          <text
            x={4}
            y={padding.top - 4}
            fontSize={10}
            fill="#a1a1aa"
            textAnchor="start"
          >
            {yLabel}
          </text>
        )}

        {/* grid + Y tick labels */}
        {gridValues.map((v) => {
          const y = yScale(v);
          return (
            <g key={v}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeWidth={1}
              />
              <text
                x={padding.left - 6}
                y={y + 3}
                fontSize={10}
                fill="#71717a"
                textAnchor="end"
              >
                {formatValue(v)}
              </text>
            </g>
          );
        })}

        {/* bars */}
        {data.map((d, i) => {
          const x = padding.left + i * (barWidth + barGap);
          const y = yScale(d.value);
          const h = padding.top + innerHeight - y;
          const isHover = hover === i;
          const fill = d.color ?? "#22d3ee";
          return (
            <g
              key={d.key ?? i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() =>
                onBarClick && d.key !== undefined && onBarClick(d.key)
              }
              style={{ cursor: onBarClick ? "pointer" : "default" }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(h, 0.5)}
                fill={fill}
                opacity={isHover ? 1 : d.highlight ? 0.95 : 0.75}
                rx={Math.min(barWidth / 4, 1.5)}
              />
            </g>
          );
        })}

        {/* Hover tooltip — 마지막에 그려서 항상 위에 위치 */}
        {hover !== null &&
          (() => {
            const d = data[hover];
            const cx =
              padding.left + hover * (barWidth + barGap) + barWidth / 2;
            const y = yScale(d.value);
            const tooltipW = 110;
            const tooltipH = 22;
            const tx = Math.max(
              padding.left,
              Math.min(cx - tooltipW / 2, width - padding.right - tooltipW),
            );
            const ty = Math.max(padding.top - 2, y - tooltipH - 4);
            return (
              <g pointerEvents="none">
                <rect
                  x={tx}
                  y={ty}
                  width={tooltipW}
                  height={tooltipH}
                  fill="rgba(0,0,0,0.92)"
                  stroke="rgba(255,255,255,0.12)"
                  rx={4}
                />
                <text
                  x={tx + tooltipW / 2}
                  y={ty + 14}
                  fontSize={11}
                  fill="white"
                  textAnchor="middle"
                  fontWeight={500}
                >
                  {d.label} · {formatValue(d.value)}
                </text>
              </g>
            );
          })()}

        {/* X축 라벨 (간격 조절) */}
        {data.map((d, i) => {
          // 가독성: 라벨 한 글자 폭 ~7px 가정. 충돌 없도록 stride 조절
          const minLabelSpacing = 60;
          const stride = Math.max(
            1,
            Math.ceil((data.length * minLabelSpacing) / innerWidth),
          );
          if (i % stride !== 0 && i !== data.length - 1) return null;
          const x = padding.left + i * (barWidth + barGap) + barWidth / 2;
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={height - 8}
              fontSize={10}
              fill="#a1a1aa"
              textAnchor="middle"
            >
              {d.label}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

/** 차트 Y축 max를 보기 좋게 올림. 예: 7.01 → 8, 12.3 → 15, 0.92 → 1 */
function niceCeil(value: number): number {
  if (value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = Math.pow(10, exp);
  const norm = value / base;
  let nice: number;
  if (norm <= 1) nice = 1;
  else if (norm <= 2) nice = 2;
  else if (norm <= 2.5) nice = 2.5;
  else if (norm <= 5) nice = 5;
  else nice = 10;
  return nice * base;
}
