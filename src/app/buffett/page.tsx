"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ALL_TAGS,
  LETTERS,
  TAG_DESCRIPTIONS,
  type Letter,
  type Tag,
} from "@/lib/data/buffett/letters";

const TAG_COLORS: Record<Tag, string> = {
  "사이클 역행": "border-emerald-400/30 bg-emerald-400/[0.06] text-emerald-300",
  "위기·공포": "border-rose-400/30 bg-rose-400/[0.06] text-rose-300",
  "거품·탐욕": "border-amber-400/30 bg-amber-400/[0.06] text-amber-300",
  장기보유: "border-sky-400/30 bg-sky-400/[0.06] text-sky-300",
  자산배분: "border-violet-400/30 bg-violet-400/[0.06] text-violet-300",
  시장심리: "border-fuchsia-400/30 bg-fuchsia-400/[0.06] text-fuchsia-300",
  레버리지: "border-orange-400/30 bg-orange-400/[0.06] text-orange-300",
  인플레이션: "border-teal-400/30 bg-teal-400/[0.06] text-teal-300",
};

function BuffettContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedYear = searchParams.get("year");
  const tagsParam = searchParams.get("tags");
  const selectedTags = useMemo<Tag[]>(
    () =>
      tagsParam
        ? (tagsParam.split(",").filter((t) => ALL_TAGS.includes(t as Tag)) as Tag[])
        : [],
    [tagsParam]
  );

  const selected = LETTERS.find((l) => String(l.year) === selectedYear);

  function navigateTo(year: number) {
    const qs = selectedTags.length ? `&tags=${selectedTags.join(",")}` : "";
    router.push(`/buffett?year=${year}${qs}`);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  function goBack() {
    const qs = selectedTags.length ? `?tags=${selectedTags.join(",")}` : "";
    router.push(`/buffett${qs}`);
  }

  function toggleTag(tag: Tag) {
    const next = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];
    const qs = next.length ? `?tags=${next.join(",")}` : "";
    router.push(`/buffett${qs}`);
  }

  function clearTags() {
    router.push("/buffett");
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">워렌 버핏 핵심 서한 발췌</h1>
        <p className="mt-1 text-sm text-zinc-500">
          사이클 역행 매매의 원전 — 1986·1987·1996·1999·2002·2008·2009·2011·2013·2017
        </p>
      </div>

      {!selected ? (
        <LetterList
          selectedTags={selectedTags}
          onSelect={navigateTo}
          onToggleTag={toggleTag}
          onClearTags={clearTags}
        />
      ) : (
        <LetterDetail letter={selected} onBack={goBack} onSelect={navigateTo} />
      )}
    </div>
  );
}

