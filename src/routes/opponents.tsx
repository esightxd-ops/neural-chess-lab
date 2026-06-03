import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { useChessData } from "@/lib/chess/store-context";

export const Route = createFileRoute("/opponents")({
  head: () => ({ meta: [{ title: "Opponents — Chesslab" }] }),
  component: OpponentsPage,
});

function formatAgo(unix: number) {
  const diff = Math.floor(Date.now() / 1000 - unix);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function OpponentsPage() {
  const { analytics } = useChessData();
  const opponents = analytics.opponents.slice(0, 30);

  return (
    <AppShell section="Opponents">
      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">Frequent Opponents</h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {opponents.length} tracked
          </span>
        </div>

        {opponents.length === 0 ? (
          <div className="text-xs font-mono text-muted-foreground py-10 text-center">
            No recurring opponents yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="text-left font-normal py-2 pr-3">Opponent</th>
                  <th className="text-right font-normal py-2 px-2">Games</th>
                  <th className="text-right font-normal py-2 px-2">W·L·D</th>
                  <th className="text-right font-normal py-2 px-2">Score %</th>
                  <th className="text-right font-normal py-2 px-2">Avg rating</th>
                  <th className="text-left font-normal py-2 px-2 hidden md:table-cell">Favorite</th>
                  <th className="text-right font-normal py-2 pl-2">Last played</th>
                </tr>
              </thead>
              <tbody>
                {opponents.map((o) => {
                  const score = ((o.w + o.d * 0.5) / o.games) * 100;
                  return (
                    <tr
                      key={o.username}
                      className="border-b border-border/60 hover:bg-panel-elevated/60 transition-colors"
                    >
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded bg-gradient-to-br from-panel-elevated to-panel border border-border grid place-items-center text-[10px] text-muted-foreground">
                            {o.username[0]?.toUpperCase() ?? "?"}
                          </div>
                          <span className="text-foreground text-xs">{o.username}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-2 text-right text-xs">{o.games}</td>
                      <td className="py-2.5 px-2 text-right text-xs">
                        <span className="text-primary">{o.w}</span>·
                        <span className="text-negative">{o.l}</span>·
                        <span className="text-muted-foreground">{o.d}</span>
                      </td>
                      <td
                        className={cn(
                          "py-2.5 px-2 text-right text-xs",
                          score >= 55
                            ? "text-primary"
                            : score >= 45
                              ? "text-foreground"
                              : "text-negative",
                        )}
                      >
                        {score.toFixed(1)}%
                      </td>
                      <td className="py-2.5 px-2 text-right text-xs text-muted-foreground">
                        {o.avgRating}
                      </td>
                      <td className="py-2.5 px-2 text-xs text-muted-foreground hidden md:table-cell">
                        {o.favoriteMode}
                      </td>
                      <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground">
                        {formatAgo(o.lastPlayed)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
