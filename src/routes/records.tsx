import { createFileRoute } from "@tanstack/react-router";
import { Trophy, TrendingUp, Clock, Zap, Target, Award } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { StatTile } from "@/components/StatTile";
import { useChessData } from "@/lib/chess/store-context";
import type { TimeClass } from "@/lib/chess/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/records")({
  head: () => ({ meta: [{ title: "Records — Chesslab" }] }),
  component: RecordsPage,
});

const TC_ORDER: TimeClass[] = ["rapid", "blitz", "bullet", "daily"];

function RecordsPage() {
  const { analytics } = useChessData();
  const { games, byTimeClass, opponents } = analytics;

  const ratingTiles = TC_ORDER.map((tc) => byTimeClass[tc] && (
    <StatTile
      key={tc}
      label={`Peak ${tc}`}
      value={String(byTimeClass[tc]!.best)}
      sub={`current ${byTimeClass[tc]!.rating}`}
      accent="primary"
    />
  )).filter(Boolean);

  // game-based records
  const longest = games.length ? games.reduce((a, b) => (b.moves > a.moves ? b : a)) : null;
  const winsOnly = games.filter((g) => g.result === "W" && g.moves > 0);
  const shortestWin = winsOnly.length ? winsOnly.reduce((a, b) => (b.moves < a.moves ? b : a)) : null;

  const dayMap = new Map<string, number>();
  for (const g of games) {
    const d = new Date(g.endTime * 1000).toISOString().slice(0, 10);
    dayMap.set(d, (dayMap.get(d) || 0) + 1);
  }
  const mostActive = Array.from(dayMap.entries()).sort((a, b) => b[1] - a[1])[0];

  // best opponent score: highest win rate among opponents w/ >= 3 games
  const oppCandidates = opponents.filter((o) => o.games >= 3);
  const bestOpp = oppCandidates.length
    ? oppCandidates.reduce((a, b) => (b.w / b.games > a.w / a.games ? b : a))
    : null;
  const toughestOpp = oppCandidates.length
    ? oppCandidates.reduce((a, b) => (b.l / b.games > a.l / a.games ? b : a))
    : null;

  // biggest rating upset: win against highest-rated opponent
  const upsetWin = games
    .filter((g) => g.result === "W")
    .reduce<typeof games[number] | null>(
      (a, b) => (!a || b.opponentRating - b.playerRating > a.opponentRating - a.playerRating ? b : a),
      null,
    );

  const bests: { label: string; value: string; sub?: string; icon: LucideIcon; tone: string }[] = [];
  if (longest) bests.push({
    label: "Longest game",
    value: `${longest.moves} moves`,
    sub: `vs ${longest.opponent} · ${longest.timeClass}`,
    icon: Clock, tone: "text-muted-foreground bg-muted border-border",
  });
  if (shortestWin) bests.push({
    label: "Shortest win",
    value: `${shortestWin.moves} moves`,
    sub: `vs ${shortestWin.opponent} · ${shortestWin.timeClass}`,
    icon: Zap, tone: "text-gold bg-gold/10 border-gold/30",
  });
  if (mostActive) bests.push({
    label: "Most active day",
    value: `${mostActive[1]} games`,
    sub: mostActive[0],
    icon: TrendingUp, tone: "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  });
  if (upsetWin && upsetWin.opponentRating > upsetWin.playerRating) bests.push({
    label: "Biggest upset win",
    value: `+${upsetWin.opponentRating - upsetWin.playerRating} elo`,
    sub: `vs ${upsetWin.opponent} (${upsetWin.opponentRating})`,
    icon: Target, tone: "text-primary bg-primary/10 border-primary/30",
  });
  if (bestOpp) bests.push({
    label: "Best matchup",
    value: `${Math.round((bestOpp.w / bestOpp.games) * 100)}%`,
    sub: `${bestOpp.username} · ${bestOpp.w}-${bestOpp.l}-${bestOpp.d}`,
    icon: Award, tone: "text-primary bg-primary/10 border-primary/30",
  });
  if (toughestOpp && toughestOpp.username !== bestOpp?.username) bests.push({
    label: "Toughest opponent",
    value: `${Math.round((toughestOpp.l / toughestOpp.games) * 100)}% L`,
    sub: `${toughestOpp.username} · ${toughestOpp.w}-${toughestOpp.l}-${toughestOpp.d}`,
    icon: Trophy, tone: "text-negative bg-negative/10 border-negative/30",
  });

  return (
    <AppShell section="Records">
      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">Peak ratings</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            personal best by mode
          </span>
        </div>
        {ratingTiles.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{ratingTiles}</div>
        ) : (
          <div className="text-xs font-mono text-muted-foreground text-center py-6">
            Import a profile to see rating peaks.
          </div>
        )}
      </section>

      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">Personal bests</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            trophy room
          </span>
        </div>
        {bests.length === 0 ? (
          <div className="text-xs font-mono text-muted-foreground text-center py-6">
            No records yet — import a profile to populate this room.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {bests.map((b) => {
              const Icon = b.icon;
              return (
                <div key={b.label} className="panel-elevated p-4 relative overflow-hidden">
                  <div className={cn("h-8 w-8 rounded-md border grid place-items-center", b.tone)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {b.label}
                  </div>
                  <div className="mt-1 font-mono text-2xl font-semibold tabular text-foreground">
                    {b.value}
                  </div>
                  {b.sub && (
                    <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                      {b.sub}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </AppShell>
  );
}
