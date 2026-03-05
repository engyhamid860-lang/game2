"use client";

import { useEffect, useState, useRef } from "react";

interface LoadingScreenProps {
  onComplete: () => void;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [showEnter, setShowEnter] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  // Draw animated wheel logo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = 200;
    canvas.width = s * dpr;
    canvas.height = s * dpr;
    canvas.style.width = `${s}px`;
    canvas.style.height = `${s}px`;
    ctx.scale(dpr, dpr);

    let rot = 0;
    const segAngle = (2 * Math.PI) / 12;
    const colors: [string, string][] = [
      ["#4ade80", "#15803d"], ["#a78bfa", "#5b21b6"],
      ["#4ade80", "#15803d"], ["#a78bfa", "#5b21b6"],
      ["#4ade80", "#15803d"], ["#f472b6", "#be185d"],
      ["#a78bfa", "#5b21b6"], ["#4ade80", "#15803d"],
      ["#a78bfa", "#5b21b6"], ["#4ade80", "#15803d"],
      ["#a78bfa", "#5b21b6"], ["#f472b6", "#be185d"],
    ];

    const draw = () => {
      ctx.clearRect(0, 0, s, s);
      const cx = s / 2, cy = s / 2, r = s / 2 - 14;

      // Outer gold ring
      ctx.beginPath();
      ctx.arc(cx, cy, r + 10, 0, Math.PI * 2);
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2, true);
      const rg = ctx.createRadialGradient(cx, cy, r, cx, cy, r + 12);
      rg.addColorStop(0, "#8a6914");
      rg.addColorStop(0.3, "#f5e06a");
      rg.addColorStop(0.6, "#d4a017");
      rg.addColorStop(1, "#8a6914");
      ctx.fillStyle = rg;
      ctx.fill();

      // Bulbs
      const bulbPhase = Math.floor(Date.now() / 200);
      for (let i = 0; i < 20; i++) {
        const a = (i / 20) * Math.PI * 2;
        const bx = cx + Math.cos(a) * (r + 6);
        const by = cy + Math.sin(a) * (r + 6);
        const active = (bulbPhase + i) % 3 === 0;
        ctx.beginPath();
        ctx.arc(bx, by, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = active ? "#ffd700" : "#5a4510";
        ctx.fill();
      }

      // Segments
      for (let i = 0; i < 12; i++) {
        const sa = rot + i * segAngle;
        const ea = sa + segAngle;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, sa, ea);
        ctx.closePath();
        const sg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        sg.addColorStop(0, colors[i][0] + "60");
        sg.addColorStop(1, colors[i][1]);
        ctx.fillStyle = sg;
        ctx.fill();
        // Divider
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(sa) * r, cy + Math.sin(sa) * r);
        ctx.strokeStyle = "#d4a01760";
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Center hub
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      const hG = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      hG.addColorStop(0, "#f5e06a");
      hG.addColorStop(0.5, "#d4a017");
      hG.addColorStop(1, "#8a6914");
      ctx.fillStyle = hG;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(cx, cy, 20, 0, Math.PI * 2);
      ctx.fillStyle = "#1a0a2e";
      ctx.fill();

      // Center "77"
      ctx.font = "900 18px sans-serif";
      ctx.fillStyle = "#f5d060";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("77", cx, cy);

