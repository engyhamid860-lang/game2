"use client";

import { type PlayerBet, SYMBOLS } from "@/lib/game-store";

interface LiveBetsProps {
  playerBets: PlayerBet[];
}

export function LiveBets({ playerBets }: LiveBetsProps) {
  if (playerBets.length === 0) return null;

  return (
    <div className="w-full overflow-hidden rounded-xl border border-[#d4a017]/20 bg-[#0d0520]/80 p-2"
      style={{ backdropFilter: "blur(8px)" }}>
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-[10px] font-bold text-[#d4a017]/60">{"رهانات اللاعبين"}</span>
        <div className="flex items-center gap-1">
          <div className="h-1.5 w-1.5 rounded-full bg-[#22c55e]" style={{ animation: "blink 1.5s ease-in-out infinite" }} />
          <span className="text-[9px] text-[#22c55e]/80">{"مباشر"}</span>
        </div>
      </div>
      <div className="flex flex-col gap-1 overflow-y-auto" style={{ maxHeight: 120, scrollbarWidth: "none" }}>
        {playerBets.map((p) => (
          <div key={p.id} className="flex items-center gap-2 rounded-lg bg-[#1a0a2e]/60 px-2 py-1.5">
            {/* Avatar */}
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#2a1050] text-[10px] font-bold text-[#d4a017]/80">
              {p.avatar}
            </div>
            {/* Name */}
            <span className="min-w-0 flex-1 truncate text-[10px] font-semibold text-[#d4a017]/80">{p.name}</span>
            {/* Bets placed */}
            <div className="flex items-center gap-1.5">
              {p.fruitBet && (
                <div className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
                  style={{ background: `${SYMBOLS[p.fruitBet.symbol].color}20`, border: `1px solid ${SYMBOLS[p.fruitBet.symbol].color}40` }}>
                  <span className="text-[10px]">{p.fruitBet.symbol === "watermelon" ? "\u{1F349}" : "\u{1F351}"}</span>
                  <span className="text-[9px] font-bold text-[#f5d060]">
                    {p.fruitBet.amount >= 1000 ? `${(p.fruitBet.amount / 1000).toFixed(0)}K` : p.fruitBet.amount}
                  </span>
                </div>
              )}
              {p.sevenBet > 0 && (
                <div className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
                  style={{ background: `${SYMBOLS["77"].color}20`, border: `1px solid ${SYMBOLS["77"].color}40` }}>
                  <span className="text-[9px] font-black text-[#ec4899]">77</span>
                  <span className="text-[9px] font-bold text-[#f5d060]">
                    {p.sevenBet >= 1000 ? `${(p.sevenBet / 1000).toFixed(0)}K` : p.sevenBet}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}
