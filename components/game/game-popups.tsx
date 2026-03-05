"use client";

import { X, Trophy } from "lucide-react";
import { type RoundResult, type PlayerBet, SYMBOLS, type Symbol } from "@/lib/game-store";

// ========================
// RESULT ANNOUNCEMENT POPUP
// ========================
interface ResultAnnouncementProps {
  result: Symbol;
  playerBets: PlayerBet[];
  userBets: { watermelon: number; plum: number; "77": number };
  userWin: number;
  onClose: () => void;
}

export function ResultAnnouncement({ result, playerBets, userBets, userWin, onClose }: ResultAnnouncementProps) {
  const info = SYMBOLS[result];
  const totalUserBet = userBets.watermelon + userBets.plum + userBets["77"];

  // Determine which players won
  const winners: { name: string; avatar: string; bet: number; win: number }[] = [];
  playerBets.forEach((p) => {
    let w = 0;
    if (p.fruitBet && p.fruitBet.symbol === result) w += p.fruitBet.amount * info.multiplier;
    if (result === "77" && p.sevenBet > 0) w += p.sevenBet * info.multiplier;
    if (w > 0) winners.push({ name: p.name, avatar: p.avatar, bet: (p.fruitBet?.amount || 0) + p.sevenBet, win: w });
  });

  // Add user if won
  if (userWin > 0) {
    winners.unshift({ name: "You", avatar: "Y", bet: totalUserBet, win: userWin });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 pb-4 pt-4 sm:items-center" onClick={onClose}>
      <div className="relative mx-4 w-full max-w-sm animate-slide-up overflow-hidden rounded-2xl border-2 border-[#d4a017]/80"
        style={{ background: "linear-gradient(180deg, #2a1050 0%, #150830 100%)" }}
        onClick={(e) => e.stopPropagation()}>
        
        <button onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444]/80 text-white">
          <X size={16} />
        </button>

        {/* Header */}
        <div className="relative overflow-hidden px-4 pb-4 pt-6 text-center"
          style={{ background: `linear-gradient(180deg, ${info.color}30, transparent)` }}>
          {/* Confetti particles */}
          {userWin > 0 && Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="absolute rounded-full"
              style={{
                width: 4 + Math.random() * 4, height: 4 + Math.random() * 4,
                left: `${10 + Math.random() * 80}%`, top: `${Math.random() * 60}%`,
                background: ["#f5d060", "#ec4899", "#22c55e", "#7c3aed", "#3b82f6"][i % 5],
                animation: `confetti ${1.5 + Math.random()}s ease-out forwards`,
                animationDelay: `${Math.random() * 0.5}s`,
                opacity: 0,
              }} />
          ))}

          <h2 className="text-2xl font-black"
            style={{
              background: userWin > 0
                ? "linear-gradient(135deg, #f5d060, #d4a017)"
                : "linear-gradient(135deg, #ef4444, #dc2626)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
            {userWin > 0 ? "حظا سعيدا!" : "حظ أوفر!"}
          </h2>

          {/* Result icon */}
          <div className="mx-auto mt-3 flex h-16 w-16 items-center justify-center rounded-full border-2"
            style={{ borderColor: info.color, background: `${info.color}20`, boxShadow: `0 0 30px ${info.color}40` }}>
            {result === "77" ? (
              <span className="text-3xl font-black" style={{ color: info.color }}>77</span>
            ) : (
              <span className="text-3xl">{result === "watermelon" ? "\u{1F349}" : "\u{1F351}"}</span>
            )}
          </div>

          {userWin > 0 && (
            <div className="mt-3 text-3xl font-black text-[#f5d060]"
              style={{ textShadow: "0 0 20px rgba(245,208,96,0.5)" }}>
              +{userWin.toLocaleString()}
            </div>
          )}
        </div>

        {/* Winners list */}
        {winners.length > 0 && (
          <div className="border-t border-[#d4a017]/20 px-4 py-3">
            <p className="mb-2 text-center text-xs font-bold text-[#d4a017]/60">{"الفائزون"}</p>
            <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: 160 }}>
              {winners.map((w, i) => (
                <div key={i} className="flex items-center gap-2 rounded-xl bg-[#1a0a2e]/60 px-3 py-2">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2a1050] text-xs font-bold"
                    style={{ color: i === 0 ? "#f5d060" : "#d4a017" }}>
                    {w.avatar}
                  </div>
                  <span className="flex-1 truncate text-xs font-semibold text-[#d4a017]/90">{w.name}</span>
                  <div className="text-right">
                    <div className="text-[10px] text-[#d4a017]/50">{"رهان "}{w.bet.toLocaleString()}</div>
                    <div className="text-xs font-bold text-[#22c55e]">+{w.win.toLocaleString()}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Non-winners */}
        {winners.length === 0 && (
          <div className="px-4 pb-4 text-center">
            <p className="text-sm text-[#d4a017]/50">{"لم يفز أحد هذه الجولة"}</p>
          </div>
        )}

        <style jsx>{`
          @keyframes confetti {
            0% { transform: translateY(0) scale(0); opacity: 1; }
            100% { transform: translateY(-60px) scale(1.5); opacity: 0; }
          }
          .animate-slide-up {
            animation: slideUp 0.35s ease-out;
          }
          @keyframes slideUp {
            from { transform: translateY(40px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </div>
  );
}

// ========================
// HISTORY POPUP
// ========================
interface HistoryPopupProps {
  results: RoundResult[];
  onClose: () => void;
}

export function HistoryPopup({ results, onClose }: HistoryPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#d4a017]/60 animate-slide-up"
        style={{ background: "linear-gradient(180deg, #2a1050 0%, #150830 100%)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#d4a017]/20 p-4">
          <h2 className="text-lg font-black"
            style={{
              background: "linear-gradient(135deg, #f5d060, #d4a017)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{"سجل اللعبة"}</h2>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444]/80 text-white">
            <X size={16} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {results.length === 0 ? (
            <p className="text-center text-sm text-[#d4a017]/40">{"لا توجد نتائج بعد"}</p>
          ) : (
            <div className="grid grid-cols-8 gap-1.5" dir="ltr">
              {results.map((r, i) => {
                const c = SYMBOLS[r.symbol].color;
                return (
                  <div key={`${r.round}-${i}`}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border"
                    style={{ borderColor: `${c}50`, background: `${c}15` }}>
                    {r.symbol === "77" ? (
                      <span className="text-[10px] font-black" style={{ color: c }}>77</span>
                    ) : (
                      <span className="text-sm">{r.symbol === "watermelon" ? "\u{1F349}" : "\u{1F351}"}</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <style jsx>{`
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ========================
// HOW TO PLAY POPUP
// ========================
interface HowToPlayPopupProps {
  onClose: () => void;
}

export function HowToPlayPopup({ onClose }: HowToPlayPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#d4a017]/60 animate-slide-up"
        style={{ background: "linear-gradient(180deg, #2a1050 0%, #150830 100%)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#d4a017]/20 p-4">
          <h2 className="text-lg font-black"
            style={{
              background: "linear-gradient(135deg, #f5d060, #d4a017)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{"كيف ألعب"}</h2>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444]/80 text-white">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3 p-4 text-right text-sm leading-relaxed text-[#d4a017]/80">
          <div className="flex items-start gap-3 rounded-xl bg-[#1a0a2e]/60 p-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4a017] text-xs font-black text-[#1a0a2e]">1</div>
            <p>{"اختر فاكهة واحدة فقط (بطيخ أو برقوق) + يمكنك الرهان على 77 أيضاً."}</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-[#1a0a2e]/60 p-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4a017] text-xs font-black text-[#1a0a2e]">2</div>
            <p>{"حدد مبلغ الرهان باستخدام الشرائح قبل بدء اللعبة."}</p>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-[#1a0a2e]/60 p-3">
            <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#d4a017] text-xs font-black text-[#1a0a2e]">3</div>
            <p>{"العجلة تدور تلقائياً وإذا توقفت على رهانك تفوز بالمضاعف."}</p>
          </div>
          <div className="mt-3 flex items-center justify-center gap-6 rounded-xl border border-[#d4a017]/20 bg-[#0d0520]/60 p-3">
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">{"\u{1F349}"}</span>
              <span className="text-xs font-bold text-[#22c55e]">x2</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg">{"\u{1F351}"}</span>
              <span className="text-xs font-bold text-[#7c3aed]">x2</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-lg font-black text-[#ec4899]">77</span>
              <span className="text-xs font-bold text-[#ec4899]">x8</span>
            </div>
          </div>
          <p className="text-center text-xs text-[#d4a017]/50">
            {"عندما يحدث الحظ 77، هناك فرصة للحصول على جوائز متعددة!"}
          </p>
        </div>
      </div>
      <style jsx>{`
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ========================
// LEADERBOARD POPUP
// ========================
interface LeaderboardPopupProps {
  onClose: () => void;
}

const LEADERBOARD = [
  { rank: 1, name: "WAHM", points: 49376140, reward: 139063 },
  { rank: 2, name: "WA3D", points: 40317500, reward: 61806 },
  { rank: 3, name: "Dallah", points: 32457440, reward: 40173 },
  { rank: 4, name: "SAHIN", points: 24372240, reward: 24722 },
  { rank: 5, name: "karizma", points: 17619820, reward: 15451 },
  { rank: 6, name: "Es0oo", points: 14998730, reward: 9270 },
  { rank: 7, name: "MAYAR", points: 14618020, reward: 6180 },
  { rank: 8, name: "PART**", points: 12424180, reward: 6180 },
  { rank: 9, name: "Player_9", points: 11291440, reward: 3090 },
  { rank: 10, name: "Player_10", points: 10535590, reward: 3090 },
];

const RANK_BG: Record<number, string> = {
  1: "linear-gradient(135deg, #f5d060, #d4a017)",
  2: "linear-gradient(135deg, #e0e0e0, #a0a0a0)",
  3: "linear-gradient(135deg, #cd7f32, #a0522d)",
};

export function LeaderboardPopup({ onClose }: LeaderboardPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative max-h-[85vh] w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#d4a017]/60 animate-slide-up"
        style={{ background: "linear-gradient(180deg, #2a1050 0%, #150830 100%)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#d4a017]/20 p-4">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-[#d4a017]" />
            <h2 className="text-lg font-black"
              style={{
                background: "linear-gradient(135deg, #f5d060, #d4a017)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>{"لوحة المتصدرين"}</h2>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444]/80 text-white">
            <X size={16} />
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-[40px_1fr_80px_80px] gap-1 border-b border-[#d4a017]/15 px-4 py-2 text-[10px] font-bold text-[#d4a017]/50">
          <span>{"#"}</span>
          <span>{"اسم"}</span>
          <span className="text-center">{"النقاط"}</span>
          <span className="text-center">{"مكافآت"}</span>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {LEADERBOARD.map((p) => (
            <div key={p.rank}
              className="grid grid-cols-[40px_1fr_80px_80px] items-center gap-1 border-b border-[#d4a017]/10 px-4 py-2.5"
              style={{ background: p.rank <= 3 ? `${["", "#f5d060", "#c0c0c0", "#cd7f32"][p.rank]}08` : "transparent" }}>
              <div>
                {p.rank <= 3 ? (
                  <span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-black text-[#1a0a2e]"
                    style={{ background: RANK_BG[p.rank] }}>
                    {p.rank}
                  </span>
                ) : (
                  <span className="px-1.5 text-sm text-[#d4a017]/50">{p.rank}</span>
                )}
              </div>
              <span className="truncate text-xs font-semibold text-[#d4a017]/85">{p.name}</span>
              <span className="text-center text-[10px] text-[#d4a017]/60">{p.points.toLocaleString()}</span>
              <div className="flex items-center justify-center gap-1">
                <div className="h-3 w-3 rounded-full bg-[#f5d060]" style={{ boxShadow: "0 0 4px #f5d06060" }} />
                <span className="text-[10px] font-bold text-[#f5d060]">{p.reward.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}

// ========================
// BET HISTORY POPUP
// ========================
interface BetHistoryPopupProps {
  onClose: () => void;
  history: { time: string; bets: { symbol: Symbol; amount: number }[]; result: Symbol; win: number }[];
}

export function BetHistoryPopup({ onClose, history }: BetHistoryPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="relative max-h-[80vh] w-full max-w-md overflow-hidden rounded-2xl border-2 border-[#d4a017]/60 animate-slide-up"
        style={{ background: "linear-gradient(180deg, #2a1050 0%, #150830 100%)" }}
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#d4a017]/20 p-4">
          <h2 className="text-lg font-black"
            style={{
              background: "linear-gradient(135deg, #f5d060, #d4a017)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>{"رهاني"}</h2>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ef4444]/80 text-white">
            <X size={16} />
          </button>
        </div>

        {/* Table header */}
        <div className="grid grid-cols-4 gap-1 border-b border-[#d4a017]/15 px-4 py-2 text-[10px] font-bold text-[#d4a017]/50">
          <span>{"وقت"}</span>
          <span className="text-center">{"الرهان"}</span>
          <span className="text-center">{"نتيجة"}</span>
          <span className="text-center">{"فوز"}</span>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {history.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#d4a017]/40">{"لا توجد رهانات بعد"}</p>
          ) : (
            history.map((h, i) => {
              const rc = SYMBOLS[h.result].color;
              return (
                <div key={i} className="grid grid-cols-4 items-center gap-1 border-b border-[#d4a017]/8 px-4 py-3">
                  <span className="text-[10px] text-[#d4a017]/50">{h.time}</span>
                  <div className="flex flex-col items-center gap-0.5">
                    {h.bets.map((b, j) => (
                      <div key={j} className="flex items-center gap-1">
                        {b.symbol === "77" ? (
                          <span className="text-[10px] font-black text-[#ec4899]">77</span>
                        ) : (
                          <span className="text-xs">{b.symbol === "watermelon" ? "\u{1F349}" : "\u{1F351}"}</span>
                        )}
                        <span className="text-[10px] font-bold text-[#d4a017]">{b.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center">
                    {h.result === "77" ? (
                      <span className="text-xs font-black" style={{ color: rc }}>77</span>
                    ) : (
                      <span className="text-sm">{h.result === "watermelon" ? "\u{1F349}" : "\u{1F351}"}</span>
                    )}
                  </div>
                  <span className={`text-center text-xs font-bold ${h.win > 0 ? "text-[#22c55e]" : "text-[#ef4444]/60"}`}>
                    {h.win > 0 ? `+${h.win.toLocaleString()}` : "0"}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
      <style jsx>{`
        .animate-slide-up { animation: slideUp 0.3s ease-out; }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
}
