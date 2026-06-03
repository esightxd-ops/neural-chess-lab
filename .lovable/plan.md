# Phase 2 — API Integration Hardening

Eight focused passes over the existing Chess.com integration. No UI redesign, no new state library, no new framework. All work stays inside `src/lib/chess/*` plus one test file and a small provider tweak.

---

## 1. Fetch reliability (`chess.functions.ts`)

Add an internal `cdcFetch` helper:

- `AbortController` with 10s timeout per request.
- Retry with exponential backoff (e.g. 300ms → 800ms → 1800ms, max 3 attempts) ONLY for: network/abort errors, HTTP 408, 429, and 5xx.
- Never retry 400 / 403 / 404 — throw immediately so the existing 404 → "user not found" branch keeps working.
- Honor `Retry-After` header when present on 429.
- Keep `createServerFn`, Zod schemas, `MAX_MONTHS = 6`, `MAX_GAMES = 400` unchanged.

## 2. Partial-import warnings

Today, archive months that fail to fetch silently become `{ games: [] }`. Surface this:

- Extend `ChessAnalytics` (in `types.ts`) with an optional `meta` field:
  ```ts
  meta?: {
    importedArchiveMonths: number;
    failedArchiveMonths: number;
    skippedInvalidGames: number;
  }
  ```
- `importChessProfile` counts failed months and Zod-rejected games and returns them in `meta`.
- `ChessDataProvider` reads `meta` after a successful import. If `failedArchiveMonths > 0` or `skippedInvalidGames > 0`, show a small `toast.warning` ("Imported with N month(s) skipped") — no layout change.
- Import is still considered successful as long as profile + stats resolved and ≥0 games loaded.

## 3. In-memory profile cache (`store.tsx`)

- Add a module-level `Map<string, { data: ChessAnalytics; at: number }>` keyed by lowercased username.
- TTL = 5 minutes.
- `importProfile(name)` checks cache first and short-circuits with cached analytics (sets loading false immediately, no toast change).
- `refresh()` always bypasses cache and re-fetches, then writes the fresh result back into the cache.
- `localStorage` continues to store only the last username string. No analytics persisted to storage.

## 4. Rate-limit protection

- Provider: ignore `importProfile` calls while `isLoading` is true (already partly true via `lastReqId`; make it explicit and return `{ ok:false, error:"Import already in progress" }`).
- Per-username cooldown: 10s between non-sync imports for the same username. `refresh()` is exempt.
- Server function: when the upstream Chess.com response is 429, throw a normalized error message: `"Chess.com rate limit reached. Try again in a minute."` so the existing toast surfaces it verbatim.

## 5. Tighten types at the boundary

- In `analytics.ts`, export a `RawStats` shape that mirrors the Zod schema exactly (`last?.rating`, `best?.rating` per bucket).
- Adjust `StatsSchema` so `z.infer<typeof StatsSchema>` is assignable to `RawStats` without a cast.
- Remove the `as RawStats` cast in `chess.functions.ts`.
- Domain types in `types.ts` stay unchanged (UI source of truth).

## 6. Auto-restore loading clarity (`store.tsx` + `TopBar.tsx`)

- On mount, when a stored username exists, set `isLoading = true` before calling `runImport`, keep `isMock = true`, and keep mock analytics on screen.
- `TopBar` status pill: when `isLoading && isMock`, show `importing…` (or `syncing…` if a previous username is known) instead of `demo data`. Tiny string change only; no layout edits.
- If auto-restore fails: keep the mock dashboard, surface the error toast (already wired), and clear stored username only on validation errors (invalid username / 404), not on transient network errors — so a reload later can retry.

## 7. Smoke test

Project has no test runner today, so add the lightest practical option:

- Add `bun test` script + a single `src/lib/chess/__tests__/chess.test.ts` using `bun:test` (zero deps).
- Cases:
  1. Username validator rejects `""`, `"a"`, `"has space"`, and `"toolong……"`.
  2. Mocked 404 → server fn throws `Chess.com user "X" not found`.
  3. Happy-path: feed canned profile/stats/archive JSON through `normalizeProfile`, `normalizeGame`, `buildAnalytics`; assert non-empty summary + correct totals.
  4. Cap enforcement: feed 12 archive URLs + 1000 games; assert ≤ 6 months fetched and ≤ 400 games in result.
- Mock `fetch` via `globalThis.fetch = ...` inside the test; no network.

## 8. Server/client boundary audit

Quick read-only sweep, fix only if leaks exist:

- `rg` for `api.chess.com` and `fetch(` outside `src/lib/chess/chess.functions.ts`.
- Confirm components import from `@/lib/chess/store-context` (data) or `chess.functions` only via the provider (not directly).
- External `chess.com` links in `RecentGamesTable` / `ProfileHero` are fine — they're hrefs, not fetches.
- Report findings; only patch genuine leaks.

---

## Technical notes

- All retry/timeout/cache constants live as named consts at the top of their files so they're easy to tune.
- No new dependencies. `bun:test` is built-in.
- `routeTree.gen.ts` is auto-generated; not touched.
- Files touched:
  - `src/lib/chess/chess.functions.ts` (passes 1, 2, 4, 5)
  - `src/lib/chess/analytics.ts` (pass 5, minor)
  - `src/lib/chess/types.ts` (pass 2, add optional `meta`)
  - `src/lib/chess/store.tsx` (passes 2, 3, 4, 6)
  - `src/components/TopBar.tsx` (pass 6, string only)
  - `src/lib/chess/__tests__/chess.test.ts` (pass 7, new)
  - `package.json` (pass 7, add `"test": "bun test"`)

## Out of scope

- No UI redesign, no new components, no route changes.
- No new state library, no React Query introduction.
- No persistence of analytics to localStorage/IndexedDB.
- No queue/background-job infrastructure.
