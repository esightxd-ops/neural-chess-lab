# Chesslab — Neural Chess Lab

Chesslab is a Leetify-style competitive analytics dashboard for **Chess.com** players. Import a username and get a full performance breakdown: ratings, openings, opponents, streaks, color performance, and time-control stats.

## What it does

- Fetches a player's public profile, stats, and the latest **6 months** of game archives (capped at **400 games**) from the Chess.com public API via a server-side `createServerFn` (avoids browser CORS and sets a polite `User-Agent`).
- Normalizes raw PGN data into typed `Game`, `RatingSnapshot`, `OpeningStats`, `OpponentStats`, `ColorStats`, `StreakStats`, and `TimeControlStats`.
- Computes win rate, current/longest streaks, opening repertoire, frequent opponents, color performance, rating progression curves, and trophy-room records — all client-side from the imported games.
- Falls back to a deterministic mock dataset on first load so the layout is never empty.

## How to use

1. Run `bun install` then `bun run dev`.
2. Open the app, type a Chess.com username in the top bar, and hit **Enter**.
3. The dashboard loads that player's real data. The username is persisted in `localStorage` and auto-restored on reload.
4. Click **Sync** (or re-import the same username) to re-fetch the latest archives.

Before you import anyone, the UI runs on the built-in demo dataset.

## Architecture

| File | Purpose |
|------|---------|
| `src/lib/chess/types.ts` | Normalized domain types (`Game`, `ChessAnalytics`, etc.). |
| `src/lib/chess/chess.functions.ts` | `createServerFn` (`importChessProfile`) that calls the Chess.com public API server-side. |
| `src/lib/chess/analytics.ts` | Pure functions that turn raw archive games into computed analytics. |
| `src/lib/chess/mock.ts` | Deterministic demo dataset used as the initial fallback. |
| `src/lib/chess/store.tsx` | React context (`ChessDataProvider`) exposing `useChessData()`. Handles loading/error states, `localStorage` persistence, and auto-restore on mount. |
| `src/components/*` | Presentation-only dashboard panels. Every panel reads from `useChessData()`. |
| `src/routes/*` | Overview, Games, Ratings, Openings, Time Controls, Opponents, Streaks, Records, Settings. |

## Data flow

```
TopBar ──► ChessDataProvider ──► useServerFn(importChessProfile)
                                      │
                                      ▼
                           createServerFn (server-side)
                           ├─ Chess.com /player/{user}
                           ├─ Chess.com /player/{user}/stats
                           └─ Chess.com /player/{user}/games/archives
                                      │
                                      ▼
                           analytics.ts  ──►  store.tsx
                                              (isMock = false)
                                              │
                    ┌─────────────────────────┼─────────────────────────┐
                    ▼                         ▼                         ▼
            ProfileHero.tsx          StatTileRow.tsx          RecentGamesTable.tsx
            RatingProgression.tsx    OpeningTable.tsx         TimeControlGrid.tsx
            StreaksRecords.tsx       ColorPerformance.tsx     OpponentsTable.tsx
```

## Stack

TanStack Start v1 (React 19, SSR-ready), TanStack Query, Tailwind v4, Recharts, Zod, sonner, shadcn/ui.
