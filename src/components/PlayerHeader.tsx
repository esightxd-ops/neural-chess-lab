import { TrendingUp, TrendingDown, Flame, Zap } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
}

const spark = Array.from({ length: 40 }, (_, i) => ({
  v: 1744 + Math.round(Math.sin(i / 4) * 18 + i * 2.4 + (i % 6) * 3),
}));

export function PlayerHeader({ className }: Props) {
  const ratings = [
    { label: "Blitz", value: 1756, delta: -8, percentile: "Top 9.1%" },
    { label: "Bullet", value: 1612, delta: +12, percentile: "Top 14.8%" },
  ];

  return (
    <header
      className={cn(
        "panel p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] gap-6 lg:gap-10 items-center",
        className,
      )}
    >
      {/* Identity */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/40 via-accent-cyan/20 to-transparent border border-border grid place-items-center text-2xl font-semibold glow-primary">
          MK
          <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-primary text-[10px] font-mono grid place-items-center text-primary-foreground border-2 border-panel">
            7
          </span>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold tracking-tight">magnus_k</h1>
            <span className="text-[10px] font-mono uppercase tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30">
              <Flame className="h-3 w-3 inline -mt-0.5" /> 12 win streak
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-mono">
            Dynamic Calculator · Aggressive Tactician
          </p>
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Engine active · 247 games analyzed
          </div>
        </div>
      </div>

      {/* Dominant rating */}
      <div className="flex flex-col">
        <div className="flex items-baseline gap-3">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Rapid Rating
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
            ▲ peak
          </span>
        </div>
        <div className="flex items-end gap-5 mt-1">
          <span className="font-mono text-[88px] leading-none font-semibold tabular tracking-tight bg-gradient-to-b from-foreground to-foreground/70 bg-clip-text">
            1842
          </span>
          <div className="pb-3 flex flex-col">
            <span className="text-2xl font-mono text-primary font-semibold flex items-center gap-1">
              <TrendingUp className="h-5 w-5" />
              +98
            </span>
            <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-widest">
              this month
            </span>
          </div>
          <div className="pb-3 hidden sm:block flex-1 max-w-[260px] h-14 -mb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark}>
                <defs>
                  <linearGradient id="ph-spark" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  fill="url(#ph-spark)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-4 text-sm">
          <span className="font-mono text-primary font-semibold">
            Top 6.4% Worldwide
          </span>
          <span className="text-xs text-muted-foreground font-mono">
            #4,128 of 1.2M · ↑ 312 ranks
          </span>
        </div>
      </div>

      {/* Side ratings + today */}
      <div className="border-t lg:border-t-0 lg:border-l border-border lg:pl-7 pt-4 lg:pt-0 flex flex-col gap-4 lg:min-w-[220px]">
        <div className="grid grid-cols-2 gap-4">
          {ratings.map((r) => (
            <div key={r.label} className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {r.label}
              </span>
              <div className="flex items-baseline gap-1.5">
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
              <span className="text-[10px] font-mono text-muted-foreground mt-0.5">
                {r.percentile}
              </span>
            </div>
          ))}
        </div>

        <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3 text-primary" /> Today
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-2xl font-semibold text-primary">
              +28
            </span>
            <span className="text-xs text-muted-foreground">rating</span>
          </div>
          <div className="mt-1 flex items-baseline gap-3 text-[11px] font-mono text-muted-foreground">
            <span>
              <span className="text-foreground">87.4%</span> acc
            </span>
            <span>
              <span className="text-foreground">6W</span>·
              <span className="text-foreground">1D</span>·
              <span className="text-negative">2L</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
