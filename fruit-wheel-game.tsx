
"use client";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore"
import { db, auth } from "@/lib/firebase"
import { useState, useCallback, useEffect, useRef } from "react";
import { Trophy, HelpCircle, History, Volume2, VolumeX, ListOrdered } from "lucide-react";
import { SpinningWheel } from "./spinning-wheel";
import { BetPanel } from "./bet-panel";
import { ChipSelector } from "./chip-selector";
import { ResultsStrip } from "./results-strip";
import { LiveBets } from "./live-bets";
import {
  ResultAnnouncement,
  HistoryPopup,
  HowToPlayPopup,
  LeaderboardPopup,
  BetHistoryPopup,
} from "./game-popups";
import {
  type Symbol,
  type BetState,
  type RoundResult,
  type PlayerBet,
  SYMBOLS,
  WHEEL_SEGMENTS,
  INITIAL_BALANCE,
  COUNTDOWN_SECONDS,
  FAKE_PLAYERS,
} from "@/lib/game-store";

type GamePhase = "betting" | "spinning" | "result";
type PopupType = "none" | "history" | "howtoplay" | "leaderboard" | "myBets";

// Generate fake player bets
function generateFakeBets(): PlayerBet[] {
  const count = 3 + Math.floor(Math.random() * 5);
  const used = new Set<number>();
  const bets: PlayerBet[] = [];
  for (let i = 0; i < count; i++) {
    let idx: number;
    do { idx = Math.floor(Math.random() * FAKE_PLAYERS.length); } while (used.has(idx));
    used.add(idx);
    const p = FAKE_PLAYERS[idx];
    const fruits: Symbol[] = ["watermelon", "plum"];
    const fruit = fruits[Math.floor(Math.random() * 2)];
    const amounts = [1000, 2000, 5000, 10000, 20000, 50000];
    const fruitAmt = amounts[Math.floor(Math.random() * amounts.length)];
    const hasSeven = Math.random() > 0.4;
    const sevenAmt = hasSeven ? amounts[Math.floor(Math.random() * 3)] : 0;
    bets.push({
      id: `fake-${idx}`,
      name: p.name,
      avatar: p.avatar,
      fruitBet: { symbol: fruit, amount: fruitAmt },
      sevenBet: sevenAmt,
    });
  }
  return bets;
}

