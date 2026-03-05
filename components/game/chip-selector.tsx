"use client";

import { CHIP_VALUES } from "@/lib/game-store";

interface ChipSelectorProps {
  selectedChip: number;
  onSelectChip: (value: number) => void;
}

const CHIP_COLORS: Record<number, { bg: string; ring: string; text: string }> = {
  500: { bg: "#0a3d1e", ring: "#22c55e", text: "#4ade80" },
  1000: { bg: "#0f2a4a", ring: "#3b82f6", text: "#60a5fa" },
  10000: { bg: "#3d0a2a", ring: "#ec4899", text: "#f472b6" },
  100000: { bg: "#3d300a", ring: "#d4a017", text: "#f5d060" },
};

export function ChipSelector({ selectedChip, onSelectChip }: ChipSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-2.5">
      {CHIP_VALUES.map((value) => {
        const c = CHIP_COLORS[value] || { bg: "#1a1a2e", ring: "#888", text: "#ccc" };
        const sel = selectedChip === value;
        const label = value >= 1000 ? `${value / 1000}K` : String(value);
        const chipSize = sel ? 56 : 46;

        return (
          <button key={value} onClick={() => onSelectChip(value)}
            className="relative flex items-center justify-center rounded-full transition-all duration-200"
            style={{
              width: chipSize,
              height: chipSize,
              background: `radial-gradient(circle at 40% 35%, ${c.ring}30, ${c.bg})`,
              border: `3px solid ${c.ring}`,
              boxShadow: sel
                ? `0 0 20px ${c.ring}80, 0 0 40px ${c.ring}30, 0 4px 12px rgba(0,0,0,0.5), inset 0 0 12px ${c.ring}20`
                : `0 3px 8px rgba(0,0,0,0.5), inset 0 1px 0 ${c.ring}20`,
              transform: sel ? "translateY(-6px) scale(1.05)" : "translateY(0) scale(1)",
            }}>
            {/* Inner dashed ring */}
            <div className="absolute rounded-full"
              style={{
                inset: 4,
                border: `1.5px dashed ${c.ring}40`,
              }} />
            {/* Edge notches */}
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <div key={deg} className="absolute"
                style={{
                  width: 2.5, height: 5,
                  background: c.ring,
                  opacity: sel ? 0.7 : 0.3,
                  top: "50%", left: "50%",
                  transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${chipSize / 2 - 2}px)`,
                  borderRadius: 1,
                }} />
            ))}
            <span className="relative z-10 font-black"
              style={{
                fontSize: value >= 100000 ? 9 : 11,
                color: sel ? "#fff" : c.text,
                textShadow: sel ? `0 0 8px ${c.ring}` : "none",
              }}>
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
