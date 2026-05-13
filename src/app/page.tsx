"use client";

import { ChartCard } from "@/components/charts/ChartCard";
import { ChartSyncProvider } from "@/components/charts/ChartSyncContext";
import {
  MACRO_CATEGORIES,
  MACRO_INDICATORS,
  type MacroCategory,
} from "@/types/macro";

const CATEGORY_DESCRIPTIONS: Record<MacroCategory, string> = {
  "통화/유동성":
    "달러 강도·통화량·재무부 잔고 — 위험자산 멀티플의 1차 결정 변수. 통화 희석·재정 지배 테제 검증.",
  "금리/채권":
    "장단기 금리·신용 스프레드 — 채권 사이클 인플렉션과 신용 사이클 추적.",
  환율:
    "주요 통화쌍 — 글로벌 디플레 수출, 일본 리플레, 한국 산업 경쟁력 변수.",
  원자재:
    "에너지·금속 — 인플레 사이클·AI 인프라 전력 수요·글로벌 제조업 경기.",
  글로벌:
    "비-미국 자산 — 일본 리플레 등 미국 외 매크로 테제 검증.",
  "위기 신호":
    "변동성·연체율 — 시스템 리스크 사전 감지. 역발상 매수 기회 포착.",
};

export default function DashboardPage() {
  return (
    <ChartSyncProvider>
      <div>
        <div className="mb-6">
          <h1 className="text-xl font-semibold">매크로 지표</h1>
          <p className="mt-1 text-sm text-zinc-500">
            주요 경제 지표를 테제별로 그룹화. 분기 리뷰 시 카테고리 단위로 점검.
          </p>
        </div>

        {MACRO_CATEGORIES.map((category) => {
          const indicators = MACRO_INDICATORS.filter(
            (i) => i.category === category,
          );
          if (indicators.length === 0) return null;

          return (
            <section key={category} className="mb-10">
              <div className="mb-3 border-b border-white/[0.06] pb-2">
                <h2 className="text-base font-semibold text-zinc-200">
                  {category}
                </h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {CATEGORY_DESCRIPTIONS[category]}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {indicators.map((indicator) => (
                  <ChartCard key={indicator.id} indicator={indicator} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </ChartSyncProvider>
  );
}
