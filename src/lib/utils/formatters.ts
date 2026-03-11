export function formatNumber(value: number, unit: string): string {
  if (unit === "B USD") {
    return `$${(value / 1000).toFixed(1)}T`;
  }
  if (unit === "십억원") {
    return `${(value / 1000).toFixed(0)}조`;
  }
  if (unit === "₩") {
    return `₩${value.toLocaleString("ko-KR", { maximumFractionDigits: 1 })}`;
  }
  if (unit === "%") {
    return `${value.toFixed(2)}%`;
  }
  if (unit === "$") {
    return `$${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (unit === "$/bbl") {
    return `$${value.toFixed(2)}`;
  }
  return value.toLocaleString();
}

export function formatChange(current: number, previous: number): { value: string; positive: boolean } {
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return {
    value: `${diff >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
    positive: diff >= 0,
  };
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "short", day: "numeric" });
}

export function formatLargeNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return `$${value.toFixed(0)}`;
}
