"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Sparkles, X } from "lucide-react";
import { INVESTORS } from "@/types/portfolio";
import { formatLargeNumber, formatDate } from "@/lib/utils/formatters";
import type { PortfolioDiff } from "@/lib/api/edgar";

const FEATURED_IDS = [
  "druckenmiller",
  "buffett",
  "ackman",
  "dalio",
  "klarman",
  "li-lu",
  "soros",
] as const;

const CROSS_THEMES: Array<{
  title: string;
  body: string;
  signal: "bull" | "bear" | "split";
}> = [
  {
    title: "Alphabet: 컨센서스 깨짐",
    signal: "split",
    body: "Buffett 신규 +204% (2.0%→5.9%), Dalio 신규 매수, Klarman 보유 vs Ackman -95% 사실상 청산, Druckenmiller 완전 청산. 같은 종목 양극단 베팅 = 더 이상 안전한 컨센서스 트레이드 아님. AI 검색 위협 vs Search 데이터 해자 사이 의견 분분.",
  },
  {
    title: "Amazon: 합의된 강세",
    signal: "bull",
    body: "Ackman +19% (top 2 유지), Klarman +47% (top 1), Dalio +125% 대규모 추가, Klarman 12.7% 비중. 가치 투자자·매크로 투자자 모두 모이는 드문 컨센서스. AWS+AI 베팅이 핵심.",
  },
  {
    title: "반도체/AI 인프라: secular 확신 강화",
    signal: "bull",
    body: "Druckenmiller: TSMC 신규 5.0%, STMicro +238%, Broadcom 신규. Dalio: Micron +66%, Broadcom +57%, TSMC 신규. AI capex 사이클 후기에도 1차 수혜자(NVIDIA→AVGO/MU/TSMC)로 회전.",
  },
  {
    title: "엔터프라이즈 SaaS: 회피 합의",
    signal: "bear",
    body: "Dalio가 Salesforce/Workday/ServiceNow 모두 완전 청산. Buffett은 Visa/Mastercard/Aon 청산. Subscription 모델·결제망에 대한 회의 확산. AI가 SaaS 마진 위협한다는 신호.",
  },
  {
    title: "Druckenmiller — 매크로 대전환",
    signal: "split",
    body: "총자산 -25% (4.49B→3.38B). Amazon -71%, Coupang -61%, Alphabet 완전 청산. 대신 YPF(아르헨티나 에너지) +433% 대규모 신규, STMicro +238%, TSMC 신규 5%, Natera 18.1%. 빅테크에서 이머징/의료/반도체로 회전. 매크로 위험 신호.",
  },
  {
    title: "Buffett — 보험·결제망 대규모 정리 + AI 첫 베팅",
    signal: "split",
    body: "종목수 42→29 대규모 정리. Visa, Mastercard, UnitedHealth, Domino's, Aon, Constellation Brands 완전 청산. Alphabet +204% 사실상 첫 진입 (5.9%). Delta 항공 복귀. 보험/결제 안정 secular에 의문, AI 늦은 진입.",
  },
  {
    title: "Ackman — Microsoft 신규 매수",
    signal: "bull",
    body: "MSFT 15.3% 신규 매수 즉시 top 4. Alphabet -95% 사실상 청산. AI Azure 사이드로 클라우드 베팅 회전. Amazon +19% 추가. 11종목 고집중 포트폴리오 유지.",
  },
  {
    title: "Dalio — 광범위 정리 + 반도체 집중",
    signal: "bull",
    body: "1040→993 종목. Salesforce/Workday/ServiceNow 청산. Amazon +125%, Micron +66%, Broadcom +57%, TSMC/Alphabet 신규. All Weather식 분산에서 테제 기반으로 회전 신호.",
  },
  {
    title: "Klarman — 가치 사냥꾼 (Buffett 매도한 것 매수)",
    signal: "bull",
    body: "Aon, Visa 신규 매수 — Buffett이 청산한 종목 정확히 줍기. Amazon +47%, Ferguson +27%. 시장에서 버려진 quality 종목 매수하는 전형적 deep value 패턴.",
  },
];

