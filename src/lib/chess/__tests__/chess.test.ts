import { describe, expect, test } from "bun:test";
import { buildAnalytics, normalizeGame, normalizeProfile } from "../analytics";
import { MAX_GAMES, MAX_MONTHS, UsernameSchema } from "../validators";

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

describe("normalizeGame + buildAnalytics happy path", () => {
  const raw = {
    url: "https://chess.com/game/1",
    pgn: '[ECO "B90"]\n[Opening "Sicilian"]\n\n1. e4 c5 2. Nf3 d6',
    end_time: Math.floor(Date.now() / 1000) - 3600,
    time_control: "600",
    time_class: "rapid" as const,
    rated: true,
    white: { username: "demo", rating: 1500, result: "win" },
    black: { username: "opp", rating: 1480, result: "resigned" },
  };
  test("normalizes a chess.com archive game", () => {
    const g = normalizeGame(raw, "demo");
    expect(g).not.toBeNull();
    expect(g!.result).toBe("W");
    expect(g!.eco).toBe("B90");
    expect(g!.opening).toContain("Sicilian");
  });
  test("buildAnalytics produces a populated summary", () => {
    const games = Array.from({ length: 5 }).map((_, i) => normalizeGame(raw, "demo")!).map(
      (g, i) => ({ ...g, id: `g-${i}`, endTime: g.endTime - i * 60 }),
    );
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
