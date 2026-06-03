import type {
  ChessAnalytics,
  ColorStats,
  Game,
  GameResult,
  OpeningStats,
  OpponentStats,
  PieceColor,
  PlayerProfile,
  RatingSnapshot,
  RecordItem,
  StreakStats,
  TimeClass,
  TimeControlStats,
} from "./types";

const TIME_CLASSES: TimeClass[] = ["bullet", "blitz", "rapid", "daily"];

const DRAW_TERMS = new Set([
  "agreed",
  "repetition",
  "stalemate",
  "insufficient",
  "50move",
  "timevsinsufficient",
]);

function classifyResult(raw: string): GameResult {
  if (raw === "win") return "W";
  if (DRAW_TERMS.has(raw)) return "D";
  return "L";
}

function countryFlag(iso?: string): string | undefined {
  if (!iso || iso.length !== 2) return undefined;
  const A = 0x1f1e6;
  return String.fromCodePoint(
    ...iso
      .toUpperCase()
      .split("")
      .map((c) => A + c.charCodeAt(0) - 65),
  );
}

function pgnTag(pgn: string, tag: string): string | undefined {
  const m = pgn.match(new RegExp(`\\[${tag}\\s+"([^"]*)"\\]`));
  return m?.[1];
}

function countMoves(pgn: string): number {
  // count "N." sequences in the move text portion
  const body = pgn.split(/\n\n/).slice(1).join("\n\n") || pgn;
  const matches = body.match(/\b\d+\./g);
  return matches ? matches.length : 0;
}

function openingFromEcoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const slug = url.split("/").pop();
  if (!slug) return undefined;
  return slug
    .replace(/-/g, " ")
    .replace(/\b(\d+\.{1,3}.*)$/i, "") // strip trailing move sequence
    .trim();
}

interface RawArchiveGame {
  url: string;
  pgn: string;
  end_time: number;
  time_control: string;
  time_class: TimeClass;
  rated: boolean;
  rules?: string;
  uuid?: string;
  white: { username: string; rating: number; result: string };
  black: { username: string; rating: number; result: string };
  eco?: string;
}

export function normalizeGame(raw: RawArchiveGame, user: string): Game | null {
  if (raw.rules && raw.rules !== "chess") return null;
  const u = user.toLowerCase();
  const isWhite = raw.white.username.toLowerCase() === u;
  const isBlack = raw.black.username.toLowerCase() === u;
  if (!isWhite && !isBlack) return null;
  const playerColor: PieceColor = isWhite ? "white" : "black";
  const me = isWhite ? raw.white : raw.black;
  const opp = isWhite ? raw.black : raw.white;
  const pgn = raw.pgn || "";
  const ecoTag = pgnTag(pgn, "ECO") || raw.eco?.split("/").pop() || "";
  const opening =
    pgnTag(pgn, "Opening") || openingFromEcoUrl(pgnTag(pgn, "ECOUrl") || raw.eco) || "Unknown";
  return {
    id: raw.uuid || raw.url,
    url: raw.url,
    endTime: raw.end_time,
    timeClass: raw.time_class,
    timeControl: raw.time_control,
    rated: raw.rated,
    playerColor,
    playerRating: me.rating,
    opponent: opp.username,
    opponentRating: opp.rating,
    result: classifyResult(me.result),
    termination: me.result === "win" ? opp.result : me.result,
    moves: countMoves(pgn),
    opening: opening.trim() || "Unknown",
    eco: ecoTag,
  };
}

function ratingHistory(games: Game[]): RatingSnapshot[] {
  return games
    .map((g) => ({ t: g.endTime, rating: g.playerRating, timeClass: g.timeClass }))
    .sort((a, b) => a.t - b.t);
}

