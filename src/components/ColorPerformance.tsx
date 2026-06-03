import { cn } from "@/lib/utils";

const colors = [
  {
    label: "White",
    pieceClass: "bg-foreground text-background",
    games: 642,
    wr: 61.2,
    avgOpp: 1804,
    delta: 142,
    openings: ["Ruy Lopez Berlin", "Italian Game", "London System"],
  },
  {
    label: "Black",
    pieceClass: "bg-background text-foreground border border-foreground",
    games: 642,
    wr: 55.6,
    avgOpp: 1791,
    delta: 88,
    openings: ["Sicilian Najdorf", "Caro-Kann Advance", "Kings Indian"],
  },
] as const;

export function ColorPerformance() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {colors.map((c) => (
        <div key={c.label} className="panel p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "h-7 w-7 rounded-full grid place-items-center font-mono text-sm font-bold",
                  c.pieceClass,
                )}
              >
                ♟
              </div>
              <h3 className="text-sm font-semibold tracking-tight">
                Playing {c.label}
              </h3>
            </div>
            <span
              className={cn(
                "font-mono text-[11px] px-1.5 py-0.5 rounded",
                c.delta >= 0
                  ? "text-primary bg-primary/10"
                  : "text-negative bg-negative/10",
              )}
            >
              {c.delta >= 0 ? "+" : ""}
              {c.delta} elo
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Games
              </div>
              <div className="font-mono text-2xl font-semibold tabular mt-0.5">
                {c.games}
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Win %
              </div>
              <div className="font-mono text-2xl font-semibold tabular mt-0.5 text-primary">
                {c.wr}%
              </div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Avg opp
              </div>
              <div className="font-mono text-2xl font-semibold tabular mt-0.5">
                {c.avgOpp}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Most common openings
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.openings.map((o) => (
                <span
                  key={o}
                  className="text-[11px] font-mono px-2 py-1 rounded bg-panel-elevated border border-border text-foreground"
                >
                  {o}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
