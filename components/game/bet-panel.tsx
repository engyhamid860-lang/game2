"use client";

import { SYMBOLS, type Symbol, type BetState } from "@/lib/game-store";
import { useEffect, useRef } from "react";

interface BetPanelProps {
  bets: BetState;
  selectedChip: number;
  onPlaceBet: (symbol: Symbol) => void;
  disabled: boolean;
  lockedFruit: Symbol | null;
}

export function BetPanel({ bets, selectedChip, onPlaceBet, disabled, lockedFruit }: BetPanelProps) {
  const slots: { symbol: Symbol; label: string }[] = [
    { symbol: "watermelon", label: "بطيخ" },
    { symbol: "77", label: "77" },
    { symbol: "plum", label: "برقوق" },
  ];

  return (
    <div className="flex w-full items-stretch justify-center gap-2 px-1">
      {slots.map(({ symbol, label }) => {
        const info = SYMBOLS[symbol];
        const betAmount = bets[symbol];
        const isFruit = symbol !== "77";
        const isLocked = isFruit && lockedFruit !== null && lockedFruit !== symbol;
        const isDisabled = disabled || isLocked;

        return (
          <BetSlot
            key={symbol}
            symbol={symbol}
            label={label}
            info={info}
            betAmount={betAmount}
            selectedChip={selectedChip}
            disabled={isDisabled}
            locked={isLocked}
            onPlace={() => onPlaceBet(symbol)}
          />
        );
      })}
    </div>
  );
}

interface BetSlotProps {
  symbol: Symbol;
  label: string;
  info: { color: string; colorDark: string; colorLight: string; multiplier: number };
  betAmount: number;
  selectedChip: number;
  disabled: boolean;
  locked: boolean;
  onPlace: () => void;
}

