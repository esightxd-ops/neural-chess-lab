import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/opponents")({
  head: () => ({ meta: [{ title: "Opponents — Chesslab" }] }),
  component: OpponentsPage,
});

const opponents = [
  { name: "grandpawn_42", games: 18, w: 11, l: 6, d: 1, rating: 1798, last: "2h ago", mode: "Rapid 10+0" },
  { name: "knightmare", games: 14, w: 9, l: 4, d: 1, rating: 1812, last: "4h ago", mode: "Rapid 10+0" },
  { name: "bishop_blast", games: 12, w: 4, l: 7, d: 1, rating: 1856, last: "6h ago", mode: "Blitz 5+0" },
  { name: "endgame_eli", games: 11, w: 5, l: 4, d: 2, rating: 1844, last: "1d ago", mode: "Rapid 15+10" },
  { name: "tactical_tim", games: 9, w: 6, l: 3, d: 0, rating: 1780, last: "1d ago", mode: "Bullet 1+0" },
  { name: "deepblue_jr", games: 8, w: 2, l: 5, d: 1, rating: 1902, last: "2d ago", mode: "Rapid 10+0" },
  { name: "pawnpusher", games: 7, w: 4, l: 2, d: 1, rating: 1764, last: "3d ago", mode: "Blitz 5+0" },
  { name: "rookieboss", games: 6, w: 5, l: 1, d: 0, rating: 1734, last: "5d ago", mode: "Blitz 3+2" },
];

function OpponentsPage() {
  return (
    <AppShell section="Opponents">
      <section className="panel p-5">
        <div className="flex items-baseline justify-between mb-4">
          <h2 className="text-sm font-semibold tracking-tight">
            Frequent Opponents
          </h2>
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            head-to-head
          </span>
        </div>

        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left font-normal py-2 pr-3">Opponent</th>
                <th className="text-right font-normal py-2 px-2">Games</th>
                <th className="text-right font-normal py-2 px-2">W·L·D</th>
                <th className="text-right font-normal py-2 px-2">Score %</th>
                <th className="text-right font-normal py-2 px-2">Avg rating</th>
                <th className="text-left font-normal py-2 px-2 hidden md:table-cell">Favorite mode</th>
                <th className="text-right font-normal py-2 pl-2">Last played</th>
              </tr>
            </thead>
            <tbody>
              {opponents.map((o) => {
                const score = ((o.w + o.d * 0.5) / o.games) * 100;
                return (
                  <tr
                    key={o.name}
                    className="border-b border-border/60 hover:bg-panel-elevated/60 cursor-pointer transition-colors"
                  >
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-gradient-to-br from-panel-elevated to-panel border border-border grid place-items-center text-[10px] text-muted-foreground">
                          {o.name[0].toUpperCase()}
                        </div>
                        <span className="text-foreground text-xs">{o.name}</span>
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
                        score >= 55 ? "text-primary" : score >= 45 ? "text-foreground" : "text-negative",
                      )}
                    >
                      {score.toFixed(1)}%
                    </td>
                    <td className="py-2.5 px-2 text-right text-xs text-muted-foreground">{o.rating}</td>
                    <td className="py-2.5 px-2 text-xs text-muted-foreground hidden md:table-cell">{o.mode}</td>
                    <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground">{o.last}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
