"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import summaryIndex from "@/lib/data/summaries/index.json";

type Summary = {
  id: string;
  fileDate: string;
  title: string;
  date: string;
  views: string;
  contentLength: number;
};

const SUMMARIES: Summary[] = (summaryIndex as Summary[]).filter(
  (s) => s.contentLength > 500
);

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedId = searchParams.get("id");

  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const selected = SUMMARIES.find((s) => s.id === selectedId);

  const loadContent = useCallback(async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/summary/${id}`);
      const html = await res.text();
      setContent(html);
    } catch {
      setContent("<p>콘텐츠를 불러올 수 없습니다.</p>");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (selectedId) {
      loadContent(selectedId);
    }
  }, [selectedId, loadContent]);

  function navigateTo(id: string) {
    router.push(`/summary?id=${id}`);
  }

  function goBack() {
    router.push("/summary");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">박종훈 경제로드맵 요약본</h1>
        <p className="mt-1 text-sm text-zinc-500">
          정규 강의 핵심 정리본 · Part 1~3
        </p>
      </div>

      {!selectedId ? (
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            강의 목록
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {SUMMARIES.map((s, i) => {
              const partMatch = s.title.match(/Part (\d)/);
              const partNum = partMatch ? parseInt(partMatch[1]) : 0;
              const partColor =
                partNum === 1
                  ? "text-emerald-400"
                  : partNum === 2
                    ? "text-sky-400"
                    : "text-amber-400";
              const partBorder =
                partNum === 1
                  ? "border-emerald-400/20"
                  : partNum === 2
                    ? "border-sky-400/20"
                    : "border-amber-400/20";

              return (
                <button
                  key={s.id}
                  onClick={() => navigateTo(s.id)}
                  className={`group flex items-center gap-4 rounded-xl border ${partBorder} bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.12]`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-sm font-bold ${partColor}`}
                  >
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                      {s.title}
                    </div>
                    <div className="mt-0.5 flex gap-3 text-xs text-zinc-500">
                      <span>{s.date}</span>
                      <span>조회 {s.views}</span>
                    </div>
                  </div>
                  <svg
                    className="h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              );
            })}
          </div>
        </section>
      ) : (
        <div>
          <button
            onClick={goBack}
            className="mb-4 flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            목록으로
          </button>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 md:p-6">
            <div className="mb-4 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">{selected?.title}</h2>
              <span className="shrink-0 text-xs text-zinc-500">
                {selected?.date} · 조회 {selected?.views}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
              </div>
            ) : (
              <div
                className="summary-content"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            )}
          </div>

          <div className="mt-4 flex justify-between">
            {(() => {
              const idx = SUMMARIES.findIndex((s) => s.id === selectedId);
              const prev = idx > 0 ? SUMMARIES[idx - 1] : null;
              const next =
                idx < SUMMARIES.length - 1 ? SUMMARIES[idx + 1] : null;
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => navigateTo(prev.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    >
                      ← {prev.title.substring(0, 30)}
                    </button>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <button
                      onClick={() => navigateTo(next.id)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    >
                      {next.title.substring(0, 30)} →
                    </button>
                  ) : (
                    <span />
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
        </div>
      }
    >
      <SummaryContent />
    </Suspense>
  );
}
