import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

export function PlayerHeader({ className }: Props) {
  const ratings = [
    { label: "Rapid", value: 1842, delta: +24 },
    { label: "Blitz", value: 1756, delta: -8 },
    { label: "Bullet", value: 1612, delta: +12 },
  ];

  return (
    <header
      className={cn(
        "panel p-6 flex flex-col lg:flex-row gap-6 lg:items-center justify-between",
        className,
      )}
    >
      <div className="flex items-center gap-5">
        <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/30 via-accent-cyan/20 to-transparent border border-border grid place-items-center text-xl font-semibold glow-primary">
          MK
        </div>
        <div>
          <div className="flex items-baseline gap-3">
            <h1 className="text-xl font-semibold tracking-tight">magnus_k</h1>
            <span className="text-xs font-mono text-muted-foreground">
              Top 6.4% worldwide
            </span>
          </div>
          <div className="mt-3 flex flex-wrap gap-5">
            {ratings.map((r) => (
              <div key={r.label} className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {r.label}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-semibold tabular">
                    {r.value}
                  </span>
                  <span
                    className={cn(
                      "flex items-center gap-0.5 font-mono text-xs",
                      r.delta >= 0 ? "text-primary" : "text-negative",
                    )}
                  >
                    {r.delta >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {r.delta >= 0 ? "+" : ""}
                    {r.delta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:text-right border-t lg:border-t-0 lg:border-l border-border lg:pl-6 pt-4 lg:pt-0">
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Performance today
        </div>
        <div className="mt-1 flex lg:justify-end items-baseline gap-2">
          <span className="font-mono text-3xl font-semibold text-primary">
            +28
          </span>
          <span className="text-xs text-muted-foreground">rating</span>
        </div>
        <div className="mt-1 flex lg:justify-end items-baseline gap-3 text-xs font-mono text-muted-foreground">
          <span>
            <span className="text-foreground">87.4%</span> accuracy
          </span>
          <span>
            <span className="text-foreground">6W</span>·
            <span className="text-foreground">1D</span>·
            <span className="text-negative">2L</span>
          </span>
        </div>
      </div>
    </header>
  );
}
