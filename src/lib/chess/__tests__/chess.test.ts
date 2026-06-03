import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { buildAnalytics, normalizeGame, normalizeProfile } from "../analytics";
import { MAX_GAMES, MAX_MONTHS, UsernameSchema } from "../validators";
import { __resetServerCacheForTests, importChessProfileHandler } from "../chess.functions";

describe("UsernameSchema", () => {
  test("rejects invalid names", () => {
    for (const bad of ["", "a", "has space", "has!bang", "a".repeat(41)]) {
      expect(UsernameSchema.safeParse(bad).success).toBe(false);
    }
  });
  test("accepts valid names", () => {
    for (const ok of ["hikaru", "magnus_c", "ding-liren", "ab", "a".repeat(40)]) {
      expect(UsernameSchema.safeParse(ok).success).toBe(true);
    }
  });
});

describe("normalizeProfile", () => {
  test("maps country slug to ISO + flag", () => {
    const p = normalizeProfile({
      username: "demo",
      url: "https://chess.com/member/demo",
      country: "https://api.chess.com/pub/country/US",
    });
    expect(p.username).toBe("demo");
    expect(p.country).toBe("US");
    expect(p.countryFlag).toBeDefined();
  });
});

const RAW_GAME = {
  url: "https://chess.com/game/1",
  pgn: '[ECO "B90"]\n[Opening "Sicilian"]\n\n1. e4 c5 2. Nf3 d6',
  end_time: Math.floor(Date.now() / 1000) - 3600,
  time_control: "600",
  time_class: "rapid" as const,
  rated: true,
  white: { username: "demo", rating: 1500, result: "win" },
  black: { username: "opp", rating: 1480, result: "resigned" },
};

describe("normalizeGame + buildAnalytics happy path", () => {
  test("normalizes a chess.com archive game", () => {
    const g = normalizeGame(RAW_GAME, "demo");
    expect(g).not.toBeNull();
    expect(g!.result).toBe("W");
    expect(g!.eco).toBe("B90");
    expect(g!.opening).toContain("Sicilian");
  });
  test("buildAnalytics produces a populated summary", () => {
    const games = Array.from({ length: 5 }).map((_, i) => {
      const g = normalizeGame(RAW_GAME, "demo")!;
      return { ...g, id: `g-${i}`, endTime: g.endTime - i * 60 };
    });
    const analytics = buildAnalytics(
      normalizeProfile({ username: "demo", url: "https://chess.com/member/demo" }),
      games,
      { chess_rapid: { last: { rating: 1500 }, best: { rating: 1520 } } },
    );
    expect(analytics.summary.totalGames).toBe(5);
    expect(analytics.summary.wins).toBe(5);
    expect(analytics.summary.primaryTimeClass).toBe("rapid");
  });
});

describe("import cap constants", () => {
  test("MAX_MONTHS is 6, MAX_GAMES is 400", () => {
    expect(MAX_MONTHS).toBe(6);
    expect(MAX_GAMES).toBe(400);
  });
});

// ----- Server-fn integration tests with mocked fetch -----

type FetchFn = typeof fetch;
const realFetch: FetchFn = globalThis.fetch;

interface MockResponseInit {
  status?: number;
  headers?: Record<string, string>;
  body?: unknown;
}
function jsonResponse(init: MockResponseInit = {}): Response {
  const status = init.status ?? 200;
  return new Response(JSON.stringify(init.body ?? {}), {
    status,
    headers: { "Content-Type": "application/json", ...(init.headers ?? {}) },
  });
}

function archiveGameRaw(seed: number) {
  return {
    url: `https://chess.com/game/${seed}`,
    pgn: `[ECO "B90"]\n[Opening "Sicilian"]\n\n1. e4 c5`,
    end_time: 1_700_000_000 + seed,
    time_control: "600",
    time_class: "rapid",
    rated: true,
    white: { username: "demo", rating: 1500, result: "win" },
    black: { username: "opp", rating: 1480, result: "resigned" },
  };
}

function buildArchiveResponses(months: number, gamesPerMonth: number, invalidPerMonth = 0) {
  const archives: string[] = [];
  const monthBodies: Record<string, unknown> = {};
  for (let m = 0; m < months; m++) {
    const url = `https://api.chess.com/pub/player/demo/games/2024/${String(m + 1).padStart(2, "0")}`;
    archives.push(url);
    const games: unknown[] = [];
    for (let g = 0; g < gamesPerMonth; g++) games.push(archiveGameRaw(m * 1000 + g));
    for (let i = 0; i < invalidPerMonth; i++) games.push({ not: "a game" });
    monthBodies[url] = { games };
  }
  return { archives, monthBodies };
}

