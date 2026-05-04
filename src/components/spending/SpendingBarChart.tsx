"use client";

import { useState } from "react";

interface BarPoint {
  label: string;
  value: number;
  /** 0~6, 정당 색상 등 */
  color?: string;
  /** 강조 표시 */
  highlight?: boolean;
  /** 클릭 핸들러용 키 */
  key?: string | number;
}

interface SpendingBarChartProps {
  data: BarPoint[];
  height?: number;
  yLabel?: string;
  onBarClick?: (key: string | number) => void;
  /** 값 포매터 (툴팁용) */
  formatValue?: (v: number) => string;
}

export function SpendingBarChart({
  data,
  height = 240,
  yLabel,
  onBarClick,
  formatValue = (v) => v.toFixed(2),
}: SpendingBarChartProps) {
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) return null;

  const maxValue = Math.max(...data.map((d) => d.value));
  const padding = { top: 10, bottom: 28, left: 44, right: 8 };
  const innerHeight = height - padding.top - padding.bottom;
  const barGap = 2;
  // viewBox에서 width는 100을 기본으로 두고 stretch
  const width = 600;
  const innerWidth = width - padding.left - padding.right;
  const barWidth = (innerWidth - barGap * (data.length - 1)) / data.length;

  // 가로 grid lines
  const gridSteps = 4;
  const gridValues = Array.from({ length: gridSteps + 1 }, (_, i) =>
    Math.round((maxValue * i) / gridSteps * 10) / 10,
  );

  function yScale(v: number) {
    return padding.top + innerHeight - (v / maxValue) * innerHeight;
  }

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {/* grid + Y labels */}
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
                fontSize={9}
                fill="#71717a"
                textAnchor="end"
              >
                {formatValue(v)}
              </text>
            </g>
          );
        })}
        {yLabel && (
          <text
            x={padding.left - 36}
            y={padding.top + 4}
            fontSize={9}
            fill="#a1a1aa"
          >
            {yLabel}
          </text>
        )}

        {/* bars */}
        {data.map((d, i) => {
          const x = padding.left + i * (barWidth + barGap);
          const y = yScale(d.value);
          const h = padding.top + innerHeight - y;
          const isHover = hover === i;
          const fill = d.color ?? "#22d3ee";
          const isHighlight = d.highlight;
          return (
            <g
              key={d.key ?? i}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              onClick={() =>
                onBarClick && d.key !== undefined && onBarClick(d.key)
              }
              style={{
                cursor: onBarClick ? "pointer" : "default",
              }}
            >
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={fill}
                opacity={isHover ? 1 : isHighlight ? 0.95 : 0.7}
                rx={1}
              />
              {/* hover label */}
              {isHover && (
                <g>
                  <rect
                    x={Math.min(x - 20, width - padding.right - 80)}
                    y={Math.max(y - 28, padding.top)}
                    width={80}
                    height={22}
                    fill="rgba(0,0,0,0.85)"
                    stroke="rgba(255,255,255,0.1)"
                    rx={3}
                  />
                  <text
                    x={Math.min(x - 20, width - padding.right - 80) + 40}
                    y={Math.max(y - 14, padding.top + 14)}
                    fontSize={10}
                    fill="white"
                    textAnchor="middle"
                    fontWeight={500}
                  >
                    {d.label} · {formatValue(d.value)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* x labels (보기 좋게 일부만) */}
        {data.map((d, i) => {
          const stride = Math.max(1, Math.ceil(data.length / 12));
          if (i % stride !== 0 && i !== data.length - 1) return null;
          const x = padding.left + i * (barWidth + barGap) + barWidth / 2;
          return (
            <text
              key={`x-${i}`}
              x={x}
              y={height - 10}
              fontSize={9}
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