function BetSlot({ symbol, label, info, betAmount, selectedChip, disabled, locked, onPlace }: BetSlotProps) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const prevBet = useRef(betAmount);

  useEffect(() => {
    if (betAmount > prevBet.current && btnRef.current) {
      btnRef.current.style.transform = "scale(1.08)";
      btnRef.current.style.transition = "transform 0.12s ease-out";
      setTimeout(() => {
        if (btnRef.current) {
          btnRef.current.style.transform = "scale(1)";
          btnRef.current.style.transition = "transform 0.2s ease-out";
        }
      }, 120);
    }
    prevBet.current = betAmount;
  }, [betAmount]);

  const chipLabel = selectedChip >= 1000 ? `${(selectedChip / 1000).toFixed(0)}K` : String(selectedChip);
  const potentialWin = betAmount * info.multiplier;
  const hasBet = betAmount > 0;

  return (
    <button
      ref={btnRef}
      onClick={onPlace}
      disabled={disabled}
      className="group relative flex flex-1 flex-col items-center overflow-hidden rounded-2xl border-2 pb-2 pt-3"
      style={{
        borderColor: locked ? "#ffffff10" : hasBet ? info.color : `${info.color}40`,
        background: locked
          ? "linear-gradient(180deg, rgba(13,5,32,0.5) 0%, rgba(13,5,32,0.8) 100%)"
          : `linear-gradient(180deg, ${info.colorDark}30 0%, ${info.colorDark}15 100%)`,
        opacity: locked ? 0.3 : disabled && !locked ? 0.6 : 1,
        boxShadow: hasBet
          ? `0 0 24px ${info.color}25, inset 0 0 20px ${info.color}08, 0 4px 16px rgba(0,0,0,0.3)`
          : "0 4px 12px rgba(0,0,0,0.3)",
      }}
    >
      {/* Glow ring when has bet */}
      {hasBet && !locked && (
        <div className="pointer-events-none absolute inset-0 rounded-2xl"
          style={{
            boxShadow: `inset 0 0 30px ${info.color}15`,
            animation: "bet-glow 2s ease-in-out infinite alternate",
          }} />
      )}

      {/* Multiplier badge */}
      <div className="absolute -right-px -top-px z-10 rounded-bl-xl rounded-tr-2xl px-2.5 py-1"
        style={{
          background: `linear-gradient(135deg, ${info.colorLight}, ${info.color})`,
          boxShadow: `0 2px 10px ${info.color}50`,
        }}>
        <span className="text-[11px] font-black text-white" style={{ textShadow: "0 1px 2px rgba(0,0,0,0.3)" }}>
          x{info.multiplier}
        </span>
      </div>

      {/* Symbol display */}
      <div className="relative mb-2 flex h-14 w-14 items-center justify-center rounded-full border-2"
        style={{
          borderColor: hasBet ? info.color : `${info.color}50`,
          background: `radial-gradient(circle at 40% 35%, ${info.colorLight}20, ${info.colorDark}30)`,
          boxShadow: hasBet ? `0 0 20px ${info.color}30, inset 0 0 10px ${info.color}10` : `0 0 8px ${info.color}10`,
        }}>
        {symbol === "77" ? (
          <span className="text-2xl font-black" style={{
            background: `linear-gradient(135deg, ${info.colorLight}, ${info.color})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            filter: `drop-shadow(0 0 4px ${info.color}60)`,
          }}>77</span>
        ) : symbol === "watermelon" ? (
          <svg width="28" height="28" viewBox="0 0 28 28">
            <path d="M4 18 A12 12 0 0 1 24 18 Z" fill="#15803d" />
            <path d="M6 18 A10 10 0 0 1 22 18 Z" fill="#ef4444" />
            <path d="M5.5 18 A10.5 10.5 0 0 1 22.5 18" stroke="#bbf7d0" strokeWidth="1" fill="none" />
            <circle cx="10" cy="15" r="1" fill="#1a0a2e" />
            <circle cx="14" cy="13" r="1" fill="#1a0a2e" />
            <circle cx="18" cy="15" r="1" fill="#1a0a2e" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 26 26">
            <ellipse cx="13" cy="14" rx="8" ry="9" fill="url(#plum-g)" />
            <ellipse cx="10" cy="10" rx="2.5" ry="3.5" fill="rgba(255,255,255,0.15)" transform="rotate(-15 10 10)" />
            <path d="M13 5 Q15 2 14 1" stroke="#4a2800" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <ellipse cx="16" cy="3" rx="2" ry="1" fill="#22c55e" transform="rotate(25 16 3)" />
            <defs>
              <radialGradient id="plum-g" cx="0.4" cy="0.35">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="60%" stopColor="#7c3aed" />
                <stop offset="100%" stopColor="#4c1d95" />
              </radialGradient>
            </defs>
          </svg>
        )}

        {/* Stacked chips badge */}
        {hasBet && (
          <div className="absolute -bottom-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full px-1"
            style={{
              background: `linear-gradient(135deg, ${info.colorLight}, ${info.color})`,
              boxShadow: `0 2px 6px ${info.color}60`,
            }}>
            <span className="text-[8px] font-black text-white">
              {betAmount >= 1000 ? `${(betAmount / 1000).toFixed(betAmount % 1000 === 0 ? 0 : 1)}K` : betAmount}
            </span>
          </div>
        )}
      </div>

      {/* Label */}
      <span className="mb-1 text-[11px] font-bold" style={{ color: info.color }}>{label}</span>

      {/* Bet amount with coin icon */}
      <div className="mb-0.5 flex items-center gap-1 rounded-full px-3 py-0.5"
        style={{ background: `${info.color}10`, border: `1px solid ${info.color}20` }}>
        <div className="h-3 w-3 rounded-full"
          style={{
            background: "radial-gradient(circle at 35% 35%, #f5e06a, #d4a017, #8a6914)",
            boxShadow: "0 0 3px #f5d06060",
          }} />
        <span className="text-xs font-bold text-[#f5d060]">{hasBet ? betAmount.toLocaleString() : "0"}</span>
      </div>

      {/* Potential win */}
      {hasBet && (
        <div className="flex items-center gap-1">
          <span className="text-[9px] text-[#22c55e]/70">{"فوز:"}</span>
          <span className="text-[10px] font-bold text-[#22c55e]">{potentialWin.toLocaleString()}</span>
        </div>
      )}

      {/* Click hint */}
      {!disabled && !locked && (
        <div className="mt-1 flex h-5 items-center justify-center rounded-full px-2"
          style={{ background: `${info.color}15`, border: `1px dashed ${info.color}35` }}>
          <span className="text-[9px] font-semibold" style={{ color: `${info.color}90` }}>+{chipLabel}</span>
        </div>
      )}

      {/* Lock icon */}
      {locked && (
        <div className="mt-1 flex items-center justify-center">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff30" strokeWidth="2.5" strokeLinecap="round">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
      )}

      <style jsx>{`
        @keyframes bet-glow {
          from { opacity: 0.6; }
          to { opacity: 1; }
        }
      `}</style>
    </button>
  );
}
