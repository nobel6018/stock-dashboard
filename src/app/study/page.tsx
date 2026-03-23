"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import studyIndex from "@/lib/data/studies/index.json";

type Study = {
  fileDate: string;
  title: string;
  pageCount: number;
};

const STUDIES: Study[] = studyIndex as Study[];

function StudyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedDate = searchParams.get("date");
  const selected = STUDIES.find((s) => s.fileDate === selectedDate);

  const [zoom, setZoom] = useState(false);

  function navigateTo(fileDate: string) {
    router.push(`/study?date=${fileDate}`);
  }

  function goBack() {
    router.push("/study");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">사전 학습 자료</h1>
        <p className="mt-1 text-sm text-zinc-500">
          박종훈 경제로드맵 월간 사전 학습 자료집
        </p>
      </div>

      {!selectedDate || !selected ? (
        <section>
          <h2 className="mb-4 text-sm font-medium uppercase tracking-wider text-zinc-500">
            자료 목록
          </h2>
          <div className="grid grid-cols-1 gap-3">
            {STUDIES.map((s) => {
              const month = s.fileDate.slice(4, 6);
              return (
                <button
                  key={s.fileDate}
                  onClick={() => navigateTo(s.fileDate)}
                  className="group flex items-center gap-4 rounded-xl border border-amber-400/20 bg-white/[0.02] p-4 text-left transition-all hover:bg-white/[0.06] hover:border-white/[0.12]"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-sm font-bold text-amber-400">
                    {parseInt(month)}월
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                      {s.title}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">
                      {s.pageCount}페이지
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
          <div className="mb-4 flex items-center justify-between">
            <button
              onClick={goBack}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
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
            <button
              onClick={() => setZoom((z) => !z)}
              className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:bg-white/[0.06] hover:text-white"
            >
              {zoom ? "축소" : "확대"}
            </button>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-2 md:p-4">
            <h2 className="mb-4 text-lg font-semibold">
              {selected.title}
              <span className="ml-2 text-xs font-normal text-zinc-500">
                {selected.pageCount}페이지
              </span>
            </h2>

            <div className="space-y-2">
              {Array.from({ length: selected.pageCount }, (_, i) => (
                <img
                  key={i}
                  src={`/study-images/${selected.fileDate}/page-${i + 1}.webp`}
                  alt={`${selected.title} ${i + 1}페이지`}
                  className={`w-full rounded-lg ${zoom ? "max-w-none" : ""}`}
                  loading={i < 3 ? "eager" : "lazy"}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 flex justify-between">
            {(() => {
              const idx = STUDIES.findIndex(
                (s) => s.fileDate === selectedDate,
              );
              const prev = idx > 0 ? STUDIES[idx - 1] : null;
              const next =
                idx < STUDIES.length - 1 ? STUDIES[idx + 1] : null;
              return (
                <>
                  {prev ? (
                    <button
                      onClick={() => navigateTo(prev.fileDate)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    >
                      ← {prev.title}
                    </button>
                  ) : (
                    <span />
                  )}
                  {next ? (
                    <button
                      onClick={() => navigateTo(next.fileDate)}
                      className="flex items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                    >
                      {next.title} →
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

export default function StudyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-amber-400" />
        </div>
      }
    >
      <StudyContent />
    </Suspense>
  );
}
