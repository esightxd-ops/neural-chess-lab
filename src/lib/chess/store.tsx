import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getMockAnalytics } from "./mock";
import type { ChessAnalytics } from "./types";

interface State {
  analytics: ChessAnalytics;
  isMock: boolean;
  username: string | null;
  isLoading: boolean;
  error: string | null;
  fetchedAt: number | null;
  importProfile: (username: string) => Promise<void>;
  refresh: () => Promise<void>;
  clear: () => void;
}

const ChessContext = createContext<State | null>(null);

export function ChessDataProvider({ children }: { children: ReactNode }) {
  const [analytics] = useState<ChessAnalytics>(() => getMockAnalytics());
  const [username, setUsername] = useState<string | null>(null);

  // API integration intentionally removed — focus is on core design.
  // All consumers continue to read from the deterministic mock dataset.
  const importProfile = useCallback(async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setUsername(trimmed);
  }, []);

  const refresh = useCallback(async () => {}, []);
  const clear = useCallback(() => setUsername(null), []);

  const value = useMemo<State>(
    () => ({
      analytics,
      isMock: true,
      username,
      isLoading: false,
      error: null,
      fetchedAt: analytics.fetchedAt,
      importProfile,
      refresh,
      clear,
    }),
    [analytics, username, importProfile, refresh, clear],
  );

  return <ChessContext.Provider value={value}>{children}</ChessContext.Provider>;
}

export function useChessData(): State {
  const ctx = useContext(ChessContext);
  if (!ctx) throw new Error("useChessData must be used within ChessDataProvider");
  return ctx;
}