function installMockFetch(handler: (url: string) => Promise<Response> | Response) {
  const calls: string[] = [];
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    const url = typeof input === "string" ? input : (input as URL).toString();
    calls.push(url);
    return handler(url);
  }) as FetchFn;
  return { calls };
}

beforeEach(() => {
  __resetServerCacheForTests();
});

afterEach(() => {
  globalThis.fetch = realFetch;
});

async function callImport(username: string) {
  return importChessProfileHandler({ username });
}

describe("importChessProfile (server)", () => {
  test("404 on profile surfaces 'not found' and does not retry", async () => {
    const { calls } = installMockFetch((url) => {
      if (url.endsWith("/pub/player/missing")) return jsonResponse({ status: 404 });
      return jsonResponse({ body: {} });
    });
    await expect(callImport("missing")).rejects.toThrow(/not found/i);
    const profileCalls = calls.filter((u) => u.endsWith("/pub/player/missing"));
    expect(profileCalls.length).toBe(1);
  });

  test("retries on 429 then succeeds; preserves cap and partial-meta", async () => {
    const { archives, monthBodies } = buildArchiveResponses(12, 60, 2);
    let profileAttempts = 0;
    const failedMonth = archives[archives.length - 3]; // within the last MAX_MONTHS
    installMockFetch((url) => {
      if (url === "https://api.chess.com/pub/player/demo") {
        profileAttempts++;
        if (profileAttempts === 1) return jsonResponse({ status: 429 });
        return jsonResponse({
          body: { username: "demo", url: "https://chess.com/member/demo" },
        });
      }
      if (url === "https://api.chess.com/pub/player/demo/stats") {
        return jsonResponse({ body: { chess_rapid: { last: { rating: 1500 } } } });
      }
      if (url === "https://api.chess.com/pub/player/demo/games/archives") {
        return jsonResponse({ body: { archives } });
      }
      if (url === failedMonth) return jsonResponse({ status: 500 });
      const body = monthBodies[url];
      if (body) return jsonResponse({ body });
      return jsonResponse({ status: 404 });
    });

    const data = await callImport("demo");
    expect(profileAttempts).toBeGreaterThanOrEqual(2);
    expect(data.games.length).toBeLessThanOrEqual(MAX_GAMES);
    // Only the last 6 archive months are fetched
    const meta = data.meta!;
    expect(meta.importedArchiveMonths + meta.failedArchiveMonths).toBe(MAX_MONTHS);
    expect(data.meta?.failedArchiveMonths).toBe(1);
    expect(data.meta?.skippedInvalidGames).toBeGreaterThan(0);
  }, 15_000);

  test("server-side cache returns cached result without re-fetching", async () => {
    const { archives, monthBodies } = buildArchiveResponses(2, 3);
    const { calls } = installMockFetch((url) => {
      if (url === "https://api.chess.com/pub/player/cacheuser") {
        return jsonResponse({
          body: { username: "cacheuser", url: "https://chess.com/member/cacheuser" },
        });
      }
      if (url === "https://api.chess.com/pub/player/cacheuser/stats")
        return jsonResponse({ body: {} });
      if (url === "https://api.chess.com/pub/player/cacheuser/games/archives")
        return jsonResponse({ body: { archives } });
      const body = monthBodies[url];
      if (body) return jsonResponse({ body });
      return jsonResponse({ status: 404 });
    });
    await callImport("cacheuser");
    const firstCount = calls.length;
    await callImport("cacheuser");
    expect(calls.length).toBe(firstCount); // served from cache, no new fetches
  });

  test("in-flight dedupe: concurrent calls share one underlying fetch burst", async () => {
    const { archives, monthBodies } = buildArchiveResponses(2, 3);
    const { calls } = installMockFetch((url) => {
      if (url === "https://api.chess.com/pub/player/dedupe")
        return jsonResponse({
          body: { username: "dedupe", url: "https://chess.com/member/dedupe" },
        });
      if (url === "https://api.chess.com/pub/player/dedupe/stats")
        return jsonResponse({ body: {} });
      if (url === "https://api.chess.com/pub/player/dedupe/games/archives")
        return jsonResponse({ body: { archives } });
      const body = monthBodies[url];
      if (body) return jsonResponse({ body });
      return jsonResponse({ status: 404 });
    });
    const [a, b] = await Promise.all([callImport("dedupe"), callImport("dedupe")]);
    expect(a.profile.username).toBe(b.profile.username);
    // One profile fetch, one stats, one archives, one per month (2). Dedupe means
    // the second concurrent call did not trigger any extra fetches.
    const profileCalls = calls.filter((u) => u === "https://api.chess.com/pub/player/dedupe");
    expect(profileCalls.length).toBe(1);
  });
});
