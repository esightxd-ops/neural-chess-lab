import { ArrowUpRight, TrendingUp, TrendingDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChessData } from "@/lib/chess/store";
import type { OpeningStats } from "@/lib/chess/types";

interface Props {
  rows?: OpeningStats[];
  showTitle?: boolean;
  limit?: number;
}

export function OpeningTable({ rows, showTitle = true, limit = 12 }: Props) {
  const { analytics } = useChessData();
  const all = rows ?? analytics.openings;
  const sorted = all.slice(0, limit);

  if (sorted.length === 0) {
    return (
      <section className="panel p-5 text-xs font-mono text-muted-foreground text-center py-10">
        No openings detected — import a profile with rated games.
      </section>
    );
  }

  const best = [...all].sort((a, b) => b.winRate - a.winRate)[0];
  const worst = [...all].sort((a, b) => a.winRate - b.winRate)[0];
  const mostPlayed = [...all].sort((a, b) => b.games - a.games)[0];

  return (
    <section className="panel p-5">
      {showTitle && (
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Opening Performance</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              your repertoire · imported games
            </p>
          </div>
          <a
            href="https://www.chess.com/openings"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
          >
            Explorer <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Highlight
          label="Best opening"
          name={best.name}
          eco={best.eco}
          stat={`${best.winRate.toFixed(1)}%`}
          accent="primary"
          icon={<Star className="h-3 w-3" />}
        />
        <Highlight
          label="Most played"
          name={mostPlayed.name}
          eco={mostPlayed.eco}
          stat={`${mostPlayed.games} games`}
          accent="gold"
        />
        <Highlight
          label="Worst performing"
          name={worst.name}
          eco={worst.eco}
          stat={`${worst.winRate.toFixed(1)}%`}
          accent="negative"
        />
      </div>

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="text-left font-normal py-2 pr-3">Opening</th>
              <th className="text-right font-normal py-2 px-2">Games</th>
              <th className="text-right font-normal py-2 px-2">Win %</th>
              <th className="text-right font-normal py-2 px-2 hidden md:table-cell">W·L·D</th>
              <th className="text-right font-normal py-2 px-2 hidden sm:table-cell">Avg moves</th>
              <th className="text-right font-normal py-2 pl-2">Δ rating</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((o) => (
              <tr
                key={`${o.name}-${o.eco}`}
                className="border-b border-border/60 hover:bg-panel-elevated/60 cursor-pointer transition-colors"
              >
                <td className="py-2.5 pr-3">
                  <div className="text-foreground text-xs truncate max-w-[260px]">{o.name}</div>
                  <div className="text-[10px] text-muted-foreground">{o.eco || "—"}</div>
                </td>
                <td className="py-2.5 px-2 text-right text-xs">{o.games}</td>
                <td className="py-2.5 px-2 text-right text-xs">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1 rounded bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          o.winRate >= 55
                            ? "bg-primary"
                            : o.winRate >= 45
                              ? "bg-accent-blue"
                              : "bg-negative",
                        )}
                        style={{ width: `${Math.min(100, o.winRate)}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        o.winRate >= 55
                          ? "text-primary"
                          : o.winRate >= 45
                            ? "text-foreground"
                            : "text-negative",
                      )}
                    >
                      {o.winRate.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right text-xs text-muted-foreground hidden md:table-cell">
                  <span className="text-primary">{o.w}</span>·
                  <span className="text-negative">{o.l}</span>·<span>{o.d}</span>
                </td>
                <td className="py-2.5 px-2 text-right text-xs text-muted-foreground hidden sm:table-cell">
                  {o.avgLen}
                </td>
                <td
                  className={cn(
                    "py-2.5 pl-2 text-right text-xs tabular",
                    o.delta > 0
                      ? "text-primary"
                      : o.delta < 0
                        ? "text-negative"
                        : "text-muted-foreground",
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {o.delta >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {o.delta > 0 ? "+" : ""}
                    {o.delta}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Highlight({
  label,
  name,
  eco,
  stat,
  accent,
  icon,
}: {
  label: string;
  name: string;
  eco: string;
  stat: string;
  accent: "primary" | "gold" | "negative";
  icon?: React.ReactNode;
}) {
  const map = {
    primary: "border-primary/30 bg-primary/5 text-primary",
    gold: "border-gold/30 bg-gold/5 text-gold",
    negative: "border-negative/30 bg-negative/5 text-negative",
  };
  return (
    <div
      className={cn(
        "rounded-md border px-3.5 py-3 flex items-center justify-between gap-3",
        map[accent],
      )}
    >
      <div className="min-w-0">
        <div className="text-[10px] font-mono uppercase tracking-widest opacity-80 flex items-center gap-1">
          {icon}
          {label}
        </div>
        <div className="mt-1 text-foreground text-sm font-semibold truncate">{name}</div>
        <div className="text-[10px] font-mono text-muted-foreground">{eco || "—"}</div>
      </div>
      <div className="font-mono text-xl font-semibold tabular shrink-0">{stat}</div>
    </div>
  );
}
