import { ArrowUpRight, ExternalLink, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Game } from "@/lib/chess/types";

const resultColor: Record<Game["result"], string> = {
  W: "text-primary bg-primary/10 border-primary/30",
  L: "text-negative bg-negative/10 border-negative/30",
  D: "text-muted-foreground bg-muted border-border",
};

function formatAgo(unix: number) {
  const diff = Math.floor(Date.now() / 1000 - unix);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(unix * 1000).toLocaleDateString();
}

function formatMode(g: Game): string {
  const tc = g.timeControl;
  // chess.com formats: "600", "180+2", "1/86400" (daily)
  if (g.timeClass === "daily") return "Daily";
  if (tc.includes("/")) return "Daily";
  if (tc.includes("+")) {
    const [base, inc] = tc.split("+");
    return `${g.timeClass[0].toUpperCase() + g.timeClass.slice(1)} ${Math.round(Number(base) / 60)}+${inc}`;
  }
  return `${g.timeClass[0].toUpperCase() + g.timeClass.slice(1)} ${Math.round(Number(tc) / 60)}+0`;
}

interface Props {
  rows: Game[];
  limit?: number;
  showTitle?: boolean;
  dense?: boolean;
  profileUsername?: string;
  archiveUrl?: string;
}

export function RecentGamesTable({
  rows,
  limit = 8,
  showTitle = true,
  dense = false,
  profileUsername,
  archiveUrl,
}: Props) {
  const data = rows.slice(0, limit);
  const viewAllHref =
    archiveUrl ??
    (profileUsername ? `https://www.chess.com/games/archive/${profileUsername}` : undefined);

  if (data.length === 0) {
    return (
      <section className={cn(!dense && "panel p-5")}>
        <div className="text-xs font-mono text-muted-foreground py-8 text-center">
          No games imported yet.
        </div>
      </section>
    );
  }

  return (
    <section className={cn(!dense && "panel p-5")}>
      {showTitle && (
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Recent Games</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              last {data.length} games · click to open on chess.com
            </p>
          </div>
          {viewAllHref && (
            <a
              href={viewAllHref}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
            >
              View all <ArrowUpRight className="h-3 w-3" />
            </a>
          )}
        </div>
      )}

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="text-left font-normal py-2 pr-3">Result</th>
              <th className="text-left font-normal py-2 pr-3">Opponent</th>
              <th className="text-center font-normal py-2 px-2">Color</th>
              <th className="text-left font-normal py-2 px-2 hidden md:table-cell">Mode</th>
              <th className="text-left font-normal py-2 px-2 hidden lg:table-cell">Opening</th>
              <th className="text-right font-normal py-2 px-2 hidden sm:table-cell">Moves</th>
              <th className="text-right font-normal py-2 pl-2">Date</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {data.map((g) => {
              const resultLabel =
                g.result === "W" ? "Won" : g.result === "L" ? "Lost" : "Drew";
              return (
                <tr
                  key={g.id}
                  className="relative border-b border-border/60 hover:bg-panel-elevated/60 focus-within:bg-panel-elevated/60 transition-colors group"
                >
                  <td className="py-2.5 pr-3 relative">
                    <a
                      href={g.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${resultLabel} vs ${g.opponent}, ${formatMode(g)}, ${formatAgo(g.endTime)}. Opens game on chess.com.`}
                      className="absolute inset-0 z-10 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-inset"
                    >
                      <span className="sr-only">Open game on chess.com</span>
                    </a>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center w-6 h-6 rounded border text-[11px] font-semibold",
                        resultColor[g.result],
                      )}
                    >
                      {g.result}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-6 w-6 rounded bg-gradient-to-br from-panel-elevated to-panel border border-border grid place-items-center text-[10px] text-muted-foreground shrink-0">
                        {g.opponent[0]?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <div className="text-foreground text-xs truncate">{g.opponent}</div>
                        <div className="text-[10px] text-muted-foreground">{g.opponentRating || "—"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-2.5 px-2 text-center">
                    <Circle
                      className={cn(
                        "inline h-3 w-3",
                        g.playerColor === "white"
                          ? "fill-foreground text-foreground"
                          : "fill-background text-foreground",
                      )}
                    />
                  </td>
                  <td className="py-2.5 px-2 hidden md:table-cell text-xs text-muted-foreground">
                    {formatMode(g)}
                  </td>
                  <td className="py-2.5 px-2 hidden lg:table-cell text-xs">
                    <span className="text-foreground truncate inline-block max-w-[200px] align-middle">
                      {g.opening}
                    </span>
                    {g.eco && <span className="text-muted-foreground ml-1.5">{g.eco}</span>}
                  </td>
                  <td className="py-2.5 px-2 hidden sm:table-cell text-right text-xs text-muted-foreground tabular">
                    {g.moves || "—"}
                  </td>
                  <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1 group-hover:text-primary group-focus-within:text-primary transition-colors">
                      {formatAgo(g.endTime)}
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity" />
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