      rot += 0.015;
      animRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  // Progress
  useEffect(() => {
    const iv = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(iv);
          setTimeout(() => setShowEnter(true), 300);
          return 100;
        }
        return p + Math.random() * 3 + 1.5;
      });
    }, 50);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at center, #1a0a2e 0%, #0d0520 70%, #050210 100%)" }}>

      {/* Floating particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 30 }).map((_, i) => (
          <div key={i} className="absolute rounded-full"
            style={{
              width: 2 + Math.random() * 3,
              height: 2 + Math.random() * 3,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: ["#f5d060", "#ec4899", "#22c55e", "#7c3aed", "#3b82f6"][i % 5],
              opacity: 0.2 + Math.random() * 0.4,
              animation: `particle-float ${4 + Math.random() * 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 4}s`,
            }} />
        ))}
      </div>

      {/* Ambient glow */}
      <div className="absolute left-1/4 top-1/3 h-56 w-56 rounded-full bg-[#7c3aed]/10 blur-[120px]" />
      <div className="absolute bottom-1/3 right-1/4 h-56 w-56 rounded-full bg-[#ec4899]/8 blur-[120px]" />
      <div className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#d4a017]/10 blur-[80px]" />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Wheel logo */}
        <div className="relative">
          <div className="absolute inset-[-16px] rounded-full"
            style={{ boxShadow: "0 0 80px rgba(212,160,23,0.3), 0 0 160px rgba(212,160,23,0.1)" }} />
          <canvas ref={canvasRef} style={{ width: 200, height: 200 }} className="relative z-10 rounded-full" />
        </div>

        {/* Title branding */}
        <div className="text-center">
          <h1 className="text-5xl font-black tracking-tight"
            style={{
              background: "linear-gradient(135deg, #f5e06a 0%, #d4a017 35%, #f5e06a 50%, #a67c00 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              filter: "drop-shadow(0 4px 12px rgba(212,160,23,0.4))",
            }}>
            {"عجلة الفاكهة"}
          </h1>
          <div className="mt-2 flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-12"
              style={{ background: "linear-gradient(90deg, transparent, #d4a017)" }} />
            <span className="text-xs font-bold tracking-[0.3em] text-[#d4a017]/60">FRUIT WHEEL</span>
            <div className="h-px flex-1 max-w-12"
              style={{ background: "linear-gradient(90deg, #d4a017, transparent)" }} />
          </div>
        </div>

        {/* Progress or Enter */}
        {!showEnter ? (
          <div className="w-64">
            <div className="h-3 overflow-hidden rounded-full border border-[#d4a017]/40 bg-[#0d0520]"
              style={{ boxShadow: "inset 0 2px 4px rgba(0,0,0,0.5)" }}>
              <div className="h-full rounded-full transition-all duration-100"
                style={{
                  width: `${Math.min(progress, 100)}%`,
                  background: "linear-gradient(90deg, #8a6914, #d4a017, #f5e06a, #d4a017)",
                  boxShadow: "0 0 16px rgba(245,208,96,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
                }} />
            </div>
            <p className="mt-3 text-center text-xs font-semibold text-[#d4a017]/50">
              {"جاري التحميل..."} {Math.min(Math.round(progress), 100)}%
            </p>
          </div>
        ) : (
          <button onClick={onComplete}
            className="group relative overflow-hidden rounded-2xl border-2 border-[#d4a017] px-14 py-4 transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #f5e06a, #d4a017, #a67c00)",
              boxShadow: "0 0 40px rgba(212,160,23,0.4), 0 6px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.3)",
              animation: "enter-pulse 2s ease-in-out infinite",
            }}>
            {/* Shimmer */}
            <div className="absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.4) 50%, transparent 75%)",
                animation: "shimmer 2.5s ease-in-out infinite",
              }} />
            <span className="relative z-10 text-xl font-black text-[#1a0a2e]"
              style={{ textShadow: "0 1px 0 rgba(245,224,106,0.5)" }}>
              {"ادخل اللعبة"}
            </span>
          </button>
        )}
      </div>

      <style jsx>{`
        @keyframes particle-float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.2; }
          50% { transform: translateY(-25px) scale(1.3); opacity: 0.6; }
        }
        @keyframes enter-pulse {
          0%, 100% { box-shadow: 0 0 40px rgba(212,160,23,0.4), 0 6px 24px rgba(0,0,0,0.4); }
          50% { box-shadow: 0 0 60px rgba(212,160,23,0.6), 0 6px 30px rgba(0,0,0,0.4); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
