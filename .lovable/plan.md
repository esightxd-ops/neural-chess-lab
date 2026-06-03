# Phase 3 — Reliability, Caching & Tests

Eight focused passes. No UI redesign. All edits stay inside `src/lib/chess/*`, `src/components/TopBar.tsx`, `README.md`, and tests.

---

## 1. Server-side cache + in-flight dedupe (`chess.functions.ts`)

Add module-level state inside the server fn module (lives on the Worker per isolate):

- `serverCache: Map<string, { data: ChessAnalytics; at: number }>` — TTL 5 min.
- `inFlight: Map<string, Promise<ChessAnalytics>>` — same-username concurrent calls share one promise.
- Bounded size (e.g. 50 entries) with simple FIFO eviction on insert.
- Key = `username.toLowerCase()`.
- Flow in handler: check cache → if fresh, return clone. Else check `inFlight` → if present, await it. Else create promise, store in `inFlight`, resolve, write cache, delete from `inFlight` in `finally`.
- Client cache in `store.tsx` stays as-is.

## 2. Fetch reliability polish (`cdcFetch`)

Keep the existing 3-attempt, 10s timeout shape. Refine:

- `parseRetryAfter(h)`: if numeric → seconds; else `Date.parse` → ms-from-now; clamp to [0, 30000]; ignore NaN.
- Add jitter: `delay = base * (0.8 + Math.random() * 0.4)` on each retry.
- Distinguish errors: tag thrown `AbortError` as `TimeoutError` (own class or `error.name === "TimeoutError"`); separate generic network failure message.
- Explicit early-return on 400/403/404 already exists via `!isTransientStatus` — assert/document it; ensure those statuses never re-enter the retry branch.
- 404/429 messages in handler unchanged. Add a `408/timeout → "Chess.com request timed out"` mapping.

## 3. Concurrency-limited archive fetch

Replace `Promise.all(recent.map(...))` with a small worker pool, `CONCURRENCY = 2`:

- Tiny inline runner (no dep): index counter + `Promise.all([worker(), worker()])`, each worker pulls next URL until exhausted.
- Preserve order via index → results array.
- Failed months still counted into `failedArchiveMonths`; partial-import meta unchanged.
- Caps (`MAX_MONTHS=6`, `MAX_GAMES=400`) unchanged.

## 4. Canonical import-result type (`types.ts` + `store-context.ts`)

`types.ts` currently exports stale `ImportResult` / `ImportError` / `ImportResponse` that conflict with `store-context.ts`'s `ImportResult` (`{ ok; username?; error? }`).

- Delete the three stale exports from `types.ts`.
- Move the canonical `ImportResult` definition into `types.ts` (single source of truth) and re-export from `store-context.ts` for back-compat, OR keep in `store-context.ts` and just remove the dead exports. Pick the simpler option after re-reading both files; no behavior change.
- Verify no other file imports the stale names (`rg "ImportResponse|ImportError"`).

## 5. Single-toast error UX (`store.tsx` + `TopBar.tsx`)

Today, both the provider (implicit via `error` state surfaced elsewhere?) and `TopBar` can toast. Audit and normalize:

- Provider's `runImport` returns `{ ok:false, error }` and sets `setError(msg)` but does NOT toast.
- `TopBar` is the single toast site: on submit/sync, show one `toast.error` from the returned `error`. On success, one `toast.success`. On warning (partial meta) the provider's existing `toast.warning` stays — that's distinct.
- Auto-restore on mount: do NOT toast on failure (silent; mock dashboard stays, `error` state set). Avoids surprise toast on page load.
- Keep visible `error` state for any inline display.

## 6. Persisted analytics snapshot (`store.tsx`)

Extend localStorage beyond just username:

- New key `chesslab.snapshot.v1` storing `{ version: 1, username, fetchedAt, analytics }`.
- `SNAPSHOT_TTL_MS = 30 * 60 * 1000` (30 min); older snapshots ignored but username key still used to trigger background refresh.
- On mount: if fresh snapshot exists → `applyAnalytics(snapshot.analytics)` immediately, skip auto-`runImport`; user can hit Sync to refresh.
- If snapshot stale but username present → current behavior (auto-import with `importing…` pill).
- On every successful import (in `applyAnalytics`), write snapshot.
- On `clear()` and on terminal error, delete snapshot.
- Guard JSON parse + version mismatch (drop silently).
- First-time users: no snapshot, no username → mock fallback unchanged.

## 7. Phase 2/3 test expansion (`__tests__/chess.test.ts` + new files)

Use existing `bun:test`. Add cases (mock `globalThis.fetch`):

- Username validator (already covered).
- Archive cap: 12 archive URLs → only 6 fetched; 1000 normalized games → trimmed to 400.
- Invalid game schema → counted in `skippedInvalidGames`, not thrown.
- Partial month failure: one archive month returns 500 thrice → `failedArchiveMonths === 1`, import still succeeds.
- Retry: 429 then 200 → succeeds, fetch called twice. 5xx then 200 → succeeds.
- No retry on 404 → fetch called once, error message contains `not found`.
- Server cache: two sequential calls with same username → second served from cache (fetch call count unchanged).
- In-flight dedupe: two concurrent calls → one underlying fetch burst.
- Client cooldown (separate file or section, no React): extract cooldown logic into a tiny pure helper if testing the provider is too heavy; otherwise skip and note in PR.

Keep tests fast (<1s); no React rendering required for server-fn-level tests since they call the handler module directly.

## 8. Boundary guard + README note

- `rg "api\.chess\.com"` and `rg "fetch\("` across `src/` excluding `chess.functions.ts` and tests. Expect zero hits in components/routes.
- If any found, route through `useChessData().importProfile` / `refresh`.
- README: add one short paragraph under existing architecture section: "Chess.com API access is server-only (`chess.functions.ts`) to avoid CORS, custom User-Agent restrictions, and rate-limit leakage to the client."

---

## Technical notes

- All constants (`SERVER_CACHE_TTL_MS`, `SERVER_CACHE_MAX`, `CONCURRENCY`, `SNAPSHOT_TTL_MS`, `SNAPSHOT_KEY`) defined as named consts at top of file.
- No new dependencies. `bun:test` already wired.
- Worker isolates are per-region/instance, so server cache is best-effort — that's acceptable (5 min TTL).
- Snapshot payload is bounded by `MAX_GAMES=400`; well under localStorage limits.

## Files touched

- `src/lib/chess/chess.functions.ts` (passes 1, 2, 3)
- `src/lib/chess/types.ts` (pass 4)
- `src/lib/chess/store-context.ts` (pass 4, possibly)
- `src/lib/chess/store.tsx` (passes 5, 6)
- `src/components/TopBar.tsx` (pass 5)
- `src/lib/chess/__tests__/chess.test.ts` (pass 7) + possibly `chess.server-cache.test.ts`
- `README.md` (pass 8)

## Out of scope

- No UI redesign, no new routes, no new state library.
- No IndexedDB / SW caching.
- No cross-isolate shared cache (KV/D1).
- No new test framework or rendering library.
