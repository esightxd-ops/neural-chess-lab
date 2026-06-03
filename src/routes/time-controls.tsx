import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TimeControlGrid } from "@/components/TimeControlGrid";
import { useChessData } from "@/lib/chess/store-context";
import { cn } from "@/lib/utils";
import type { TimeClass } from "@/lib/chess/types";

export const Route = createFileRoute("/time-controls")({
  head: () => ({ meta: [{ title: "Time Controls — Chesslab" }] }),
  component: TimeControlsPage,
});

const ORDER: TimeClass[] = ["bullet", "blitz", "rapid", "daily"];

function TimeControlsPage() {
  const { analytics } = useChessData();
  const rows = ORDER.map((tc) => analytics.byTimeClass[tc]).filter(Boolean) as NonNullable<
    (typeof analytics.byTimeClass)[TimeClass]
  >[];
  const maxGames = Math.max(1, ...rows.map((r) => r.games));

  return (
    <AppShell section="Time Controls">
      <TimeControlGrid />
      <section className="panel p-5">
        <h2 className="text-sm font-semibold tracking-tight mb-4">Mode comparison</h2>
        {rows.length === 0 ? (
          <div className="text-xs font-mono text-muted-foreground py-8 text-center">
            No games imported yet.
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="text-left font-normal py-2 pr-3">Mode</th>
                  <th className="text-right font-normal py-2 px-2">Games</th>
                  <th className="text-right font-normal py-2 px-2">Win %</th>
                  <th className="text-right font-normal py-2 px-2">Avg opp</th>
                  <th className="text-right font-normal py-2 px-2">Δ30d</th>
                  <th className="text-right font-normal py-2 px-2">Best</th>
                  <th className="text-left font-normal py-2 pl-2">Activity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.timeClass} className="border-b border-border/60">
                    <td className="py-2.5 pr-3 text-foreground capitalize">{r.timeClass}</td>
                    <td className="py-2.5 px-2 text-right">{r.games}</td>
                    <td className="py-2.5 px-2 text-right text-primary">{r.winRate.toFixed(1)}%</td>
                    <td className="py-2.5 px-2 text-right">{r.avgOpponent || "—"}</td>
                    <td
                      className={cn(
                        "py-2.5 px-2 text-right",
                        r.delta30d > 0
                          ? "text-primary"
                          : r.delta30d < 0
                            ? "text-negative"
                            : "text-muted-foreground",
                      )}
                    >
                      {r.delta30d > 0 ? "+" : ""}
                      {r.delta30d}
                    </td>
                    <td className="py-2.5 px-2 text-right text-gold">{r.best}</td>
                    <td className="py-2.5 pl-2">
                      <div className="h-1.5 w-32 rounded bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${(r.games / maxGames) * 100}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AppShell>
  );
}
