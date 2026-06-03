import type { ChessAnalytics, Game, PlayerProfile } from "./types";
import { buildAnalytics } from "./analytics";

// Synthesize a deterministic ~360-game history so the UI feels alive
// before the user imports a real account. Used as a sample dataset only.

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const OPENINGS = [
  ["Sicilian Defense Najdorf Variation", "B90"],
  ["Caro Kann Defense Advance Variation", "B12"],
  ["Ruy Lopez Berlin Defense", "C67"],
  ["Italian Game", "C50"],
  ["Queens Gambit Declined", "D37"],
  ["Kings Indian Defense", "E90"],
  ["London System", "D02"],
  ["Pirc Defense", "B07"],
  ["French Defense", "C11"],
  ["English Opening", "A20"],
];

const OPPONENTS = [
  "grandpawn_42", "knightmare", "bishop_blast", "endgame_eli", "tactical_tim",
  "deepblue_jr", "pawnpusher", "rookieboss", "zugzwang_z", "blunderbuss",
  "passed_pawn", "fianchetto", "kingsafety", "openfile", "centralpawn",
];

const TC = ["bullet", "blitz", "rapid", "daily"] as const;
const TC_CONTROL: Record<(typeof TC)[number], string> = {
  bullet: "60",
  blitz: "300",
  rapid: "600",
  daily: "1/86400",
};
const TC_BASE: Record<(typeof TC)[number], number> = {
  bullet: 1612,
  blitz: 1756,
  rapid: 1842,
  daily: 1924,
};

function generateGames(seed = 42, n = 360): Game[] {
  const rng = rand(seed);
  const now = Math.floor(Date.now() / 1000);
  const games: Game[] = [];
  const drift: Record<(typeof TC)[number], number> = { bullet: 0, blitz: 0, rapid: 0, daily: 0 };
  for (let i = 0; i < n; i++) {
    const tc = TC[Math.floor(rng() * TC.length)];
    drift[tc] += (rng() - 0.46) * 6;
    const myRating = Math.round(TC_BASE[tc] + drift[tc] - 80 + i * 0.4);
    const oppRating = Math.round(myRating + (rng() - 0.5) * 120);
    const color = rng() > 0.5 ? "white" : "black";
    const roll = rng();
    const result: "W" | "L" | "D" =
      roll < 0.55 ? "W" : roll < 0.9 ? "L" : "D";
    const [opening, eco] = OPENINGS[Math.floor(rng() * OPENINGS.length)];
    const opp = OPPONENTS[Math.floor(rng() * OPPONENTS.length)];
    const moves = 20 + Math.floor(rng() * 60);
    games.push({
      id: `mock-${i}`,
      url: `https://www.chess.com/game/live/${i}`,
      endTime: now - (n - i) * 3600 * 4 + Math.floor(rng() * 3600),
      timeClass: tc,
      timeControl: TC_CONTROL[tc],
      rated: true,
      playerColor: color,
      playerRating: myRating,
      opponent: opp,
      opponentRating: oppRating,
      result,
      termination: result === "W" ? "resigned" : result === "L" ? "checkmated" : "agreed",
      moves,
      opening,
      eco,
    });
  }
  return games;
}

const MOCK_PROFILE: PlayerProfile = {
  username: "demo_player",
  name: "Demo Player",
  title: undefined,
  country: "US",
  countryFlag: "🇺🇸",
  url: "https://www.chess.com/member/demo_player",
  followers: 248,
  joinedAt: 1583020800,
  lastOnline: Math.floor(Date.now() / 1000) - 120,
  status: "premium",
  league: "Crystal",
};

let _cache: ChessAnalytics | null = null;

export function getMockAnalytics(): ChessAnalytics {
  if (_cache) return _cache;
  const games = generateGames();
  _cache = buildAnalytics(MOCK_PROFILE, games, {
    chess_bullet: { last: { rating: 1612 }, best: { rating: 1634 } },
    chess_blitz: { last: { rating: 1756 }, best: { rating: 1812 } },
    chess_rapid: { last: { rating: 1842 }, best: { rating: 1864 } },
    chess_daily: { last: { rating: 1924 }, best: { rating: 1948 } },
  });
  return _cache;
}
