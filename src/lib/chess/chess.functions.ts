import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildAnalytics, normalizeGame, normalizeProfile, type RawStats } from "./analytics";
import type { ChessAnalytics, Game, ImportMeta, TimeClass } from "./types";
import { MAX_GAMES, MAX_MONTHS, UsernameSchema } from "./validators";

const UA = "Chesslab/1.0 (https://lovable.dev)";
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [300, 800, 1800];

class HttpError extends Error {
  status: number;
  retryAfter?: number;
  constructor(status: number, message: string, retryAfter?: number) {
    super(message);
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

function isTransientStatus(status: number) {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// Fetch with AbortController timeout + retry/backoff for transient errors only.
// 400 / 403 / 404 are surfaced immediately so callers can map them to UX
// (e.g. the existing 404 → "user not found" branch).
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
      if (!isTransientStatus(res.status)) {
        const retryAfterHdr = res.headers.get("retry-after");
        throw new HttpError(
          res.status,
          `Chess.com ${res.status} for ${url}`,
          retryAfterHdr ? Number(retryAfterHdr) : undefined,
        );
      }
      // transient: maybe retry
      const retryAfterHdr = res.headers.get("retry-after");
      lastErr = new HttpError(
        res.status,
        `Chess.com ${res.status} for ${url}`,
        retryAfterHdr ? Number(retryAfterHdr) : undefined,
      );
    } catch (e) {
      clearTimeout(timer);
      if (e instanceof HttpError && !isTransientStatus(e.status)) throw e;
      lastErr = e;
    }
    if (attempt < MAX_ATTEMPTS - 1) {
      let delay = BACKOFF_MS[attempt] ?? 1800;
      if (lastErr instanceof HttpError && lastErr.retryAfter && lastErr.status === 429) {
        delay = Math.min(Math.max(lastErr.retryAfter * 1000, delay), 5000);
      }
      await sleep(delay);
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Chess.com request failed");
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await cdcFetch(url);
  return await res.json();
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

// No .passthrough() so the inferred type aligns with RawStats and we can drop the cast.
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

export const importChessProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({ username: UsernameSchema }))
  .handler(async ({ data }): Promise<ChessAnalytics> => {
    const user = data.username.toLowerCase();
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
        if (e.status === 404) {
          throw new Error(`Chess.com user "${data.username}" not found`);
        }
        if (e.status === 429) {
          throw new Error("Chess.com rate limit reached. Try again in a minute.");
        }
        throw new Error(`Failed to reach Chess.com (${e.status})`);
      }
      if (e instanceof z.ZodError) {
        throw new Error("Chess.com returned an unexpected response shape");
      }
      throw new Error("Failed to reach Chess.com (network error)");
    }

    const recent = archives.archives.slice(-MAX_MONTHS);
    let failedArchiveMonths = 0;
    const monthly = await Promise.all(
      recent.map(async (u) => {
        try {
          const json = await fetchJson(u);
          return ArchiveMonthSchema.parse(json);
        } catch {
          failedArchiveMonths++;
          return { games: [] as unknown[] };
        }
      }),
    );

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
  });