export function FruitWheelGame() {
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [round, setRound] = useState(2010);
  const [phase, setPhase] = useState<GamePhase>("betting");
  const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
  const [bets, setBets] = useState<BetState>({ watermelon: 0, plum: 0, "77": 0 });
  const [selectedChip, setSelectedChip] = useState(1000);
  const [results, setResults] = useState<RoundResult[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetSymbol, setTargetSymbol] = useState<Symbol | null>(null);
  const [popup, setPopup] = useState<PopupType>("none");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [wheelSize, setWheelSize] = useState(280);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const [lastResult, setLastResult] = useState<Symbol | null>(null);
  const [lastWin, setLastWin] = useState(0);
  const [playerBets, setPlayerBets] = useState<PlayerBet[]>([]);
  const [betHistory, setBetHistory] = useState<{ time: string; bets: { symbol: Symbol; amount: number }[]; result: Symbol; win: number }[]>([]);
  const [lockedFruit, setLockedFruit] = useState<Symbol | null>(null);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
useEffect(() => {

  async function loadBalance(){

    const user = auth.currentUser

    if(!user) return

    const ref = doc(db,"users",user.uid)

    const snap = await getDoc(ref)

    if(snap.exists()){
      setBalance(snap.data().walletBalance || 0)
    }

  }

  loadBalance()

},[])
  // Responsive wheel size
  useEffect(() => {
    const update = () => setWheelSize(Math.min(300, window.innerWidth - 40));
    update();
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Get or create audio context
  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  // Sound effects
  const playSound = useCallback((type: "spin" | "win" | "tick" | "place" | "lose") => {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      switch (type) {
        case "spin":
          osc.type = "sine";
          osc.frequency.value = 300;
          gain.gain.value = 0.08;
          osc.start();
          osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.15);
          osc.stop(ctx.currentTime + 0.2);
          break;
        case "win":
          osc.type = "triangle";
          osc.frequency.value = 523;
          gain.gain.value = 0.12;
          osc.start();
          osc.frequency.setValueAtTime(659, ctx.currentTime + 0.1);
          osc.frequency.setValueAtTime(784, ctx.currentTime + 0.2);
          osc.frequency.setValueAtTime(1047, ctx.currentTime + 0.3);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.5);
          osc.stop(ctx.currentTime + 0.5);
          break;
        case "tick":
          osc.type = "square";
          osc.frequency.value = 880;
          gain.gain.value = 0.04;
          osc.start();
          osc.stop(ctx.currentTime + 0.04);
          break;
        case "place":
          osc.type = "sine";
          osc.frequency.value = 400;
          gain.gain.value = 0.06;
          osc.start();
          osc.frequency.linearRampToValueAtTime(500, ctx.currentTime + 0.05);
          osc.stop(ctx.currentTime + 0.08);
          break;
        case "lose":
          osc.type = "sawtooth";
          osc.frequency.value = 300;
          gain.gain.value = 0.06;
          osc.start();
          osc.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.3);
          gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
          osc.stop(ctx.currentTime + 0.4);
          break;
      }
    } catch {
      // Audio not available
    }
  }, [soundEnabled, getAudioCtx]);

  // Generate fake bets during betting phase
  useEffect(() => {
    if (phase !== "betting") return;
    setPlayerBets(generateFakeBets());
    // Add more bets over time
    const iv = setInterval(() => {
      if (Math.random() > 0.5) {
        setPlayerBets((prev) => {
          const newBets = [...prev];
          const idx = Math.floor(Math.random() * newBets.length);
          if (newBets[idx] && newBets[idx].fruitBet) {
            newBets[idx] = {
              ...newBets[idx],
              fruitBet: {
                ...newBets[idx].fruitBet!,
                amount: newBets[idx].fruitBet!.amount + [1000, 2000, 5000][Math.floor(Math.random() * 3)],
              },
            };
          }
          return newBets;
        });
      }
    }, 2000);
    return () => clearInterval(iv);
  }, [phase, round]);

  // Countdown timer
  useEffect(() => {
    if (phase !== "betting") return;
    setCountdown(COUNTDOWN_SECONDS);
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (countdownRef.current) clearInterval(countdownRef.current);
          startSpin();
          return 0;
        }
        if (prev <= 4) playSound("tick");
        return prev - 1;
      });
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, round]);

  // Start spinning
  const startSpin = useCallback(() => {
    setPhase("spinning");
    playSound("spin");
    const randomIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
    const result = WHEEL_SEGMENTS[randomIndex];
    setTargetSymbol(result);
    setIsSpinning(true);
  }, [playSound]);

  // Handle spin end
  const handleSpinEnd = useCallback(() => {
    if (!targetSymbol) return;
    setIsSpinning(false);
    setPhase("result");

    const newResult: RoundResult = { round, symbol: targetSymbol, timestamp: Date.now() };
    setResults((prev) => [newResult, ...prev].slice(0, 100));

    // Calculate winnings
    const betOnWinner = bets[targetSymbol];
    const totalBet = bets.watermelon + bets.plum + bets["77"];
    const multiplier = SYMBOLS[targetSymbol].multiplier;
    const winAmount = betOnWinner * multiplier;

    setLastResult(targetSymbol);
    setLastWin(winAmount);

    if (winAmount > 0) {

  setBalance((prev) => prev + winAmount);

  const user = auth.currentUser;

  if(user){
    const ref = doc(db,"users",user.uid);

    await updateDoc(ref,{
      walletBalance: increment(winAmount)
    });
  }

  playSound("win");
}

    // Record bet history
    if (totalBet > 0) {
      const betsList: { symbol: Symbol; amount: number }[] = [];
      if (bets.watermelon > 0) betsList.push({ symbol: "watermelon", amount: bets.watermelon });
      if (bets.plum > 0) betsList.push({ symbol: "plum", amount: bets.plum });
      if (bets["77"] > 0) betsList.push({ symbol: "77", amount: bets["77"] });
      const now = new Date();
      const timeStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setBetHistory((prev) => [{ time: timeStr, bets: betsList, result: targetSymbol, win: winAmount }, ...prev].slice(0, 50));
    }

    // Show result popup
    setTimeout(() => setShowResultPopup(true), 800);

    // Auto close and new round
    setTimeout(() => {
      setShowResultPopup(false);
      setBets({ watermelon: 0, plum: 0, "77": 0 });
      setTargetSymbol(null);
      setLastResult(null);
      setLastWin(0);
      setLockedFruit(null);
      setRound((prev) => prev + 1);
      setPhase("betting");
    }, 5000);
  }, [targetSymbol, bets, round, playSound]);

  // Place bet - enforce: only one fruit + 77
  const placeBet = useCallback(async (symbol: Symbol) => {

  if (phase !== "betting") return;
  if (balance < selectedChip) return;

  const user = auth.currentUser;
  if(!user) return;

  const ref = doc(db,"users",user.uid);

  // خصم الرصيد من Firebase
  await updateDoc(ref,{
    walletBalance: increment(-selectedChip)
  });

  if (symbol !== "77") {
    if (lockedFruit !== null && lockedFruit !== symbol) return;
    setLockedFruit(symbol);
  }

  playSound("place");

  setBets((prev) => ({
    ...prev,
    [symbol]: prev[symbol] + selectedChip
  }));

  setBalance((prev) => prev - selectedChip);

}, [phase, balance, selectedChip, playSound, lockedFruit]);
  const totalBet = bets.watermelon + bets.plum + bets["77"];

  // Countdown progress for circular indicator
  const countdownPct = phase === "betting" ? (countdown / COUNTDOWN_SECONDS) * 100 : 0;
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (countdownPct / 100) * circumference;

  return (
    <div className="relative flex min-h-dvh flex-col items-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 30%, #1a0a2e 0%, #0d0520 50%, #050210 100%)" }}>

      {/* Background image */}
      <div className="absolute inset-0 opacity-15"
        style={{ backgroundImage: "url(/images/casino-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center" }} />

      {/* Ambient lights */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-1/4 h-60 w-60 rounded-full bg-[#7c3aed]/10 blur-[100px]" />
        <div className="absolute right-0 top-1/2 h-60 w-60 rounded-full bg-[#ec4899]/8 blur-[100px]" />
        <div className="absolute bottom-1/4 left-1/3 h-48 w-48 rounded-full bg-[#d4a017]/8 blur-[80px]" />
      </div>

      {/* === HEADER BAR === */}
      <header className="relative z-10 flex w-full max-w-md items-center justify-between px-3 pb-2 pt-3">
        <div className="flex items-center gap-1.5">
          <SideButton onClick={() => setSoundEnabled(!soundEnabled)}
            icon={soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />} />
          <SideButton onClick={() => setPopup("myBets")} icon={<ListOrdered size={15} />} />
        </div>

        {/* Balance pill */}
        <div className="flex items-center gap-2 rounded-full border border-[#d4a017]/50 px-4 py-1.5"
          style={{ background: "linear-gradient(135deg, #1a0a2e 0%, #0d0520 100%)", boxShadow: "0 0 15px rgba(212,160,23,0.1), inset 0 1px 0 rgba(245,208,96,0.1)" }}>
          <div className="h-5 w-5 rounded-full"
            style={{ background: "radial-gradient(circle at 35% 35%, #f5e06a, #d4a017, #8a6914)", boxShadow: "0 0 8px rgba(245,208,96,0.4)" }} />
          <span className="text-sm font-black text-[#f5d060]">{balance.toLocaleString()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <SideButton onClick={() => setPopup("leaderboard")} icon={<Trophy size={15} />} />
          <SideButton onClick={() => setPopup("howtoplay")} icon={<HelpCircle size={15} />} />
        </div>
      </header>

      {/* === ROUND + COUNTDOWN === */}
      <div className="relative z-10 mb-1 flex w-full max-w-md items-center justify-between px-4">
        <span className="rounded-md bg-[#0d0520]/60 px-2 py-0.5 text-[10px] font-bold text-[#d4a017]/50 backdrop-blur-sm">
          Round:{round}
        </span>
        {phase === "betting" && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-[#d4a017]/50">{"الوقت"}</span>
            {/* Circular countdown */}
            <div className="relative flex h-10 w-10 items-center justify-center">
              <svg className="absolute inset-0" width="40" height="40" viewBox="0 0 40 40">
                <circle cx="20" cy="20" r="18" fill="none" stroke="#d4a01720" strokeWidth="2.5" />
                <circle cx="20" cy="20" r="18" fill="none"
                  stroke={countdown <= 3 ? "#ef4444" : "#d4a017"}
                  strokeWidth="2.5" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.3s ease" }} />
              </svg>
              <span className="text-sm font-black" style={{
                color: countdown <= 3 ? "#ef4444" : "#f5d060",
                animation: countdown <= 3 ? "count-pulse 0.5s ease-in-out infinite" : "none",
              }}>{countdown}</span>
            </div>
          </div>
        )}
        {phase === "spinning" && (
          <div className="flex items-center gap-2 rounded-full bg-[#d4a017]/10 px-3 py-1">
            <div className="h-2 w-2 rounded-full bg-[#d4a017]" style={{ animation: "blink 0.6s ease-in-out infinite" }} />
            <span className="text-xs font-bold text-[#d4a017]">{"جاري الدوران..."}</span>
          </div>
        )}
        {phase === "result" && (
          <div className="flex items-center gap-2 rounded-full bg-[#22c55e]/10 px-3 py-1">
            <span className="text-xs font-bold text-[#22c55e]">{"النتيجة!"}</span>
          </div>
        )}
      </div>

      {/* === WHEEL === */}
      <div className="relative z-10 flex items-center justify-center py-1">
        <SpinningWheel
          isSpinning={isSpinning}
          targetSymbol={targetSymbol}
          onSpinEnd={handleSpinEnd}
          size={wheelSize}
        />
      </div>

      {/* === RESULTS STRIP === */}
      <div className="relative z-10 w-full max-w-md px-3 py-1">
        <ResultsStrip results={results} />
      </div>

      {/* === BET PANEL === */}
      <div className="relative z-10 mt-1 flex w-full max-w-md flex-col items-center gap-2 px-2 pb-2">
        <BetPanel
          bets={bets}
          selectedChip={selectedChip}
          onPlaceBet={placeBet}
          disabled={phase !== "betting"}
          lockedFruit={lockedFruit}
        />

        {/* Chip selector */}
        <ChipSelector selectedChip={selectedChip} onSelectChip={setSelectedChip} />

        {/* Total bet bar */}
        {totalBet > 0 && (
          <div className="flex items-center gap-3 rounded-full border border-[#d4a017]/20 bg-[#0d0520]/60 px-4 py-1">
            <span className="text-[10px] text-[#d4a017]/50">{"إجمالي"}</span>
            <div className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-full bg-[#f5d060]" style={{ boxShadow: "0 0 4px #f5d06060" }} />
              <span className="text-xs font-bold text-[#f5d060]">{totalBet.toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* === LIVE BETS === */}
      <div className="relative z-10 w-full max-w-md px-3 pb-4">
        <LiveBets playerBets={playerBets} />
      </div>

      {/* === SIDE ACTIONS (MOBILE FIXED) === */}
      <button onClick={() => setPopup("history")}
        className="fixed bottom-20 left-2 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-[#d4a017]/30 text-[#d4a017]/70 shadow-lg transition-all active:scale-90"
        style={{ background: "linear-gradient(135deg, #1a0a2e, #0d0520)", boxShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
        <History size={16} />
      </button>

      {/* === POPUPS === */}
      {popup === "history" && <HistoryPopup results={results} onClose={() => setPopup("none")} />}
      {popup === "howtoplay" && <HowToPlayPopup onClose={() => setPopup("none")} />}
      {popup === "leaderboard" && <LeaderboardPopup onClose={() => setPopup("none")} />}
      {popup === "myBets" && <BetHistoryPopup onClose={() => setPopup("none")} history={betHistory} />}

      {showResultPopup && lastResult && (
        <ResultAnnouncement
          result={lastResult}
          playerBets={playerBets}
          userBets={bets}
          userWin={lastWin}
          onClose={() => setShowResultPopup(false)}
        />
      )}

      <style jsx>{`
        @keyframes count-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// Reusable small circular button
function SideButton({ onClick, icon }: { onClick: () => void; icon: React.ReactNode }) {
  return (
    <button onClick={onClick}
      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#d4a017]/30 text-[#d4a017]/80 transition-all active:scale-90"
      style={{
        background: "linear-gradient(135deg, #1a0a2e, #0d0520)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(245,208,96,0.05)",
      }}>
      {icon}
    </button>
  );
}
import { updateDoc, increment, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

