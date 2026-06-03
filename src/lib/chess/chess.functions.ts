import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildAnalytics, normalizeGame, normalizeProfile, type RawStats } from "./analytics";
import type { ChessAnalytics, Game, ImportMeta, TimeClass } from "./types";
import { MAX_GAMES, MAX_MONTHS, UsernameSchema } from "./validators";

const UA = "Chesslab/1.0 (https://lovable.dev)";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [300, 800, 1800];
const ARCHIVE_CONCURRENCY = 2;

// Server-side cache + in-flight dedupe (per Worker isolate). Best-effort
// only — Workers can be cold/warm and isolates are per-region.
const SERVER_CACHE_TTL_MS = 5 * 60 * 1000;
const SERVER_CACHE_MAX = 50;
const serverCache = new Map<string, { data: ChessAnalytics; at: number }>();
const inFlight = new Map<string, Promise<ChessAnalytics>>();

function cachePut(key: string, data: ChessAnalytics) {
  if (serverCache.size >= SERVER_CACHE_MAX) {
    const first = serverCache.keys().next().value;
    if (first !== undefined) serverCache.delete(first);
  }
  serverCache.set(key, { data, at: Date.now() });
}

function cacheGet(key: string): ChessAnalytics | null {
  const hit = serverCache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > SERVER_CACHE_TTL_MS) {
    serverCache.delete(key);
    return null;
  }
  return hit.data;
}

class HttpError extends Error {
  status: number;
  retryAfterMs?: number;
  constructor(status: number, message: string, retryAfterMs?: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.retryAfterMs = retryAfterMs;
  }
}

class TimeoutError extends Error {
  constructor(url: string) {
    super(`Request to ${url} timed out after ${REQUEST_TIMEOUT_MS}ms`);
    this.name = "TimeoutError";
  }
}

function isTransientStatus(status: number) {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

// Retry-After can be "<seconds>" or an HTTP-date. Returns ms, clamped, or undefined.
function parseRetryAfter(header: string | null): number | undefined {
  if (!header) return undefined;
  const trimmed = header.trim();
  if (!trimmed) return undefined;
  const asNum = Number(trimmed);
  if (Number.isFinite(asNum)) {
    return Math.min(Math.max(asNum * 1000, 0), 30_000);
  }
  const asDate = Date.parse(trimmed);
  if (!Number.isNaN(asDate)) {
    return Math.min(Math.max(asDate - Date.now(), 0), 30_000);
  }
  return undefined;
}

function sleep(ms: number) {
  return new Promise<void>((r) => setTimeout(r, ms));
}

function backoffDelay(attempt: number, retryAfterMs?: number): number {
  const base = BACKOFF_MS[attempt] ?? BACKOFF_MS[BACKOFF_MS.length - 1];
  const jittered = base * (0.8 + Math.random() * 0.4);
  if (retryAfterMs != null) return Math.max(jittered, retryAfterMs);
  return jittered;
}

// Fetch with AbortController timeout + retry/backoff for transient errors only.
// 400 / 403 / 404 are surfaced immediately and never retried.
async function cdcFetch(url: string): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA, Accept: "application/json" },
        signal: ctrl.signal,
      });
      clearTimeout(timer);
      if (res.ok) return res;
      const retryAfter = parseRetryAfter(res.headers.get("retry-after"));
      const err = new HttpError(res.status, `Chess.com ${res.status} for ${url}`, retryAfter);
      // Hard stop for non-transient: never retry 400/403/404 etc.
      if (!isTransientStatus(res.status)) throw err;
      lastErr = err;
    } catch (e) {
      clearTimeout(timer);
      // Re-throw non-transient HTTP errors immediately.
      if (e instanceof HttpError && !isTransientStatus(e.status)) throw e;
      if (e instanceof Error && e.name === "AbortError") {
        lastErr = new TimeoutError(url);
      } else if (e instanceof HttpError) {
        lastErr = e;
      } else {
        lastErr = e;
      }
    }
    if (attempt < MAX_ATTEMPTS - 1) {
      const retryAfter =
        lastErr instanceof HttpError && lastErr.status === 429 ? lastErr.retryAfterMs : undefined;
      await sleep(backoffDelay(attempt, retryAfter));
    }
  }
  if (lastErr instanceof Error) throw lastErr;
  throw new Error("Chess.com request failed");
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await cdcFetch(url);
  return await res.json();
}

// Run async tasks with a max-N concurrency, preserving input order in output.
async function runWithConcurrency<T, R>(
  items: T[],
  limit: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  async function pump() {
    while (true) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await worker(items[i], i);
    }
  }
  const runners = Array.from({ length: Math.min(limit, items.length) }, () => pump());
  await Promise.all(runners);
  return out;
}

// ---------- Zod schemas at the Chess.com API boundary ----------

