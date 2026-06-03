# Chesslab — Neural Chess Lab

Chesslab is a Leetify-style competitive analytics dashboard for **Chess.com** players. Import a username and get a full performance breakdown: ratings, openings, opponents, streaks, color performance, and time-control stats.

## What it does

- Pulls a player's public profile, stats, and last few months of game archives from the Chess.com public API.
- Normalizes raw PGN data into typed `Game`, `RatingSnapshot`, `OpeningStats`, `OpponentStats`, `ColorStats`, `StreakStats`, and `TimeControlStats`.
- Computes real win rate, current/longest streaks, opening repertoire, frequent opponents, color performance, rating progression curves, and trophy-room records — all client-side from the imported games.

## How to use

1. Run `bun install` then `bun run dev`.
2. Open the app, type a Chess.com username in the top bar, hit Enter.
3. The dashboard reloads with that player's real data. The username is remembered in `localStorage`; the **Sync** button re-fetches the latest archives.

Before you import anyone, the UI runs on a deterministic demo dataset so the layout is never empty.

## Architecture

- `src/lib/chess/types.ts` — normalized domain types.
- `src/lib/chess/chess.functions.ts` — `createServerFn` that calls the Chess.com public API server-side (sets a polite User-Agent, avoids browser CORS issues).
- `src/lib/chess/analytics.ts` — pure functions that turn raw archive games into computed analytics.
- `src/lib/chess/mock.ts` — fallback demo dataset.
- `src/lib/chess/store.tsx` — React context exposing `useChessData()` to every dashboard component.
- `src/components/*` — presentation only. Every panel reads from `useChessData()`.
- `src/routes/*` — Overview, Games, Ratings, Openings, Time Controls, Opponents, Streaks, Records, Settings.

## Stack

TanStack Start v1 (React 19, SSR-ready), TanStack Query, Tailwind v4, Recharts, Zod, sonner, shadcn/ui.