function TagFilter({
  selectedTags,
  onToggleTag,
  onClearTags,
}: {
  selectedTags: Tag[];
  onToggleTag: (t: Tag) => void;
  onClearTags: () => void;
}) {
  return (
    <section className="mb-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-zinc-400">
            목적별로 골라 읽기
          </div>
          <div className="mt-0.5 text-[11px] text-zinc-500">
            태그를 여러 개 선택하면 OR 조건으로 필터링됩니다
          </div>
        </div>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearTags}
            className="text-[11px] text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline"
          >
            전체 해제
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {ALL_TAGS.map((tag) => {
          const active = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              onClick={() => onToggleTag(tag)}
              title={TAG_DESCRIPTIONS[tag]}
              className={`rounded-full border px-2.5 py-1 text-[11px] transition-all ${
                active
                  ? TAG_COLORS[tag]
                  : "border-white/[0.08] bg-transparent text-zinc-500 hover:border-white/[0.15] hover:text-zinc-300"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function LetterList({
  selectedTags,
  onSelect,
  onToggleTag,
  onClearTags,
}: {
  selectedTags: Tag[];
  onSelect: (year: number) => void;
  onToggleTag: (t: Tag) => void;
  onClearTags: () => void;
}) {
  const filtered = useMemo(() => {
    if (selectedTags.length === 0) return LETTERS;
    return LETTERS.filter((l) =>
      l.tags.some((t) => selectedTags.includes(t))
    );
  }, [selectedTags]);

  return (
    <>
      <TagFilter
        selectedTags={selectedTags}
        onToggleTag={onToggleTag}
        onClearTags={onClearTags}
      />

      <h2 className="mb-3 flex items-baseline justify-between text-sm font-medium uppercase tracking-wider text-zinc-500">
        <span>서한 목록</span>
        <span className="text-[11px] normal-case tracking-normal text-zinc-600">
          {filtered.length}편 / 전체 {LETTERS.length}편
        </span>
      </h2>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center text-sm text-zinc-500">
          선택한 태그에 해당하는 서한이 없습니다
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filtered.map((letter) => {
            const decade = Math.floor(letter.year / 10) * 10;
            const accent =
              decade === 1980
                ? { text: "text-emerald-400", border: "border-emerald-400/20" }
                : decade === 1990
                  ? { text: "text-sky-400", border: "border-sky-400/20" }
                  : decade === 2000
                    ? { text: "text-amber-400", border: "border-amber-400/20" }
                    : { text: "text-rose-400", border: "border-rose-400/20" };

            return (
              <button
                key={letter.year}
                onClick={() => onSelect(letter.year)}
                className={`group flex items-start gap-4 rounded-xl border ${accent.border} bg-white/[0.02] p-4 text-left transition-all hover:border-white/[0.12] hover:bg-white/[0.06]`}
              >
                <div
                  className={`flex h-12 w-14 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-sm font-bold ${accent.text}`}
                >
                  {letter.year}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-zinc-200 group-hover:text-white">
                    {letter.title}
                  </div>
                  <div className="mt-1 line-clamp-2 text-xs leading-relaxed text-zinc-500">
                    {letter.hook}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {letter.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-1.5 py-0.5 text-[10px] ${
                          selectedTags.includes(tag)
                            ? TAG_COLORS[tag]
                            : "border-white/[0.08] bg-white/[0.02] text-zinc-500"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <svg
                  className="mt-1 h-4 w-4 shrink-0 text-zinc-600 group-hover:text-zinc-400"
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
      )}

      <div className="mt-6 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-zinc-400">
        <p className="mb-2 font-medium text-zinc-300">번역에 관하여</p>
        <p>
          버핏 특유의 위트와 구어체를 살리는 데 중점을 두었다. 원문의 비유와
          농담은 가능한 한 유지했고, 의미가 명확해지도록 일부 문장 구조는
          한국어 흐름에 맞게 조정했다. 전문이 아니라 사이클 역행 매매와 직결되는
          핵심 단락만 발췌. 출처는 각 서한 페이지의 링크 참조.
        </p>
      </div>
    </>
  );
}

function LetterDetail({
  letter,
  onBack,
  onSelect,
}: {
  letter: Letter;
  onBack: () => void;
  onSelect: (year: number) => void;
}) {
  const idx = LETTERS.findIndex((l) => l.year === letter.year);
  const prev = idx > 0 ? LETTERS[idx - 1] : null;
  const next = idx < LETTERS.length - 1 ? LETTERS[idx + 1] : null;

  return (
    <div>
      <button
        onClick={onBack}
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

      <article className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 md:p-7">
        <header className="mb-6 border-b border-white/[0.06] pb-5">
          <div className="text-xs font-medium uppercase tracking-wider text-emerald-400/80">
            {letter.year}년 주주 서한
          </div>
          <h2 className="mt-1.5 text-xl font-semibold text-white md:text-2xl">
            {letter.title}
          </h2>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {letter.tags.map((tag) => (
              <span
                key={tag}
                className={`rounded-full border px-2 py-0.5 text-[11px] ${TAG_COLORS[tag]}`}
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">
            {letter.hook}
          </p>
        </header>

        <section className="mb-6 rounded-lg border border-white/[0.05] bg-white/[0.02] p-4">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
            배경
          </div>
          <p className="text-sm leading-relaxed text-zinc-300">
            {letter.context}
          </p>
        </section>

        <div className="space-y-7">
          {letter.passages.map((p, i) => (
            <div key={i}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-[11px] font-mono text-zinc-600">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-white/[0.06]" />
              </div>

              <blockquote className="mb-3 border-l-2 border-zinc-700 pl-4 text-[13px] italic leading-relaxed text-zinc-500">
                {p.original}
              </blockquote>

              <p className="text-[15px] leading-[1.85] text-zinc-100">
                {p.translation}
              </p>

              {p.note && (
                <div className="mt-3 rounded-md border border-emerald-400/15 bg-emerald-400/[0.04] px-3 py-2 text-xs leading-relaxed text-emerald-100/80">
                  <span className="mr-1.5 font-medium text-emerald-400/90">
                    해설
                  </span>
                  {p.note}
                </div>
              )}
            </div>
          ))}
        </div>

        <footer className="mt-8 border-t border-white/[0.06] pt-4 text-xs text-zinc-500">
          <div className="mb-1 text-[11px] uppercase tracking-wider text-zinc-600">
            원문 (직접 링크)
          </div>
          <a
            href={letter.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 hover:text-zinc-300"
          >
            {(() => {
              const isPdf = letter.sourceUrl.toLowerCase().endsWith(".pdf");
              return (
                <span
                  className={`rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                    isPdf
                      ? "border-rose-400/30 bg-rose-400/[0.06] text-rose-300"
                      : "border-sky-400/30 bg-sky-400/[0.06] text-sky-300"
                  }`}
                >
                  {isPdf ? "PDF" : "HTML"}
                </span>
              );
            })()}
            <span className="break-all font-mono text-[11px]">
              {letter.sourceUrl.replace(/^https?:\/\//, "")}
            </span>
            <svg
              className="h-3 w-3 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </a>
        </footer>
      </article>

      <nav className="mt-4 flex justify-between gap-2">
        {prev ? (
          <button
            onClick={() => onSelect(prev.year)}
            className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <span>←</span>
            <span className="truncate">
              {prev.year} {prev.title}
            </span>
          </button>
        ) : (
          <span />
        )}
        {next ? (
          <button
            onClick={() => onSelect(next.year)}
            className="flex min-w-0 items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white"
          >
            <span className="truncate">
              {next.year} {next.title}
            </span>
            <span>→</span>
          </button>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}

export default function BuffettPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-600 border-t-emerald-400" />
        </div>
      }
    >
      <BuffettContent />
    </Suspense>
  );
}
