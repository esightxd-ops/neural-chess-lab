import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildAnalytics, normalizeGame, normalizeProfile, type RawStats } from "./analytics";
import type { ChessAnalytics, Game, TimeClass } from "./types";

const UA = "Chesslab/1.0 (https://lovable.dev)";

async function cdcFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
    },
  });
}

async function fetchJson(url: string): Promise<unknown> {
  const res = await cdcFetch(url);
  if (!res.ok) {
    const err = new Error(`Chess.com ${res.status} for ${url}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return await res.json();
}

// ---------- Zod schemas at the Chess.com API boundary ----------
// These validate untrusted external payloads before they flow into
// normalizeProfile / normalizeGame / buildAnalytics. Domain types in
// src/lib/chess/types.ts remain the source of truth for the UI layer.

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

const RatingBucketSchema = z
  .object({
    last: z.object({ rating: z.number().optional() }).partial().optional(),
    best: z.object({ rating: z.number().optional() }).partial().optional(),
  })
  .partial();

const StatsSchema = z
  .object({
    chess_bullet: RatingBucketSchema.optional(),
    chess_blitz: RatingBucketSchema.optional(),
    chess_rapid: RatingBucketSchema.optional(),
    chess_daily: RatingBucketSchema.optional(),
  })
  .passthrough();

const ArchivesSchema = z.object({
  archives: z.array(z.string()),
});

const TimeClassSchema = z.enum(["bullet", "blitz", "rapid", "daily"]) satisfies z.ZodType<TimeClass>;

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

const MAX_MONTHS = 3;
const MAX_GAMES = 400;

export const importChessProfile = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      username: z
        .string()
        .trim()
        .min(2)
        .max(40)
        .regex(/^[a-zA-Z0-9_-]+$/, "Invalid Chess.com username"),
    }),
  )
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
      stats = StatsSchema.parse(s) as RawStats;
      archives = ArchivesSchema.parse(a);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 404) {
        throw new Error(`Chess.com user "${data.username}" not found`);
      }
      if (e instanceof z.ZodError) {
        throw new Error("Chess.com returned an unexpected response shape");
      }
      throw new Error(`Failed to reach Chess.com (${err.status ?? "network error"})`);
    }

    const recent = archives.archives.slice(-MAX_MONTHS);
    const monthly = await Promise.all(
      recent.map(async (u) => {
        try {
          const json = await fetchJson(u);
          return ArchiveMonthSchema.parse(json);
        } catch {
          return { games: [] as unknown[] };
        }
      }),
    );

    const games: Game[] = [];
    for (const m of monthly) {
      for (const raw of m.games) {
        const parsed = ArchiveGameSchema.safeParse(raw);
        if (!parsed.success) continue;
        const g = normalizeGame(parsed.data, user);
        if (g) games.push(g);
      }
    }
    games.sort((a, b) => b.endTime - a.endTime);
    const trimmed = games.slice(0, MAX_GAMES);

    return buildAnalytics(normalizeProfile(profileRaw), trimmed, stats);
  });
