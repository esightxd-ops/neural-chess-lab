import { createContext, useContext } from "react";
import type { ChessAnalytics } from "./types";

export type ImportResult = { ok: true; username: string } | { ok: false; error: string };

export interface ChessDataState {
  analytics: ChessAnalytics;
  isMock: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
  fetchedAt: number | null;
  importProfile: (username: string) => Promise<ImportResult>;
  refresh: () => Promise<ImportResult>;
  clear: () => void;
}

export const ChessContext = createContext<ChessDataState | null>(null);
export const STORAGE_KEY = "chesslab.username";

export function useChessData(): ChessDataState {
  const ctx = useContext(ChessContext);
  if (!ctx) throw new Error("useChessData must be used within ChessDataProvider");
  return ctx;
}
