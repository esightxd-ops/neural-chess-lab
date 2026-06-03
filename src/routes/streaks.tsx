import { createFileRoute } from "@tanstack/react-router";
import { Flame, TrendingDown, Shield, Trophy } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatTile } from "@/components/StatTile";
import { useChessData } from "@/lib/chess/store-context";
import type { TimeClass, Game, GameResult } from "@/lib/chess/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/streaks")({
  head: () => ({ meta: [{ title: "Streaks — Chesslab" }] }),
  component: StreaksPage,
});

const TC_ORDER: TimeClass[] = ["rapid", "blitz", "bullet", "daily"];

function computeStreaksFor(games: Game[]) {
  if (!games.length) {
    return { longestWin: 0, longestUnbeaten: 0, longestLoss: 0, current: 0, currentResult: "D" as GameResult };
  }
  const ordered = games.slice().sort((a, b) => a.endTime - b.endTime);
  let lw = 0, ll = 0, lu = 0, rw = 0, rl = 0, ru = 0;
  for (const g of ordered) {
    if (g.result === "W") { rw++; ru++; rl = 0; }
    else if (g.result === "D") { rw = 0; ru++; rl = 0; }
    else { rl++; rw = 0; ru = 0; }
    lw = Math.max(lw, rw); ll = Math.max(ll, rl); lu = Math.max(lu, ru);
  }
  const last = ordered[ordered.length - 1];
  let cur = 1;
  for (let i = ordered.length - 2; i >= 0; i--) {
    if (ordered[i].result === last.result) cur++; else break;
  }
  return { longestWin: lw, longestUnbeaten: lu, longestLoss: ll, current: cur, currentResult: last.result };
}

function StreaksPage() {
  const { analytics } = useChessData();
  const { streaks, games } = analytics;

  const recent = games.slice(0, 30); // already sorted desc
  const recentForm = recent.slice(0, 20).slice().reverse();

  const byTc = TC_ORDER.map((tc) => ({
    tc,
    stats: computeStreaksFor(games.filter((g) => g.timeClass === tc)),
    count: games.filter((g) => g.timeClass === tc).length,
  })).filter((x) => x.count > 0);

  const milestones = [
    { label: "5-game win streak", reached: streaks.longestWin >= 5 },
    { label: "10-game win streak", reached: streaks.longestWin >= 10 },
    { label: "15-game unbeaten", reached: streaks.longestUnbeaten >= 15 },
    { label: "25-game unbeaten", reached: streaks.longestUnbeaten >= 25 },
    { label: "Survived 3-loss skid", reached: streaks.longestLoss <= 3 && games.length > 20 },
  ];

  const currentLabel =
    streaks.currentResult === "W" ? "Win streak" : streaks.currentResult === "L" ? "Loss streak" : "Draw streak";

  return (
    <AppShell section="Streaks">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile
          label={currentLabel}
          value={String(streaks.currentLength)}
          sub="ongoing"
          accent={streaks.currentResult === "W" ? "primary" : streaks.currentResult === "L" ? "negative" : "default"}
        />
        <StatTile label="Longest win streak" value={String(streaks.longestWin)} sub="all time" accent="primary" />
        <StatTile label="Longest unbeaten" value={String(streaks.longestUnbeaten)} sub="W+D run" accent="gold" />
        <StatTile label="Longest loss streak" value={String(streaks.longestLoss)} sub="worst skid" accent="negative" />
      </div>

      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">Recent form</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            last {recentForm.length} games
          </span>
        </div>
        {recentForm.length === 0 ? (
          <div className="text-xs font-mono text-muted-foreground text-center py-6">
            Import a profile to see recent form.
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {recentForm.map((g) => (
              <div
                key={g.id}
                title={`${g.result} vs ${g.opponent} (${g.timeClass})`}
                className={cn(
                  "h-7 w-7 rounded-md grid place-items-center text-[10px] font-mono font-semibold border",
                  g.result === "W" && "bg-primary/15 text-primary border-primary/30",
                  g.result === "L" && "bg-negative/15 text-negative border-negative/30",
                  g.result === "D" && "bg-muted text-muted-foreground border-border",
                )}
              >
                {g.result}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">By time control</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            streak breakdown
          </span>
        </div>
        {byTc.length === 0 ? (
          <div className="text-xs font-mono text-muted-foreground text-center py-6">No games yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead className="text-muted-foreground">
                <tr className="text-left border-b border-border">
                  <th className="py-2 pr-3 font-normal uppercase tracking-widest text-[10px]">Mode</th>
                  <th className="py-2 px-3 font-normal uppercase tracking-widest text-[10px] text-right">Games</th>
                  <th className="py-2 px-3 font-normal uppercase tracking-widest text-[10px] text-right">Current</th>
                  <th className="py-2 px-3 font-normal uppercase tracking-widest text-[10px] text-right">Longest W</th>
                  <th className="py-2 px-3 font-normal uppercase tracking-widest text-[10px] text-right">Unbeaten</th>
                  <th className="py-2 pl-3 font-normal uppercase tracking-widest text-[10px] text-right">Longest L</th>
                </tr>
              </thead>
              <tbody>
                {byTc.map(({ tc, stats, count }) => (
                  <tr key={tc} className="border-b border-border/50 hover:bg-panel-elevated/40">
                    <td className="py-2 pr-3 capitalize text-foreground">{tc}</td>
                    <td className="py-2 px-3 text-right tabular">{count}</td>
                    <td className="py-2 px-3 text-right tabular">
                      {stats.currentResult}
                      {stats.current}
                    </td>
                    <td className="py-2 px-3 text-right tabular text-primary">{stats.longestWin}</td>
                    <td className="py-2 px-3 text-right tabular text-gold">{stats.longestUnbeaten}</td>
                    <td className="py-2 pl-3 text-right tabular text-negative">{stats.longestLoss}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">Milestones</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            streak goals
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {milestones.map((m) => {
            const Icon = m.reached ? Trophy : m.label.includes("loss") ? Shield : m.label.includes("unbeaten") ? Flame : TrendingDown;
            return (
              <div
                key={m.label}
                className={cn(
                  "panel-elevated p-4",
                  m.reached ? "border-primary/40" : "opacity-60",
                )}
              >
                <div
                  className={cn(
                    "h-8 w-8 rounded-md border grid place-items-center",
                    m.reached
                      ? "text-primary bg-primary/10 border-primary/30"
                      : "text-muted-foreground bg-muted border-border",
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-3 text-[11px] font-mono text-foreground">{m.label}</div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  {m.reached ? "achieved" : "locked"}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
