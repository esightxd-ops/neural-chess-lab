import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildAnalytics, normalizeGame, normalizeProfile, type RawStats } from "./analytics";
import type { ChessAnalytics, Game } from "./types";

const UA = "Chesslab/1.0 (https://lovable.dev)";

async function cdcFetch(url: string): Promise<Response> {
  return fetch(url, {
    headers: {
      "User-Agent": UA,
      Accept: "application/json",
    },
  });
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await cdcFetch(url);
  if (!res.ok) {
    const err = new Error(`Chess.com ${res.status} for ${url}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return (await res.json()) as T;
}

interface ArchivesList {
  archives: string[];
}

interface ArchiveMonth {
  games: Array<Parameters<typeof normalizeGame>[0]>;
}

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

    let profileRaw: Parameters<typeof normalizeProfile>[0];
    let stats: RawStats;
    let archives: ArchivesList;
    try {
      [profileRaw, stats, archives] = await Promise.all([
        fetchJson<Parameters<typeof normalizeProfile>[0]>(base),
        fetchJson<RawStats>(`${base}/stats`),
        fetchJson<ArchivesList>(`${base}/games/archives`),
      ]);
    } catch (e) {
      const err = e as Error & { status?: number };
      if (err.status === 404) {
        throw new Error(`Chess.com user "${data.username}" not found`);
      }
      throw new Error(`Failed to reach Chess.com (${err.status ?? "network error"})`);
    }

    const recent = archives.archives.slice(-MAX_MONTHS);
    const monthly = await Promise.all(
      recent.map((u) => fetchJson<ArchiveMonth>(u).catch(() => ({ games: [] }) as ArchiveMonth)),
    );

    const games: Game[] = [];
    for (const m of monthly) {
      for (const raw of m.games) {
        const g = normalizeGame(raw, user);
        if (g) games.push(g);
      }
    }
    games.sort((a, b) => b.endTime - a.endTime);
    const trimmed = games.slice(0, MAX_GAMES);

    return buildAnalytics(normalizeProfile(profileRaw), trimmed, stats);
  });