const PERSONAL_IMPLICATIONS = [
  "QQQM 51% 비중 — Mag 7 의존도. Ackman의 Alphabet 청산·Druckenmiller의 빅테크 회전이 경고 신호. 일부 익절 검토.",
  "VRT 유지 OK — AI 인프라 secular은 모든 매크로 투자자가 동의. 다만 직접 노출(VRT) vs 2차 파생(Copper, NatGas)으로 분산 고려.",
  "GLDM·금현물 14.9% — Druckenmiller 자산 -25% 축소 + Buffett 정리 = 매크로 위험 회피 확인. 통화 희석 헤지 비중 유지.",
  "GOOGL 4.2% — 매크로 투자자들 양극화. 즉시 매도보다 R/R 재계산 후 결정. 본인 테제 명확하지 않으면 청산 후보.",
  "INTC 0.5% — 13F에 인텔 없음. 어떤 매크로 투자자도 안 사는 종목. 청산 강화.",
  "JEPQ/JLPI (Covered call ETFs) — 매크로 사이클 추종 전략과 미스매치. Dalio처럼 SaaS·결제망 회피하는 시점에 이런 ETF는 손해.",
];

function ThemeBadge({ signal }: { signal: "bull" | "bear" | "split" }) {
  const styles = {
    bull: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "강세 합의" },
    bear: { bg: "bg-rose-500/10", text: "text-rose-400", label: "약세 합의" },
    split: { bg: "bg-amber-500/10", text: "text-amber-400", label: "분열" },
  }[signal];
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles.bg} ${styles.text}`}
    >
      {styles.label}
    </span>
  );
}

function ChangeBadge({ type }: { type: "new" | "exited" | "increased" | "decreased" }) {
  const styles = {
    new: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "NEW" },
    exited: { bg: "bg-zinc-500/10", text: "text-zinc-400", label: "EXIT" },
    increased: { bg: "bg-emerald-500/10", text: "text-emerald-400", label: "ADD" },
    decreased: { bg: "bg-rose-500/10", text: "text-rose-400", label: "TRIM" },
  }[type];
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${styles.bg} ${styles.text}`}
    >
      {styles.label}
    </span>
  );
}

