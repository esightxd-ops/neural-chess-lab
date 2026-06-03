import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { buildAnalytics, normalizeGame, normalizeProfile, type RawStats } from "./analytics";
import type { ChessAnalytics, Game } from "./types";

const UA = "Chesslab/1.0 (https://chesslab.lovable.app; contact: lovable)";

interface RawArchive {
  games: Array<{
    url: string;
    pgn: string;
    end_time: number;
    time_control: string;
    time_class: "bullet" | "blitz" | "rapid" | "daily";
    rated: boolean;
    rules?: string;
    uuid?: string;
    white: { username: string; rating: number; result: string };
    black: { username: string; rating: number; result: string };
    eco?: string;
  }>;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  return (await res.json()) as T;
}

const inputSchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, "Username too short")
    .max(64, "Username too long")
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid characters in username"),
  months: z.number().int().min(1).max(12).optional(),
});

export const importChessProfile = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => inputSchema.parse(input))
  .handler(async ({ data }): Promise<{ ok: true; data: ChessAnalytics } | { ok: false; error: string; status?: number }> => {
    const username = data.username.toLowerCase();
    const months = data.months ?? 3;
    try {
      const profileRaw = await fetchJson<{
        username: string; name?: string; title?: string; country?: string;
        avatar?: string; url: string; followers?: number; joined?: number;
        last_online?: number; status?: string; league?: string;
      }>(`https://api.chess.com/pub/player/${username}`);

      if (!profileRaw) {
        return { ok: false, status: 404, error: `No Chess.com player found for "${data.username}".` };
      }

      const [statsRaw, country, archivesList] = await Promise.all([
        fetchJson<RawStats>(`https://api.chess.com/pub/player/${username}/stats`).catch(() => null),
        profileRaw.country
          ? fetchJson<{ code: string; name: string }>(profileRaw.country).catch(() => null)
          : Promise.resolve(null),
        fetchJson<{ archives: string[] }>(
          `https://api.chess.com/pub/player/${username}/games/archives`,
        ),
      ]);

      const archives = (archivesList?.archives ?? []).slice(-months);
      const archivePages = await Promise.all(
        archives.map((u) => fetchJson<RawArchive>(u).catch(() => null)),
      );

      const games: Game[] = [];
      for (const page of archivePages) {
        if (!page?.games) continue;
        for (const g of page.games) {
          const norm = normalizeGame(g, username);
          if (norm) games.push(norm);
        }
      }

      const profile = normalizeProfile({
        ...profileRaw,
        country: country?.code ?? profileRaw.country,
      });

      const analytics = buildAnalytics(profile, games, statsRaw ?? {});
      return { ok: true, data: analytics };
    } catch (err) {
      console.error("importChessProfile failed", err);
      const message = err instanceof Error ? err.message : "Unknown error";
      return { ok: false, error: `Failed to import "${data.username}": ${message}` };
    }
  });