function computeTimeControlStats(
  games: Game[],
  history: RatingSnapshot[],
  fallbackCurrent: Partial<Record<TimeClass, { current?: number; best?: number }>>,
): Record<TimeClass, TimeControlStats | undefined> {
  const now = Math.floor(Date.now() / 1000);
  const D7 = 7 * 86400;
  const D30 = 30 * 86400;
  const out: Record<TimeClass, TimeControlStats | undefined> = {
    bullet: undefined,
    blitz: undefined,
    rapid: undefined,
    daily: undefined,
  };
  for (const tc of TIME_CLASSES) {
    const tcGames = games.filter((g) => g.timeClass === tc);
    const tcHist = history.filter((h) => h.timeClass === tc);
    const apiCurrent = fallbackCurrent[tc]?.current;
    const apiBest = fallbackCurrent[tc]?.best;
    if (tcGames.length === 0 && !apiCurrent) continue;
    const w = tcGames.filter((g) => g.result === "W").length;
    const l = tcGames.filter((g) => g.result === "L").length;
    const d = tcGames.filter((g) => g.result === "D").length;
    const total = w + l + d;
    const avgOpp = total
      ? Math.round(tcGames.reduce((s, g) => s + g.opponentRating, 0) / total)
      : 0;
    const sortedHist = tcHist.slice().sort((a, b) => a.t - b.t);
    const current = apiCurrent ?? sortedHist[sortedHist.length - 1]?.rating ?? 0;
    const best = Math.max(apiBest ?? 0, ...sortedHist.map((h) => h.rating), current);
    const worst = sortedHist.length ? Math.min(...sortedHist.map((h) => h.rating)) : undefined;
    const r7 = sortedHist.find((h) => h.t >= now - D7)?.rating;
    const r30 = sortedHist.find((h) => h.t >= now - D30)?.rating;
    out[tc] = {
      timeClass: tc,
      rating: current,
      best,
      worst,
      games: total,
      w,
      l,
      d,
      winRate: total ? (w / total) * 100 : 0,
      avgOpponent: avgOpp,
      delta7d: r7 != null ? current - r7 : 0,
      delta30d: r30 != null ? current - r30 : 0,
    };
  }
  return out;
}

function computeOpenings(games: Game[]): OpeningStats[] {
  const map = new Map<string, OpeningStats>();
  // approximate per-game rating delta using surrounding games of same time class
  const byTc = new Map<TimeClass, Game[]>();
  for (const g of games) {
    const arr = byTc.get(g.timeClass) ?? [];
    arr.push(g);
    byTc.set(g.timeClass, arr);
  }
  for (const arr of byTc.values()) arr.sort((a, b) => a.endTime - b.endTime);
  const deltaByGame = new Map<string, number>();
  for (const arr of byTc.values()) {
    for (let i = 0; i < arr.length; i++) {
      const next = arr[i + 1];
      const delta = next ? next.playerRating - arr[i].playerRating : 0;
      deltaByGame.set(arr[i].id, delta);
    }
  }
  for (const g of games) {
    const key = g.opening;
    const cur = map.get(key) || {
      name: g.opening,
      eco: g.eco,
      games: 0,
      w: 0,
      l: 0,
      d: 0,
      winRate: 0,
      avgLen: 0,
      delta: 0,
    };
    cur.games++;
    if (g.result === "W") cur.w++;
    else if (g.result === "L") cur.l++;
    else cur.d++;
    cur.avgLen += g.moves;
    cur.delta += deltaByGame.get(g.id) ?? 0;
    if (!cur.eco) cur.eco = g.eco;
    map.set(key, cur);
  }
  return Array.from(map.values())
    .filter((o) => o.games >= 3)
    .map((o) => ({
      ...o,
      avgLen: Math.round(o.avgLen / o.games),
      winRate: (o.w / o.games) * 100,
      delta: Math.round(o.delta),
    }))
    .sort((a, b) => b.games - a.games);
}