export default function ThirteenFAnalysisPage() {
  const [diffs, setDiffs] = useState<Record<string, PortfolioDiff>>({});
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    const errs: string[] = [];
    const results = await Promise.allSettled(
      FEATURED_IDS.map(async (id) => {
        const inv = INVESTORS.find((i) => i.id === id)!;
        const res = await fetch(`/api/portfolio-diff/${id}`);
        if (!res.ok) throw new Error(inv.nameKo);
        const json = await res.json();
        return { id, data: json.data as PortfolioDiff };
      }),
    );
    const map: Record<string, PortfolioDiff> = {};
    for (const r of results) {
      if (r.status === "fulfilled") {
        map[r.value.id] = r.value.data;
      } else {
        errs.push(r.reason.message ?? "unknown");
      }
    }
    setDiffs(map);
    setErrors(errs);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">13F 분기 변동 분석</h1>
        <p className="mt-1 text-sm text-zinc-500">
          매크로 투자자들의 분기 포지션 변화 + 종합 분석. 매 분기 13F 마감일 직후 자동 업데이트.
        </p>
      </div>

      {/* 종합 분석 (Cross-cutting themes) */}
      <section className="mb-8 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.03] p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-400" />
          <h2 className="text-base font-semibold">종합 분석 — 이번 분기 핵심 신호</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {CROSS_THEMES.map((t) => (
            <div
              key={t.title}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-200">{t.title}</h3>
                <ThemeBadge signal={t.signal} />
              </div>
              <p className="text-xs leading-relaxed text-zinc-400">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 본인 포트폴리오 함의 */}
      <section className="mb-8 rounded-xl border border-amber-500/20 bg-amber-500/[0.03] p-5">
        <div className="mb-3 flex items-center gap-2">
          <h2 className="text-base font-semibold">본인 포트폴리오 함의</h2>
        </div>
        <ul className="space-y-2">
          {PERSONAL_IMPLICATIONS.map((p) => (
            <li
              key={p}
              className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-relaxed text-zinc-300"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {/* 투자자별 변동 */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-400" />
        </div>
      )}

      {errors.length > 0 && !loading && (
        <div className="mb-4 rounded-lg border border-rose-500/20 bg-rose-500/[0.03] p-3 text-xs text-rose-400">
          일부 fetch 실패: {errors.join(", ")}
        </div>
      )}

      {!loading && (
        <div className="space-y-6">
          {FEATURED_IDS.map((id) => {
            const d = diffs[id];
            if (!d) return null;
            const totalDeltaPct =
              d.prevTotal > 0
                ? ((d.currTotal - d.prevTotal) / d.prevTotal) * 100
                : 0;
            return (
              <section
                key={id}
                className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5"
              >
                <div className="mb-4">
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-lg font-semibold">{d.investorNameKo}</h2>
                    <span className="text-xs text-zinc-500">
                      {formatDate(d.prevQuarter)} → {formatDate(d.currQuarter)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    총자산 {formatLargeNumber(d.prevTotal)} →{" "}
                    {formatLargeNumber(d.currTotal)}{" "}
                    <span
                      className={
                        totalDeltaPct >= 0 ? "text-emerald-400" : "text-rose-400"
                      }
                    >
                      ({totalDeltaPct >= 0 ? "+" : ""}
                      {totalDeltaPct.toFixed(1)}%)
                    </span>
                    {" · "}종목수 {d.prevCount} → {d.currCount}
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {/* NEW */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <Sparkles className="h-3 w-3" />
                      신규 매수 ({d.newPositions.length})
                    </h3>
                    <ul className="space-y-1.5">
                      {d.newPositions.slice(0, 5).map((p) => (
                        <li
                          key={p.cusip || p.name}
                          className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="line-clamp-1 font-medium text-zinc-200">
                              {p.name}
                            </span>
                            <ChangeBadge type="new" />
                          </div>
                          <div className="mt-0.5 text-[10px] text-zinc-500">
                            {p.currWeight.toFixed(1)}% ·{" "}
                            {formatLargeNumber(p.currValue)}
                          </div>
                        </li>
                      ))}
                      {d.newPositions.length === 0 && (
                        <li className="text-[10px] text-zinc-600">없음</li>
                      )}
                    </ul>
                  </div>

                  {/* EXITED */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-zinc-400">
                      <X className="h-3 w-3" />
                      청산 ({d.exited.length})
                    </h3>
                    <ul className="space-y-1.5">
                      {d.exited.slice(0, 5).map((p) => (
                        <li
                          key={p.cusip || p.name}
                          className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="line-clamp-1 font-medium text-zinc-300">
                              {p.name}
                            </span>
                            <ChangeBadge type="exited" />
                          </div>
                          <div className="mt-0.5 text-[10px] text-zinc-500">
                            was {p.prevWeight.toFixed(1)}% ·{" "}
                            {formatLargeNumber(p.prevValue)}
                          </div>
                        </li>
                      ))}
                      {d.exited.length === 0 && (
                        <li className="text-[10px] text-zinc-600">없음</li>
                      )}
                    </ul>
                  </div>

                  {/* INCREASED */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <ArrowUp className="h-3 w-3" />
                      증액 ({d.increased.length})
                    </h3>
                    <ul className="space-y-1.5">
                      {d.increased.slice(0, 5).map((p) => (
                        <li
                          key={p.cusip || p.name}
                          className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="line-clamp-1 font-medium text-zinc-200">
                              {p.name}
                            </span>
                            <ChangeBadge type="increased" />
                          </div>
                          <div className="mt-0.5 text-[10px] text-zinc-500">
                            {p.prevWeight.toFixed(1)}% →{" "}
                            {p.currWeight.toFixed(1)}% (
                            <span className="text-emerald-400">
                              +{p.sharesPct.toFixed(0)}%
                            </span>
                            )
                          </div>
                        </li>
                      ))}
                      {d.increased.length === 0 && (
                        <li className="text-[10px] text-zinc-600">없음</li>
                      )}
                    </ul>
                  </div>

                  {/* DECREASED */}
                  <div>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-semibold text-rose-400">
                      <ArrowDown className="h-3 w-3" />
                      감액 ({d.decreased.length})
                    </h3>
                    <ul className="space-y-1.5">
                      {d.decreased.slice(0, 5).map((p) => (
                        <li
                          key={p.cusip || p.name}
                          className="rounded-md border border-white/[0.06] bg-white/[0.02] p-2 text-[11px]"
                        >
                          <div className="flex items-center justify-between gap-1">
                            <span className="line-clamp-1 font-medium text-zinc-200">
                              {p.name}
                            </span>
                            <ChangeBadge type="decreased" />
                          </div>
                          <div className="mt-0.5 text-[10px] text-zinc-500">
                            {p.prevWeight.toFixed(1)}% →{" "}
                            {p.currWeight.toFixed(1)}% (
                            <span className="text-rose-400">
                              {p.sharesPct.toFixed(0)}%
                            </span>
                            )
                          </div>
                        </li>
                      ))}
                      {d.decreased.length === 0 && (
                        <li className="text-[10px] text-zinc-600">없음</li>
                      )}
                    </ul>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
