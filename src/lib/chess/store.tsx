import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { getMockAnalytics } from "./mock";
import { importChessProfile } from "./chess.functions";
import { ChessContext, STORAGE_KEY, type ChessDataState, type ImportResult } from "./store-context";
import type { ChessAnalytics } from "./types";

const CACHE_TTL_MS = 5 * 60 * 1000;
const COOLDOWN_MS = 10 * 1000;

const SNAPSHOT_KEY = "chesslab.snapshot.v1";
const SNAPSHOT_VERSION = 1;
const SNAPSHOT_TTL_MS = 30 * 60 * 1000;

interface Snapshot {
  version: number;
  username: string;
  savedAt: number;
  analytics: ChessAnalytics;
}

const analyticsCache = new Map<string, { data: ChessAnalytics; at: number }>();
const lastImportAt = new Map<string, number>();

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

function readSnapshot(): Snapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Snapshot;
    if (parsed?.version !== SNAPSHOT_VERSION) return null;
    if (!parsed.analytics || !parsed.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSnapshot(snap: Snapshot | null) {
  if (typeof window === "undefined") return;
  try {
    if (snap) window.localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
    else window.localStorage.removeItem(SNAPSHOT_KEY);
  } catch {
    /* ignore — quota or serialization failure is non-fatal */
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
  const inFlight = useRef(false);

  const applyAnalytics = useCallback((data: ChessAnalytics, persist: boolean = true) => {
    setAnalytics(data);
    setIsMock(false);
    setUsername(data.profile.username);
    setFetchedAt(data.fetchedAt);
    writeStoredUsername(data.profile.username);
    if (persist) {
      writeSnapshot({
        version: SNAPSHOT_VERSION,
        username: data.profile.username,
        savedAt: Date.now(),
        analytics: data,
      });
    }
    if (data.meta) {
      const { failedArchiveMonths, skippedInvalidGames } = data.meta;
      if (failedArchiveMonths > 0 || skippedInvalidGames > 0) {
        const bits: string[] = [];
        if (failedArchiveMonths > 0)
          bits.push(
            `${failedArchiveMonths} month${failedArchiveMonths === 1 ? "" : "s"} skipped`,
          );
        if (skippedInvalidGames > 0) bits.push(`${skippedInvalidGames} invalid games`);
        toast.warning(`Partial import: ${bits.join(", ")}`);
      }
    }
  }, []);

  const runImport = useCallback(
    async (name: string, opts: { force?: boolean } = {}): Promise<ImportResult> => {
      const trimmed = name.trim();
      if (!trimmed) return { ok: false, error: "Username is required" };
      const key = trimmed.toLowerCase();

      if (inFlight.current) {
        return { ok: false, error: "Import already in progress" };
      }

      if (!opts.force) {
        const cached = analyticsCache.get(key);
        if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
          applyAnalytics(cached.data);
          setError(null);
          return { ok: true, username: cached.data.profile.username };
        }
        const last = lastImportAt.get(key);
        if (last && Date.now() - last < COOLDOWN_MS) {
          const wait = Math.ceil((COOLDOWN_MS - (Date.now() - last)) / 1000);
          return { ok: false, error: `Please wait ${wait}s before importing again` };
        }
      }

      const reqId = ++lastReqId.current;
      inFlight.current = true;
      setIsLoading(true);
      setError(null);
      try {
        const data = await importFn({ data: { username: trimmed } });
        if (reqId !== lastReqId.current) return { ok: false, error: "Superseded" };
        analyticsCache.set(key, { data, at: Date.now() });
        lastImportAt.set(key, Date.now());
        applyAnalytics(data);
        return { ok: true, username: data.profile.username };
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to import profile";
        if (reqId === lastReqId.current) setError(msg);
        const isTerminal = /not found|Invalid Chess\.com username/i.test(msg);
        if (isTerminal) {
          writeStoredUsername(null);
          writeSnapshot(null);
        }
        return { ok: false, error: msg };
      } finally {
        inFlight.current = false;
        if (reqId === lastReqId.current) setIsLoading(false);
      }
    },
    [importFn, applyAnalytics],
  );

  const refresh = useCallback(async (): Promise<ImportResult> => {
    if (!username) return { ok: false, error: "No username imported yet" };
    return runImport(username, { force: true });
  }, [username, runImport]);

  const clear = useCallback(() => {
    lastReqId.current++;
    setUsername(null);
    setAnalytics(mock);
    setIsMock(true);
    setFetchedAt(mock.fetchedAt);
    setError(null);
    writeStoredUsername(null);
    writeSnapshot(null);
  }, [mock]);

  useEffect(() => {
    // Restore a fresh snapshot synchronously-ish for an instant warm start.
    const snap = readSnapshot();
    if (snap && Date.now() - snap.savedAt < SNAPSHOT_TTL_MS) {
      applyAnalytics(snap.analytics, false);
      return;
    }
    // Stale or missing snapshot: fall back to username-driven auto-import.
    const stored = readStoredUsername();
    if (stored) {
      // Silent auto-restore: don't toast on failure, keep mock dashboard.
      void runImport(stored);
    }
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
