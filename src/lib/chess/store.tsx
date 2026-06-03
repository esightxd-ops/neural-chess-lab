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
import { getMockAnalytics } from "./mock";
import { importChessProfile } from "./chess.functions";
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
const STORAGE_KEY = "chesslab.username";

function readStoredUsername(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredUsername(value: string | null) {
  if (typeof window === "undefined") return;
  try {
    if (value) window.localStorage.setItem(STORAGE_KEY, value);
    else window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function ChessDataProvider({ children }: { children: ReactNode }) {
  const mock = useMemo(() => getMockAnalytics(), []);
  const [analytics, setAnalytics] = useState<ChessAnalytics>(mock);
  const [isMock, setIsMock] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(mock.fetchedAt);

  const importFn = useServerFn(importChessProfile);
  const lastReqId = useRef(0);

  const runImport = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const reqId = ++lastReqId.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await importFn({ data: { username: trimmed } });
        if (reqId !== lastReqId.current) return;
        setAnalytics(data);
        setIsMock(false);
        setUsername(data.profile.username);
        setFetchedAt(data.fetchedAt);
        writeStoredUsername(data.profile.username);
      } catch (e) {
        if (reqId !== lastReqId.current) return;
        const msg = e instanceof Error ? e.message : "Failed to import profile";
        setError(msg);
      } finally {
        if (reqId === lastReqId.current) setIsLoading(false);
      }
    },
    [importFn],
  );

  const refresh = useCallback(async () => {
    if (!username) return;
    await runImport(username);
  }, [username, runImport]);

  const clear = useCallback(() => {
    lastReqId.current++;
    setUsername(null);
    setAnalytics(mock);
    setIsMock(true);
    setFetchedAt(mock.fetchedAt);
    setError(null);
    writeStoredUsername(null);
  }, [mock]);

  // Restore last imported username on mount.
  useEffect(() => {
    const stored = readStoredUsername();
    if (stored) void runImport(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<State>(
    () => ({
      analytics,
      isMock,
      username,
      isLoading,
      error,
      fetchedAt,
      importProfile: runImport,
      refresh,
      clear,
    }),
    [analytics, isMock, username, isLoading, error, fetchedAt, runImport, refresh, clear],
  );

  return <ChessContext.Provider value={value}>{children}</ChessContext.Provider>;
}

export function useChessData(): State {
  const ctx = useContext(ChessContext);
  if (!ctx) throw new Error("useChessData must be used within ChessDataProvider");
  return ctx;
}
