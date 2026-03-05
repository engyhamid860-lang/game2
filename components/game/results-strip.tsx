"use client";

import { type RoundResult, SYMBOLS } from "@/lib/game-store";

interface ResultsStripProps {
  results: RoundResult[];
}

export function ResultsStrip({ results }: ResultsStripProps) {
  if (results.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#d4a017]/20 bg-[#0d0520]/80 px-2 py-1.5"
      style={{ backdropFilter: "blur(8px)" }}>
      <div className="flex gap-1 overflow-x-auto pb-0.5" dir="ltr"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
        {results.slice(0, 20).map((r, i) => {
          const c = SYMBOLS[r.symbol].color;
          return (
            <div key={`${r.round}-${i}`}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition-all"
              style={{
                borderColor: `${c}60`,
                background: `${c}15`,
                animation: i === 0 ? "pop-in 0.3s ease-out" : "none",
              }}>
              {r.symbol === "77" ? (
                <span className="text-[10px] font-black" style={{ color: c }}>77</span>
              ) : (
                <span className="text-sm">{r.symbol === "watermelon" ? "\u{1F349}" : "\u{1F351}"}</span>
              )}
            </div>
          );
        })}
      </div>
      <style jsx>{`
        @keyframes pop-in {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        div::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
