"use client";

import { useRef, useEffect, useCallback } from "react";
import { WHEEL_SEGMENTS, SYMBOLS, type Symbol } from "@/lib/game-store";

interface SpinningWheelProps {
  isSpinning: boolean;
  targetSymbol: Symbol | null;
  onSpinEnd: () => void;
  size?: number;
  onTick?: () => void;
}

const SEG_COUNT = WHEEL_SEGMENTS.length;
const SEG_ANGLE = (2 * Math.PI) / SEG_COUNT;

// Draw a watermelon icon
function drawWatermelon(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number) {
  // Outer green rind
  ctx.beginPath();
  ctx.arc(x, y, sz, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = "#15803d";
  ctx.fill();
  // Inner red flesh
  ctx.beginPath();
  ctx.arc(x, y, sz * 0.82, 0, Math.PI, true);
  ctx.closePath();
  ctx.fillStyle = "#ef4444";
  ctx.fill();
  // White rind line
  ctx.beginPath();
  ctx.arc(x, y, sz * 0.88, 0, Math.PI, true);
  ctx.strokeStyle = "#bbf7d0";
  ctx.lineWidth = sz * 0.06;
  ctx.stroke();
  // Seeds
  ctx.fillStyle = "#1a0a2e";
  const seedPositions = [
    [-0.35, -0.2], [0, -0.35], [0.35, -0.2],
    [-0.2, -0.1], [0.2, -0.1],
  ];
  seedPositions.forEach(([sx, sy]) => {
    ctx.beginPath();
    ctx.ellipse(x + sz * sx!, y + sz * sy!, sz * 0.05, sz * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Draw a plum icon
function drawPlum(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number) {
  // Main body
  ctx.beginPath();
  ctx.ellipse(x, y + sz * 0.05, sz * 0.7, sz * 0.8, 0, 0, Math.PI * 2);
  const plumG = ctx.createRadialGradient(x - sz * 0.15, y - sz * 0.2, 0, x, y, sz * 0.9);
  plumG.addColorStop(0, "#c084fc");
  plumG.addColorStop(0.5, "#7c3aed");
  plumG.addColorStop(1, "#4c1d95");
  ctx.fillStyle = plumG;
  ctx.fill();
  // Highlight
  ctx.beginPath();
  ctx.ellipse(x - sz * 0.2, y - sz * 0.25, sz * 0.18, sz * 0.25, -0.4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.2)";
  ctx.fill();
  // Stem
  ctx.beginPath();
  ctx.moveTo(x, y - sz * 0.75);
  ctx.quadraticCurveTo(x + sz * 0.15, y - sz * 1.05, x + sz * 0.05, y - sz * 1.15);
  ctx.strokeStyle = "#4a2800";
  ctx.lineWidth = sz * 0.08;
  ctx.lineCap = "round";
  ctx.stroke();
  // Leaf
  ctx.beginPath();
  ctx.ellipse(x + sz * 0.2, y - sz * 0.95, sz * 0.15, sz * 0.08, 0.5, 0, Math.PI * 2);
  ctx.fillStyle = "#22c55e";
  ctx.fill();
}

// Draw 77 text
function draw77(ctx: CanvasRenderingContext2D, x: number, y: number, sz: number) {
  ctx.save();
  ctx.font = `900 ${sz * 1.2}px sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Glow
  ctx.shadowColor = "#ec4899";
  ctx.shadowBlur = sz * 0.6;
  // Outline
  ctx.strokeStyle = "#be185d";
  ctx.lineWidth = sz * 0.15;
  ctx.strokeText("77", x, y);
  // Fill gradient
  const tg = ctx.createLinearGradient(x - sz, y - sz, x + sz, y + sz);
  tg.addColorStop(0, "#fda4d4");
  tg.addColorStop(0.5, "#ec4899");
  tg.addColorStop(1, "#be185d");
  ctx.fillStyle = tg;
  ctx.fillText("77", x, y);
  ctx.shadowBlur = 0;
  ctx.restore();
}

export function SpinningWheel({ isSpinning, targetSymbol, onSpinEnd, size = 300, onTick }: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotationRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const isSpinningRef = useRef(false);
  const lastSegRef = useRef(-1);

  const drawWheel = useCallback((rotation: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = size;
    const h = size;
    if (canvas.width !== w * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2, cy = h / 2;
    const outerR = w / 2 - 4;
    const rimW = w * 0.045;
    const r = outerR - rimW;
    const iconR = r * 0.63;
    const iconSz = r * 0.12;

    ctx.clearRect(0, 0, w, h);

    // === OUTER DECORATIVE RIM ===
    // Dark base ring
    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = "#0d0520";
    ctx.fill();

    // Gold rim gradient
    ctx.beginPath();
    ctx.arc(cx, cy, outerR - 1, 0, Math.PI * 2);
    ctx.arc(cx, cy, r + 1, 0, Math.PI * 2, true);
    const rimG = ctx.createRadialGradient(cx, cy, r, cx, cy, outerR);
    rimG.addColorStop(0, "#8a6914");
    rimG.addColorStop(0.3, "#f5e06a");
    rimG.addColorStop(0.55, "#d4a017");
    rimG.addColorStop(0.8, "#f5e06a");
    rimG.addColorStop(1, "#8a6914");
    ctx.fillStyle = rimG;
    ctx.fill();

    // Engraved rim notches
    const notchCount = 48;
    for (let i = 0; i < notchCount; i++) {
      const a = (i / notchCount) * Math.PI * 2;
      const nr = (r + outerR) / 2;
      const nx = cx + Math.cos(a) * nr;
      const ny = cy + Math.sin(a) * nr;
      ctx.beginPath();
      ctx.arc(nx, ny, rimW * 0.12, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? "#f5e06a30" : "#8a691430";
      ctx.fill();
    }

    // Light bulb studs
    const studCount = 24;
    const bulbPhase = Math.floor(Date.now() / 250);
    for (let i = 0; i < studCount; i++) {
      const a = (i / studCount) * Math.PI * 2;
      const sr = (r + outerR) / 2;
      const sx = cx + Math.cos(a) * sr;
      const sy = cy + Math.sin(a) * sr;
      const active = (bulbPhase + i) % 3 === 0;

      if (active) {
        ctx.beginPath();
        ctx.arc(sx, sy, rimW * 0.3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,248,220,0.15)";
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, rimW * 0.18, 0, Math.PI * 2);
      const bulbG = ctx.createRadialGradient(sx, sy, 0, sx, sy, rimW * 0.18);
      if (active) {
        bulbG.addColorStop(0, "#fffacd");
        bulbG.addColorStop(0.6, "#ffd700");
        bulbG.addColorStop(1, "#b8860b");
      } else {
        bulbG.addColorStop(0, "#8a6914");
        bulbG.addColorStop(1, "#5a4510");
      }
      ctx.fillStyle = bulbG;
      ctx.fill();
    }

    // === SEGMENTS ===
    WHEEL_SEGMENTS.forEach((symbol, i) => {
      const sa = rotation + i * SEG_ANGLE;
      const ea = sa + SEG_ANGLE;
      const info = SYMBOLS[symbol];
      const mid = sa + SEG_ANGLE / 2;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, sa, ea);
      ctx.closePath();

      // Rich segment gradient
      const gx = cx + Math.cos(mid) * r * 0.5;
      const gy = cy + Math.sin(mid) * r * 0.5;
      const sg = ctx.createRadialGradient(cx, cy, r * 0.08, gx, gy, r);
      sg.addColorStop(0, info.colorLight + "50");
      sg.addColorStop(0.3, info.color + "cc");
      sg.addColorStop(0.7, info.color);
      sg.addColorStop(1, info.colorDark);
      ctx.fillStyle = sg;
      ctx.fill();

      // Segment divider - gold line
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(sa) * (r * 0.22), cy + Math.sin(sa) * (r * 0.22));
      ctx.lineTo(cx + Math.cos(sa) * r, cy + Math.sin(sa) * r);
      ctx.strokeStyle = "#d4a01790";
      ctx.lineWidth = 2;
      ctx.stroke();

      // Inner arc decorative line
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.38, sa + 0.02, ea - 0.02);
      ctx.strokeStyle = "rgba(255,255,255,0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Outer highlight arc
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.95, sa + 0.04, ea - 0.04);
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Draw icons
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(mid);
      ctx.translate(iconR, 0);
      ctx.rotate(-mid);

      const ix = 0, iy = 0;
      if (symbol === "watermelon") {
        ctx.save();
        ctx.rotate(mid + Math.PI / 2);
        drawWatermelon(ctx, ix, iy, iconSz);
        ctx.restore();
      } else if (symbol === "plum") {
        drawPlum(ctx, ix, iy, iconSz);
      } else {
        draw77(ctx, ix, iy, iconSz);
      }
      ctx.restore();
    });

    // === INNER RING ===
    // Gold inner ring
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.23, 0, Math.PI * 2);
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2, true);
    const irG = ctx.createRadialGradient(cx, cy, r * 0.15, cx, cy, r * 0.25);
    irG.addColorStop(0, "#8a6914");
    irG.addColorStop(0.4, "#f5e06a");
    irG.addColorStop(0.7, "#d4a017");
    irG.addColorStop(1, "#8a6914");
    ctx.fillStyle = irG;
    ctx.fill();

    // Center hub
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2);
    const hubG = ctx.createRadialGradient(cx - r * 0.03, cy - r * 0.03, 0, cx, cy, r * 0.18);
    hubG.addColorStop(0, "#2a1050");
    hubG.addColorStop(0.7, "#150830");
    hubG.addColorStop(1, "#0d0520");
    ctx.fillStyle = hubG;
    ctx.fill();

    // Center diamond
    const ds = r * 0.09;
    ctx.beginPath();
    ctx.moveTo(cx, cy - ds);
    ctx.lineTo(cx + ds, cy);
    ctx.lineTo(cx, cy + ds);
    ctx.lineTo(cx - ds, cy);
    ctx.closePath();
    const dG = ctx.createLinearGradient(cx - ds, cy - ds, cx + ds, cy + ds);
    dG.addColorStop(0, "#f5e06a");
    dG.addColorStop(0.5, "#ffd700");
    dG.addColorStop(1, "#8a6914");
    ctx.fillStyle = dG;
    ctx.fill();
    ctx.strokeStyle = "#d4a017";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Pin studs on inner ring
    for (let i = 0; i < SEG_COUNT; i++) {
      const a = rotation + i * SEG_ANGLE + SEG_ANGLE / 2;
      const px = cx + Math.cos(a) * (r * 0.21);
      const py = cy + Math.sin(a) * (r * 0.21);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      const pinG = ctx.createRadialGradient(px, py, 0, px, py, 2.5);
      pinG.addColorStop(0, "#ffd700");
      pinG.addColorStop(1, "#8a6914");
      ctx.fillStyle = pinG;
      ctx.fill();
    }

    // Tick detection - which segment is at top (pointer position)
    if (isSpinningRef.current && onTick) {
      const pointerAngle = -Math.PI / 2;
      let normalized = ((pointerAngle - rotation) % (Math.PI * 2) + Math.PI * 4) % (Math.PI * 2);
      const segIndex = Math.floor(normalized / SEG_ANGLE) % SEG_COUNT;
      if (segIndex !== lastSegRef.current) {
        lastSegRef.current = segIndex;
        onTick();
      }
    }
  }, [size, onTick]);

  // Idle bulb animation
  useEffect(() => {
    let id: number;
    const tick = () => {
      if (!isSpinningRef.current) {
        drawWheel(rotationRef.current);
      }
      id = requestAnimationFrame(tick);
    };
    id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [drawWheel]);

  // Spin animation with variable speed: fast 5 spins, brief slow, fast again, then ease out
  useEffect(() => {
    if (!isSpinning || !targetSymbol) return;
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
    lastSegRef.current = -1;

    const targetIndex = WHEEL_SEGMENTS.findIndex((s) => s === targetSymbol);
    const targetCenter = targetIndex * SEG_ANGLE + SEG_ANGLE / 2;
    // Pointer at top (-PI/2), so we need rotation such that targetCenter aligns
    const baseTarget = -(Math.PI / 2) - targetCenter;
    // Total: 8-10 full spins worth of rotation
    const totalSpins = 8 + Math.random() * 2;
    const targetRot = baseTarget - totalSpins * 2 * Math.PI;
    const startRot = rotationRef.current;
    const totalDelta = targetRot - startRot;
    const duration = 6500;
    const startTime = performance.now();

    // Custom easing: fast -> brief slow at ~60% -> fast burst -> final slow
    const customEase = (t: number): number => {
      if (t < 0.55) {
        // Fast phase with slight acceleration
        return t * 0.65 / 0.55;
      } else if (t < 0.65) {
        // Brief slowdown (dramatic pause)
        const local = (t - 0.55) / 0.1;
        return 0.65 + local * 0.08;
      } else if (t < 0.78) {
        // Quick burst again
        const local = (t - 0.65) / 0.13;
        return 0.73 + local * 0.12;
      } else {
        // Final ease out (quartic)
        const local = (t - 0.78) / 0.22;
        const eased = 1 - Math.pow(1 - local, 4);
        return 0.85 + eased * 0.15;
      }
    };

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = customEase(progress);
      const cur = startRot + totalDelta * eased;
      rotationRef.current = cur;
      drawWheel(cur);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        isSpinningRef.current = false;
        onSpinEnd();
      }
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isSpinning, targetSymbol, drawWheel, onSpinEnd]);

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer triangle - frame style like the screenshot */}
      <div className="relative z-20 mb-[-12px]">
        <svg width="40" height="36" viewBox="0 0 40 36" fill="none">
          <defs>
            <linearGradient id="ptr-fill" x1="20" y1="0" x2="20" y2="36">
              <stop offset="0%" stopColor="#f5e06a" />
              <stop offset="40%" stopColor="#d4a017" />
              <stop offset="100%" stopColor="#8a6914" />
            </linearGradient>
            <linearGradient id="ptr-stroke" x1="20" y1="0" x2="20" y2="36">
              <stop offset="0%" stopColor="#ffd700" />
              <stop offset="100%" stopColor="#a67c00" />
            </linearGradient>
            <filter id="ptr-glow">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#d4a017" floodOpacity="0.6" />
            </filter>
          </defs>
          {/* Outer frame triangle */}
          <polygon points="20,36 3,4 37,4" fill="url(#ptr-fill)" stroke="url(#ptr-stroke)" strokeWidth="2" filter="url(#ptr-glow)" />
          {/* Inner cutout for frame effect */}
          <polygon points="20,28 10,8 30,8" fill="#1a0a2e" />
          {/* Small gem at top */}
          <circle cx="20" cy="6" r="3" fill="#ffd700" />
        </svg>
      </div>

      {/* Wheel canvas */}
      <div className="relative">
        <canvas ref={canvasRef} style={{ width: size, height: size }} className="rounded-full" />

        {/* Glow overlay when spinning */}
        {isSpinning && (
          <div className="pointer-events-none absolute inset-[-8px] rounded-full"
            style={{
              boxShadow: "0 0 50px rgba(212,160,23,0.4), 0 0 100px rgba(212,160,23,0.15)",
              animation: "wheel-pulse 0.6s ease-in-out infinite alternate",
            }} />
        )}
      </div>

      {/* Pillar base under wheel */}
      <div className="relative z-10 mt-[-6px] flex items-end justify-center gap-0" style={{ width: size }}>
        {/* Left pillar */}
        <div className="relative flex flex-col items-center">
          {/* Pillar capital */}
          <div className="h-2 rounded-t-sm"
            style={{
              width: size * 0.12,
              background: "linear-gradient(180deg, #f5e06a, #d4a017, #8a6914)",
            }} />
          {/* Pillar shaft */}
          <div
            style={{
              width: size * 0.08,
              height: size * 0.18,
              background: "linear-gradient(90deg, #8a6914, #d4a017 30%, #f5e06a 50%, #d4a017 70%, #8a6914)",
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
            }} />
          {/* Pillar base */}
          <div className="h-2 rounded-b-sm"
            style={{
              width: size * 0.14,
              background: "linear-gradient(180deg, #8a6914, #d4a017, #f5e06a)",
            }} />
        </div>

        {/* Center platform connecting pillars */}
        <div className="flex flex-col items-center" style={{ width: size * 0.56, marginTop: size * 0.01 }}>
          {/* Top ornament bar */}
          <div className="h-1.5 w-full rounded-sm"
            style={{ background: "linear-gradient(90deg, #8a6914, #f5e06a, #d4a017, #f5e06a, #8a6914)" }} />
          {/* Velvet/dark center */}
          <div className="w-full"
            style={{
              height: size * 0.15,
              background: "linear-gradient(180deg, #150830 0%, #0d0520 50%, #050210 100%)",
              borderLeft: "2px solid #d4a01740",
              borderRight: "2px solid #d4a01740",
            }} />
          {/* Bottom bar */}
          <div className="h-1.5 w-full rounded-sm"
            style={{ background: "linear-gradient(90deg, #8a6914, #f5e06a, #d4a017, #f5e06a, #8a6914)" }} />
        </div>

        {/* Right pillar */}
        <div className="relative flex flex-col items-center">
          <div className="h-2 rounded-t-sm"
            style={{
              width: size * 0.12,
              background: "linear-gradient(180deg, #f5e06a, #d4a017, #8a6914)",
            }} />
          <div
            style={{
              width: size * 0.08,
              height: size * 0.18,
              background: "linear-gradient(90deg, #8a6914, #d4a017 30%, #f5e06a 50%, #d4a017 70%, #8a6914)",
              boxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
            }} />
          <div className="h-2 rounded-b-sm"
            style={{
              width: size * 0.14,
              background: "linear-gradient(180deg, #8a6914, #d4a017, #f5e06a)",
            }} />
        </div>
      </div>

      <style jsx>{`
        @keyframes wheel-pulse {
          from { box-shadow: 0 0 50px rgba(212,160,23,0.4), 0 0 100px rgba(212,160,23,0.15); }
          to { box-shadow: 0 0 70px rgba(212,160,23,0.6), 0 0 140px rgba(212,160,23,0.25); }
        }
      `}</style>
    </div>
  );
}