function computeOpponents(games: Game[]): OpponentStats[] {
  const map = new Map<string, { games: Game[] }>();
  for (const g of games) {
    const key = g.opponent.toLowerCase();
    const cur = map.get(key) || { games: [] };
    cur.games.push(g);
    map.set(key, cur);
  }
  return Array.from(map.entries())
    .map(([_, v]) => {
      const w = v.games.filter((g) => g.result === "W").length;
      const l = v.games.filter((g) => g.result === "L").length;
      const d = v.games.filter((g) => g.result === "D").length;
      const total = v.games.length;
      const avg = Math.round(v.games.reduce((s, g) => s + g.opponentRating, 0) / total);
      const modeCount: Record<string, number> = {};
      for (const g of v.games) modeCount[g.timeClass] = (modeCount[g.timeClass] || 0) + 1;
      const favMode =
        Object.entries(modeCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? v.games[0].timeClass;
      return {
        username: v.games[0].opponent,
        games: total,
        w,
        l,
        d,
        avgRating: avg,
        lastPlayed: Math.max(...v.games.map((g) => g.endTime)),
        favoriteMode: favMode,
      };
    })
    .filter((o) => o.games >= 2)
    .sort((a, b) => b.games - a.games);
}

function computeColors(games: Game[]): ColorStats[] {
  const out: ColorStats[] = [];
  for (const color of ["white", "black"] as const) {
    const list = games.filter((g) => g.playerColor === color);
    if (!list.length) continue;
    const w = list.filter((g) => g.result === "W").length;
    const l = list.filter((g) => g.result === "L").length;
    const d = list.filter((g) => g.result === "D").length;
    const total = list.length;
    const avgOpp = Math.round(list.reduce((s, g) => s + g.opponentRating, 0) / total);
    const opMap = new Map<string, number>();
    for (const g of list) opMap.set(g.opening, (opMap.get(g.opening) || 0) + 1);
    const topOpenings = Array.from(opMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n]) => n);
    out.push({
      color,
      games: total,
      w,
      l,
      d,
      winRate: (w / total) * 100,
      avgOpponent: avgOpp,
      delta: Math.round(list.reduce((s, g) => s + (g.playerRating - g.opponentRating), 0) / total),
      topOpenings,
    });
  }
  return out;
}

function computeStreaks(games: Game[]): StreakStats {
  if (!games.length) {
    return {
      currentResult: "D",
      currentLength: 0,
      longestWin: 0,
      longestUnbeaten: 0,
      longestLoss: 0,
    };
  }
  const ordered = games.slice().sort((a, b) => a.endTime - b.endTime);
  let longestWin = 0;
  let longestLoss = 0;
  let longestUnbeaten = 0;
  let runW = 0;
  let runL = 0;
  let runU = 0;
  for (const g of ordered) {
    if (g.result === "W") {
      runW++;
      runU++;
      runL = 0;
    } else if (g.result === "D") {
      runW = 0;
      runU++;
      runL = 0;
    } else {
      runL++;
      runW = 0;
      runU = 0;
    }
    longestWin = Math.max(longestWin, runW);
    longestLoss = Math.max(longestLoss, runL);
    longestUnbeaten = Math.max(longestUnbeaten, runU);
  }
  // current streak from the most recent game backwards
  const recent = ordered[ordered.length - 1];
  let currentLength = 1;
  for (let i = ordered.length - 2; i >= 0; i--) {
    if (ordered[i].result === recent.result) currentLength++;
    else break;
  }
  return {
    currentResult: recent.result,
    currentLength,
    longestWin,
    longestUnbeaten,
    longestLoss,
  };
}

function computeRecords(
  games: Game[],
  byTc: Record<TimeClass, TimeControlStats | undefined>,
  streaks: StreakStats,
): RecordItem[] {
  const out: RecordItem[] = [];
  out.push({
    label: `Current ${streaks.currentResult === "W" ? "win" : streaks.currentResult === "L" ? "loss" : "draw"} streak`,
    value: String(streaks.currentLength),
    sub: "ongoing",
    kind: "streak",
  });
  out.push({ label: "Longest win streak", value: String(streaks.longestWin), kind: "streak" });
  out.push({ label: "Longest unbeaten", value: String(streaks.longestUnbeaten), kind: "streak" });
  for (const tc of TIME_CLASSES) {
    const s = byTc[tc];
    if (!s) continue;
    out.push({
      label: `Highest ${tc}`,
      value: String(s.best),
      sub: `current ${s.rating}`,
      kind: "rating",
    });
  }
  if (games.length) {
    const longest = games.reduce((a, b) => (b.moves > a.moves ? b : a));
    out.push({
      label: "Longest game",
      value: `${longest.moves} moves`,
      sub: `vs ${longest.opponent}`,
      kind: "game",
    });
    const wins = games.filter((g) => g.result === "W" && g.moves > 0);
    if (wins.length) {
      const shortest = wins.reduce((a, b) => (b.moves < a.moves ? b : a));
      out.push({
        label: "Shortest win",
        value: `${shortest.moves} moves`,
        sub: `vs ${shortest.opponent}`,
        kind: "game",
      });
    }
    // most active day
    const dayMap = new Map<string, number>();
    for (const g of games) {
      const d = new Date(g.endTime * 1000).toISOString().slice(0, 10);
      dayMap.set(d, (dayMap.get(d) || 0) + 1);
    }
    const top = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      out.push({
        label: "Most active day",
        value: `${top[1]} games`,
        sub: top[0],
        kind: "activity",
      });
    }
  }
  return out;
}

