"use client";

import { FearGreedGauge } from "@/components/market/FearGreedGauge";
import { MacroSignalCard } from "@/components/market/MacroSignalCard";
import { SectorBar } from "@/components/market/SectorBar";
import { FundFlowChart } from "@/components/market/FundFlowChart";
import { IndicesTable } from "@/components/market/IndicesTable";
import { StockHeatmap } from "@/components/market/StockHeatmap";
import { ChartSyncProvider } from "@/components/charts/ChartSyncContext";

export default function MarketPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">증시 흐름</h1>
        <p className="mt-1 text-sm text-zinc-500">
          거시 시그널부터 어제 증시 요약까지 한눈에 확인합니다
        </p>
      </div>

      {/* Section 1: 큰 흐름 (거시 시그널) */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          거시 시그널
        </h2>
        <ChartSyncProvider>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
              <h3 className="mb-2 text-sm font-medium text-zinc-400">
                Fear & Greed Index
              </h3>
              <FearGreedGauge />
            </div>
            <MacroSignalCard
              title="VIX 공포지수"
              seriesId="vix"
              unit=""
              color="#f87171"
              warningThreshold={20}
              dangerThreshold={30}
              description="S&P 500 옵션의 내재변동성 지수. 20 이하: 안정, 20~30: 경계, 30 이상: 공포 구간."
            />
            <MacroSignalCard
              title="장단기 금리차 (10Y-2Y)"
              seriesId="yield-spread"
              unit="%"
              color="#818cf8"
              defaultPeriod="3Y"
              description="10년물-2년물 국채 금리 차이. 양수(정상): 경기 확장 기대. 축소→0 근접: 경기 둔화 신호. 음수(역전): 단기 금리가 장기보다 높은 비정상 상태. 역전 해소(음수→양수) 시점이 오히려 가장 위험 — 연준이 경기 악화를 감지해 급격히 금리를 내리면 단기 금리가 빠르게 떨어져 스프레드가 양수로 전환되는데, 이는 경기가 이미 꺾이고 있다는 의미. 역사적으로 실제 침체는 역전 중이 아니라 역전이 풀린 직후에 시작."
            />
          </div>
        </ChartSyncProvider>
      </section>

      {/* Section 2: 중간 흐름 */}
      <section className="mb-8">
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          중간 흐름
        </h2>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-400">
              섹터 로테이션
            </h3>
            <SectorBar />
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            <h3 className="mb-3 text-sm font-medium text-zinc-400">
              자금 흐름 (주식/채권/현금)
            </h3>
            <FundFlowChart />
          </div>
        </div>
      </section>

      {/* Section 3: 어제 증시 요약 */}
      <section>
        <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
          어제 증시 요약
        </h2>
        <div className="mb-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 lg:max-w-md">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">
            주요 지수
          </h3>
          <IndicesTable />
        </div>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
          <h3 className="mb-3 text-sm font-medium text-zinc-400">
            섹터 히트맵
          </h3>
          <StockHeatmap />
        </div>
      </section>
    </div>
  );
}
