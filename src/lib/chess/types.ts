// Normalized domain types for Chesslab.
// These shapes are produced by `computeAnalytics()` from raw Chess.com payloads
// and consumed by every dashboard component.

export type TimeClass = "bullet" | "blitz" | "rapid" | "daily";
export type GameResult = "W" | "L" | "D";
export type PieceColor = "white" | "black";

export interface PlayerProfile {
  username: string;
  name?: string;
  title?: string;
  country?: string; // ISO code, e.g. "US"
  countryFlag?: string; // emoji
  avatar?: string;
  url: string;
  followers?: number;
  joinedAt?: number; // unix seconds
  lastOnline?: number;
  status?: string;
  league?: string;
}

export interface Game {
  id: string;
  url: string;
  endTime: number; // unix seconds
  timeClass: TimeClass;
  timeControl: string; // raw e.g. "600", "180+2"
  rated: boolean;
  playerColor: PieceColor;
  playerRating: number;
  opponent: string;
  opponentRating: number;
  result: GameResult;
  termination: string; // resign/timeout/checkmate/agreed/...
  moves: number;
  opening: string;
  eco: string;
}

export interface RatingSnapshot {
  t: number; // unix seconds
  rating: number;
  timeClass: TimeClass;
}

export interface TimeControlStats {
  timeClass: TimeClass;
  rating: number;
  best: number;
  worst?: number;
  games: number;
  w: number;
  l: number;
  d: number;
  winRate: number;
  avgOpponent: number;
  delta7d: number;
  delta30d: number;
}

export interface OpeningStats {
  name: string;
  eco: string;
  games: number;
  w: number;
  l: number;
  d: number;
  winRate: number;
  avgLen: number;
  delta: number; // rating delta sum
}

export interface OpponentStats {
  username: string;
  games: number;
  w: number;
  l: number;
  d: number;
  avgRating: number;
  lastPlayed: number;
  favoriteMode: string;
}

export interface ColorStats {
  color: PieceColor;
  games: number;
  w: number;
  l: number;
  d: number;
  winRate: number;
  avgOpponent: number;
  delta: number;
  topOpenings: string[];
}

export interface StreakStats {
  currentResult: GameResult;
  currentLength: number;
  longestWin: number;
  longestUnbeaten: number;
  longestLoss: number;
}

export interface RecordItem {
  label: string;
  value: string;
  sub?: string;
  kind: "rating" | "streak" | "activity" | "game";
}

export interface DashboardSummary {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgOpponent: number;
  primaryTimeClass: TimeClass;
  primaryRating: number;
  primaryDelta7d: number;
  primaryDelta30d: number;
  primaryPercentile?: number;
}

export interface ImportMeta {
  importedArchiveMonths: number;
  failedArchiveMonths: number;
  skippedInvalidGames: number;
}

export interface ChessAnalytics {
  profile: PlayerProfile;
  fetchedAt: number;
  games: Game[];
  ratingHistory: RatingSnapshot[];
  byTimeClass: Record<TimeClass, TimeControlStats | undefined>;
  openings: OpeningStats[];
  opponents: OpponentStats[];
  colors: ColorStats[];
  streaks: StreakStats;
  records: RecordItem[];
  summary: DashboardSummary;
  meta?: ImportMeta;
}

// Canonical import-result type. Re-exported from `store-context.ts` for
// component consumers. Kept here so non-React modules can import it too.
export type ImportResult =
  | { ok: true; username: string }
  | { ok: false; error: string };