export interface RawStats {
  chess_bullet?: { last?: { rating?: number }; best?: { rating?: number } };
  chess_blitz?: { last?: { rating?: number }; best?: { rating?: number } };
  chess_rapid?: { last?: { rating?: number }; best?: { rating?: number } };
  chess_daily?: { last?: { rating?: number }; best?: { rating?: number } };
}

export function buildAnalytics(
  profile: PlayerProfile,
  games: Game[],
  stats: RawStats,
): ChessAnalytics {
  const fallback: Partial<Record<TimeClass, { current?: number; best?: number }>> = {
    bullet: { current: stats.chess_bullet?.last?.rating, best: stats.chess_bullet?.best?.rating },
    blitz: { current: stats.chess_blitz?.last?.rating, best: stats.chess_blitz?.best?.rating },
    rapid: { current: stats.chess_rapid?.last?.rating, best: stats.chess_rapid?.best?.rating },
    daily: { current: stats.chess_daily?.last?.rating, best: stats.chess_daily?.best?.rating },
  };
  const history = ratingHistory(games);
  const byTimeClass = computeTimeControlStats(games, history, fallback);
  const openings = computeOpenings(games);
  const opponents = computeOpponents(games);
  const colors = computeColors(games);
  const streaks = computeStreaks(games);
  const records = computeRecords(games, byTimeClass, streaks);
  const totalGames = games.length;
  const wins = games.filter((g) => g.result === "W").length;
  const losses = games.filter((g) => g.result === "L").length;
  const draws = games.filter((g) => g.result === "D").length;
  const avgOpponent = totalGames
    ? Math.round(games.reduce((s, g) => s + g.opponentRating, 0) / totalGames)
    : 0;
  // pick most-played time class as primary (prefer rapid if tied)
  const order: TimeClass[] = ["rapid", "blitz", "bullet", "daily"];
  const primary =
    order.find((tc) => byTimeClass[tc] && byTimeClass[tc]!.games > 0) ??
    order.find((tc) => byTimeClass[tc]) ??
    "rapid";
  const primaryStats = byTimeClass[primary];
  return {
    profile,
    fetchedAt: Math.floor(Date.now() / 1000),
    games: games.slice().sort((a, b) => b.endTime - a.endTime),
    ratingHistory: history,
    byTimeClass,
    openings,
    opponents,
    colors,
    streaks,
    records,
    summary: {
      totalGames,
      wins,
      losses,
      draws,
      winRate: totalGames ? (wins / totalGames) * 100 : 0,
      avgOpponent,
      primaryTimeClass: primary,
      primaryRating: primaryStats?.rating ?? 0,
      primaryDelta7d: primaryStats?.delta7d ?? 0,
      primaryDelta30d: primaryStats?.delta30d ?? 0,
    },
  };
}

export function normalizeProfile(raw: {
  username: string;
  name?: string;
  title?: string;
  country?: string;
  avatar?: string;
  url: string;
  followers?: number;
  joined?: number;
  last_online?: number;
  status?: string;
  league?: string;
}): PlayerProfile {
  const countryCode = raw.country?.split("/").pop();
  return {
    username: raw.username,
    name: raw.name,
    title: raw.title,
    country: countryCode,
    countryFlag: countryFlag(countryCode),
    avatar: raw.avatar,
    url: raw.url,
    followers: raw.followers,
    joinedAt: raw.joined,
    lastOnline: raw.last_online,
    status: raw.status,
    league: raw.league,
  };
}
