import { ArrowUpRight, TrendingUp, TrendingDown, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface OpeningRow {
  name: string;
  eco: string;
  games: number;
  wr: number;
  w: number;
  l: number;
  d: number;
  avgLen: number;
  delta: number;
}

export const SAMPLE_OPENINGS: OpeningRow[] = [
  { name: "Sicilian Najdorf", eco: "B90", games: 142, wr: 64.1, w: 91, l: 38, d: 13, avgLen: 41, delta: 58 },
  { name: "Caro-Kann Advance", eco: "B12", games: 98, wr: 61.2, w: 60, l: 28, d: 10, avgLen: 46, delta: 32 },
  { name: "Ruy Lopez Berlin", eco: "C67", games: 86, wr: 48.8, w: 42, l: 36, d: 8, avgLen: 52, delta: -14 },
  { name: "Italian Game", eco: "C50", games: 74, wr: 55.4, w: 41, l: 27, d: 6, avgLen: 38, delta: 18 },
  { name: "Queens Gambit Declined", eco: "D37", games: 68, wr: 52.9, w: 36, l: 24, d: 8, avgLen: 54, delta: 11 },
  { name: "Kings Indian Defense", eco: "E90", games: 54, wr: 38.9, w: 21, l: 28, d: 5, avgLen: 49, delta: -42 },
  { name: "London System", eco: "D02", games: 47, wr: 59.6, w: 28, l: 16, d: 3, avgLen: 35, delta: 24 },
  { name: "Pirc Defense", eco: "B07", games: 38, wr: 50.0, w: 19, l: 15, d: 4, avgLen: 43, delta: 6 },
];

interface Props {
  showTitle?: boolean;
}

export function OpeningTable({ showTitle = true }: Props) {
  const sorted = [...SAMPLE_OPENINGS].sort((a, b) => b.games - a.games);
  const best = [...SAMPLE_OPENINGS].sort((a, b) => b.wr - a.wr)[0];
  const worst = [...SAMPLE_OPENINGS].sort((a, b) => a.wr - b.wr)[0];
  const mostPlayed = sorted[0];

  return (
    <section className="panel p-5">
      {showTitle && (
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Opening Performance
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              your repertoire · last 90 days
            </p>
          </div>
          <button className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
            Explorer <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
        <Highlight
          label="Best opening"
          name={best.name}
          eco={best.eco}
          stat={`${best.wr}%`}
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
          stat={`${worst.wr}%`}
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
                key={o.name}
                className="border-b border-border/60 hover:bg-panel-elevated/60 cursor-pointer transition-colors"
              >
                <td className="py-2.5 pr-3">
                  <div className="text-foreground text-xs">{o.name}</div>
                  <div className="text-[10px] text-muted-foreground">{o.eco}</div>
                </td>
                <td className="py-2.5 px-2 text-right text-xs">{o.games}</td>
                <td className="py-2.5 px-2 text-right text-xs">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 h-1 rounded bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full",
                          o.wr >= 55
                            ? "bg-primary"
                            : o.wr >= 45
                              ? "bg-accent-blue"
                              : "bg-negative",
                        )}
                        style={{ width: `${o.wr}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        o.wr >= 55
                          ? "text-primary"
                          : o.wr >= 45
                            ? "text-foreground"
                            : "text-negative",
                      )}
                    >
                      {o.wr}%
                    </span>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-right text-xs text-muted-foreground hidden md:table-cell">
                  <span className="text-primary">{o.w}</span>·
                  <span className="text-negative">{o.l}</span>·
                  <span>{o.d}</span>
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
                    {o.delta > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
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
        <div className="mt-1 text-foreground text-sm font-semibold truncate">
          {name}
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">{eco}</div>
      </div>
      <div className="font-mono text-xl font-semibold tabular shrink-0">
        {stat}
      </div>
    </div>
  );
}
