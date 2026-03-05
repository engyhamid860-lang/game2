export type Symbol = "watermelon" | "plum" | "77";

export interface SymbolInfo {
  name: string;
  nameAr: string;
  multiplier: number;
  color: string;
  colorDark: string;
  colorLight: string;
}

export const SYMBOLS: Record<Symbol, SymbolInfo> = {
  watermelon: {
    name: "Watermelon",
    nameAr: "بطيخ",
    multiplier: 2,
    color: "#22c55e",
    colorDark: "#15803d",
    colorLight: "#4ade80",
  },
  plum: {
    name: "Plum",
    nameAr: "برقوق",
    multiplier: 2,
    color: "#7c3aed",
    colorDark: "#5b21b6",
    colorLight: "#a78bfa",
  },
  "77": {
    name: "77",
    nameAr: "77",
    multiplier: 8,
    color: "#ec4899",
    colorDark: "#be185d",
    colorLight: "#f472b6",
  },
};

// 12 segments: 5 watermelon, 5 plum, 2 seventy-seven
export const WHEEL_SEGMENTS: Symbol[] = [
  "watermelon", "plum", "watermelon", "plum", "watermelon",
  "77",
  "plum", "watermelon", "plum", "watermelon", "plum",
  "77",
];

export interface BetState {
  watermelon: number;
  plum: number;
  "77": number;
}

export interface RoundResult {
  round: number;
  symbol: Symbol;
  timestamp: number;
}

export interface PlayerBet {
  id: string;
  name: string;
  avatar: string;
  fruitBet: { symbol: Symbol; amount: number } | null;
  sevenBet: number;
}

export interface WinnerInfo {
  name: string;
  avatar: string;
  bet: number;
  win: number;
}

export const CHIP_VALUES = [500, 1000, 10000, 100000];
export const INITIAL_BALANCE = 0;
export const COUNTDOWN_SECONDS = 12;

export const FAKE_PLAYERS = [
  { name: "WAHM", avatar: "W" },
  { name: "WA3D", avatar: "V" },
  { name: "Es0oo", avatar: "E" },
  { name: "PART**", avatar: "P" },
  { name: "karizma", avatar: "K" },
  { name: "MAYAR", avatar: "M" },
  { name: "Dallah", avatar: "D" },
  { name: "SAHIN", avatar: "S" },
  { name: "NoorStar", avatar: "N" },
  { name: "Sultan7", avatar: "7" },
  { name: "GoldRush", avatar: "G" },
  { name: "LuckyAce", avatar: "L" },
];
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";

export async function loadUserBalance(){

  const user = auth.currentUser;

  if(!user) return 0;

  const ref = doc(db,"users",user.uid);
  const snap = await getDoc(ref);

  if(snap.exists()){
    return snap.data().walletBalance || 0;
  }

  return 0;
}