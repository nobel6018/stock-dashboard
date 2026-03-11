"use client";

import { ChartCard } from "@/components/charts/ChartCard";
import { MACRO_INDICATORS } from "@/types/macro";

export default function DashboardPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">매크로 지표</h1>
        <p className="mt-1 text-sm text-zinc-500">
          주요 경제 지표 현황을 한눈에 확인합니다
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
        {MACRO_INDICATORS.map((indicator) => (
          <ChartCard key={indicator.id} indicator={indicator} />
        ))}
      </div>
    </div>
  );
}
