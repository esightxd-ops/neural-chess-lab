import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { importChessProfile } from "./chess.functions";
import { getMockAnalytics } from "./mock";
import type { ChessAnalytics } from "./types";

const STORAGE_KEY = "chesslab:lastUsername";

interface State {
  analytics: ChessAnalytics; // never null — mock fallback
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
  const importFn = useServerFn(importChessProfile);
  const [analytics, setAnalytics] = useState<ChessAnalytics>(() => getMockAnalytics());
  const [isMock, setIsMock] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bootstrapped = useRef(false);

  const importProfile = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await importFn({ data: { username: trimmed } });
        if (res.ok) {
          setAnalytics(res.data);
          setIsMock(false);
          setUsername(res.data.profile.username);
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, res.data.profile.username);
          }
        } else {
          setError(res.error);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Import failed");
      } finally {
        setIsLoading(false);
      }
    },
    [importFn],
  );

  const refresh = useCallback(async () => {
    if (username) await importProfile(username);
  }, [username, importProfile]);

  const clear = useCallback(() => {
    setAnalytics(getMockAnalytics());
    setIsMock(true);
    setUsername(null);
    setError(null);
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  useEffect(() => {
    if (bootstrapped.current || typeof window === "undefined") return;
    bootstrapped.current = true;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) void importProfile(saved);
  }, [importProfile]);

  const value = useMemo<State>(
    () => ({
      analytics,
      isMock,
      username,
      isLoading,
      error,
      fetchedAt: analytics.fetchedAt,
      importProfile,
      refresh,
      clear,
    }),
    [analytics, isMock, username, isLoading, error, importProfile, refresh, clear],
  );

  return <ChessContext.Provider value={value}>{children}</ChessContext.Provider>;
}

export function useChessData(): State {
  const ctx = useContext(ChessContext);
  if (!ctx) throw new Error("useChessData must be used within ChessDataProvider");
  return ctx;
}
