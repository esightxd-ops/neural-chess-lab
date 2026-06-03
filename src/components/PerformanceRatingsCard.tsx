import { TrendingUp, TrendingDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const rows = [
  { skill: "Tactical Accuracy", rating: 1760, trend: 42, tier: "strong" },
  { skill: "Calculation Depth", rating: 1680, trend: 18, tier: "strong" },
  { skill: "Positional Play", rating: 1620, trend: 6, tier: "neutral" },
  { skill: "Defense", rating: 1590, trend: 11, tier: "neutral" },
  { skill: "Initiative", rating: 1710, trend: 22, tier: "strong" },
  { skill: "Endgames", rating: 1540, trend: -12, tier: "weak" },
  { skill: "Time Management", rating: 1390, trend: 8, tier: "weak" },
];

export function PerformanceRatingsCard() {
  return (
    <section className="panel flex flex-col">
      <div className="p-5 pb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Performance Ratings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Per-skill ELO · last 30 days
          </p>
        </div>
        <button className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary">
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {rows.map((r) => {
          const up = r.trend >= 0;
          return (
            <button
              key={r.skill}
              className="group w-full grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3 hover:bg-secondary/50 transition-colors text-left"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    r.tier === "strong" && "bg-primary",
                    r.tier === "neutral" && "bg-muted-foreground",
                    r.tier === "weak" && "bg-negative",
                  )}
                />
                <span className="text-sm truncate">{r.skill}</span>
              </div>
              <span className="font-mono text-sm tabular">{r.rating}</span>
              <span
                className={cn(
                  "font-mono text-xs flex items-center gap-0.5 w-14 justify-end",
                  up ? "text-primary" : "text-negative",
                )}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {up ? "+" : ""}
                {r.trend}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
