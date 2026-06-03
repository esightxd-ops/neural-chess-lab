import { cn } from "@/lib/utils";
import { useChessData } from "@/lib/chess/store-context";

export function ColorPerformance() {
  const { analytics } = useChessData();
  const colors = analytics.colors;
  if (!colors.length) return null;

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {colors.map((c) => {
        const label = c.color === "white" ? "White" : "Black";
        const pieceClass =
          c.color === "white"
            ? "bg-foreground text-background"
            : "bg-background text-foreground border border-foreground";
        return (
          <div key={c.color} className="panel p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full grid place-items-center font-mono text-sm font-bold",
                    pieceClass,
                  )}
                >
                  ♟
                </div>
                <h3 className="text-sm font-semibold tracking-tight">Playing {label}</h3>
              </div>
              <span
                className={cn(
                  "font-mono text-[11px] px-1.5 py-0.5 rounded",
                  c.delta >= 0 ? "text-primary bg-primary/10" : "text-negative bg-negative/10",
                )}
              >
                {c.delta >= 0 ? "+" : ""}
                {c.delta} elo gap
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              <Cell label="Games" value={String(c.games)} />
              <Cell label="Win %" value={`${c.winRate.toFixed(1)}%`} accent="primary" />
              <Cell label="Avg opp" value={c.avgOpponent ? String(c.avgOpponent) : "—"} />
            </div>

            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
                Most common openings
              </div>
              <div className="flex flex-wrap gap-1.5">
                {c.topOpenings.length === 0 && (
                  <span className="text-[11px] font-mono text-muted-foreground">no data</span>
                )}
                {c.topOpenings.map((o) => (
                  <span
                    key={o}
                    className="text-[11px] font-mono px-2 py-1 rounded bg-panel-elevated border border-border text-foreground truncate max-w-[220px]"
                  >
                    {o}
                  </span>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary";
}) {
  return (
    <div>
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "font-mono text-2xl font-semibold tabular mt-0.5",
          accent === "primary" && "text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}
