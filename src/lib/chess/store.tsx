import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useServerFn } from "@tanstack/react-start";
import { getMockAnalytics } from "./mock";
import { importChessProfile } from "./chess.functions";
import {
  ChessContext,
  STORAGE_KEY,
  type ChessDataState,
  type ImportResult,
} from "./store-context";

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
  const [analytics, setAnalytics] = useState(mock);
  const [isMock, setIsMock] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<number | null>(mock.fetchedAt);

  const importFn = useServerFn(importChessProfile);
  const lastReqId = useRef(0);

  const runImport = useCallback(
    async (name: string): Promise<ImportResult> => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Username is required" };
      const reqId = ++lastReqId.current;
      setIsLoading(true);
      setError(null);
      try {
        const data = await importFn({ data: { username: trimmed } });
        if (reqId !== lastReqId.current) return { ok: false, error: "Superseded" };
        setAnalytics(data);
        setIsMock(false);
        setUsername(data.profile.username);
        setFetchedAt(data.fetchedAt);
        writeStoredUsername(data.profile.username);
        return { ok: true, username: data.profile.username };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to import profile";
        if (reqId === lastReqId.current) setError(msg);
        return { ok: false, error: msg };
      } finally {
        if (reqId === lastReqId.current) setIsLoading(false);
      }
    },
    [importFn],
  );

  const refresh = useCallback(async (): Promise<ImportResult> => {
    if (!username) return { ok: false, error: "No username imported yet" };
    return runImport(username);
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

  useEffect(() => {
    const stored = readStoredUsername();
    if (stored) void runImport(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<ChessDataState>(
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

// Re-export hook for backward-compatible imports. Consumers may also import
// from "./store-context" directly.
export { useChessData };
export type { ImportResult, ChessDataState };