const ProfileSchema = z.object({
  username: z.string(),
  name: z.string().optional(),
  title: z.string().optional(),
  country: z.string().optional(),
  avatar: z.string().optional(),
  url: z.string(),
  followers: z.number().optional(),
  joined: z.number().optional(),
  last_online: z.number().optional(),
  status: z.string().optional(),
  league: z.string().optional(),
});

const RatingBucketSchema = z.object({
  last: z.object({ rating: z.number().optional() }).optional(),
  best: z.object({ rating: z.number().optional() }).optional(),
});

const StatsSchema = z.object({
  chess_bullet: RatingBucketSchema.optional(),
  chess_blitz: RatingBucketSchema.optional(),
  chess_rapid: RatingBucketSchema.optional(),
  chess_daily: RatingBucketSchema.optional(),
}) satisfies z.ZodType<RawStats>;

const ArchivesSchema = z.object({
  archives: z.array(z.string()),
});

const TimeClassSchema = z.enum([
  "bullet",
  "blitz",
  "rapid",
  "daily",
]) satisfies z.ZodType<TimeClass>;

const PlayerSideSchema = z.object({
  username: z.string(),
  rating: z.number(),
  result: z.string(),
});

const ArchiveGameSchema = z.object({
  url: z.string(),
  pgn: z.string().optional().default(""),
  end_time: z.number(),
  time_control: z.string(),
  time_class: TimeClassSchema,
  rated: z.boolean(),
  rules: z.string().optional(),
  uuid: z.string().optional(),
  white: PlayerSideSchema,
  black: PlayerSideSchema,
  eco: z.string().optional(),
});

const ArchiveMonthSchema = z.object({
  games: z.array(z.unknown()),
});

async function doImport(user: string, displayName: string): Promise<ChessAnalytics> {
  const base = `https://api.chess.com/pub/player/${encodeURIComponent(user)}`;
  let profileRaw: z.infer<typeof ProfileSchema>;
  let stats: RawStats;
  let archives: z.infer<typeof ArchivesSchema>;
  try {
    const [p, s, a] = await Promise.all([
      fetchJson(base),
      fetchJson(`${base}/stats`),
      fetchJson(`${base}/games/archives`),
    ]);
    profileRaw = ProfileSchema.parse(p);
    stats = StatsSchema.parse(s);
    archives = ArchivesSchema.parse(a);
  } catch (e) {
    if (e instanceof HttpError) {
      if (e.status === 404) throw new Error(`Chess.com user "${displayName}" not found`);
      if (e.status === 429)
        throw new Error("Chess.com rate limit reached. Try again in a minute.");
      throw new Error(`Failed to reach Chess.com (${e.status})`);
    }
    if (e instanceof TimeoutError) throw new Error("Chess.com request timed out");
    if (e instanceof z.ZodError) throw new Error("Chess.com returned an unexpected response shape");
    throw new Error("Failed to reach Chess.com (network error)");
  }

  const recent = archives.archives.slice(-MAX_MONTHS);
  let failedArchiveMonths = 0;
  const monthly = await runWithConcurrency(recent, ARCHIVE_CONCURRENCY, async (u) => {
    try {
      const json = await fetchJson(u);
      return ArchiveMonthSchema.parse(json);
    } catch {
      failedArchiveMonths++;
      return { games: [] as unknown[] };
    }
  });

  let skippedInvalidGames = 0;
  const games: Game[] = [];
  for (const m of monthly) {
    for (const raw of m.games) {
      const parsed = ArchiveGameSchema.safeParse(raw);
      if (!parsed.success) {
        skippedInvalidGames++;
        continue;
      }
      const g = normalizeGame(parsed.data, user);
      if (g) games.push(g);
    }
  }
  games.sort((a, b) => b.endTime - a.endTime);
  const trimmed = games.slice(0, MAX_GAMES);

  const analytics = buildAnalytics(normalizeProfile(profileRaw), trimmed, stats);
  const meta: ImportMeta = {
    importedArchiveMonths: recent.length - failedArchiveMonths,
    failedArchiveMonths,
    skippedInvalidGames,
  };
  return { ...analytics, meta };
}

export const importChessProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ username: UsernameSchema }))
  .handler(async ({ data }): Promise<ChessAnalytics> => {
    const user = data.username.toLowerCase();
    const cached = cacheGet(user);
    if (cached) return cached;
    const existing = inFlight.get(user);
    if (existing) return existing;
    const p = (async () => {
      try {
        const result = await doImport(user, data.username);
        cachePut(user, result);
        return result;
      } finally {
        inFlight.delete(user);
      }
    })();
    inFlight.set(user, p);
    return p;
  });

// Test-only hook: clear caches between unit tests. Not exported from index.
export function __resetServerCacheForTests() {
  serverCache.clear();
  inFlight.clear();
}
