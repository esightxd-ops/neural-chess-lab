import { TrendingUp, TrendingDown, ChevronRight, Minus } from "lucide-react";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const seed = (n: number, base: number) =>
  Array.from({ length: 14 }, (_, i) => ({
    v: base + Math.round(Math.sin(i / 2 + n) * 18 + i * (n % 2 ? 1.6 : -0.8)),
  }));

const rows = [
  {
    skill: "Tactical Accuracy",
    rating: 1760,
    trend: 42,
    percentile: "Top 12%",
    confidence: 94,
    volatility: "stable",
    tier: "strong",
    data: seed(1, 1700),
  },
  {
    skill: "Calculation Depth",
    rating: 1680,
    trend: 18,
    percentile: "Top 22%",
    confidence: 88,
    volatility: "stable",
    tier: "strong",
    data: seed(2, 1640),
  },
  {
    skill: "Initiative",
    rating: 1710,
    trend: 22,
    percentile: "Top 18%",
    confidence: 91,
    volatility: "rising",
    tier: "strong",
    data: seed(3, 1660),
  },
  {
    skill: "Positional Play",
    rating: 1620,
    trend: 6,
    percentile: "Top 38%",
    confidence: 76,
    volatility: "stable",
    tier: "neutral",
    data: seed(4, 1610),
  },
  {
    skill: "Defense",
    rating: 1590,
    trend: 11,
    percentile: "Top 41%",
    confidence: 72,
    volatility: "volatile",
    tier: "neutral",
    data: seed(5, 1580),
  },
  {
    skill: "Endgames",
    rating: 1540,
    trend: -12,
    percentile: "Bottom 32%",
    confidence: 84,
    volatility: "declining",
    tier: "weak",
    data: seed(6, 1560),
  },
  {
    skill: "Time Management",
    rating: 1390,
    trend: 8,
    percentile: "Bottom 22%",
    confidence: 81,
    volatility: "volatile",
    tier: "weak",
    data: seed(7, 1380),
  },
];

const volColor: Record<string, string> = {
  stable: "text-muted-foreground",
  rising: "text-primary",
  volatile: "text-gold",
  declining: "text-negative",
};

export function PerformanceRatingsCard() {
  return (
    <section className="panel flex flex-col">
      <div className="p-5 pb-3 flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Performance Ratings
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Per-skill ELO · 30d · vs your bracket
          </p>
        </div>
        <button className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary">
          View all
        </button>
      </div>

      <div className="divide-y divide-border">
        {rows.map((r) => {
          const up = r.trend >= 0;
          const stroke =
            r.tier === "weak"
              ? "var(--color-negative)"
              : r.tier === "strong"
                ? "var(--color-primary)"
                : "var(--color-muted-foreground)";
          return (
            <button
              key={r.skill}
              className="group w-full grid grid-cols-[1fr_70px_60px_28px_44px_14px] items-center gap-3 px-5 py-3 hover:bg-secondary/40 transition-colors text-left"
            >
              <div className="min-w-0 flex items-center gap-3">
                <span
                  className={cn(
                    "h-1.5 w-1.5 rounded-full shrink-0",
                    r.tier === "strong" && "bg-primary",
                    r.tier === "neutral" && "bg-muted-foreground",
                    r.tier === "weak" && "bg-negative",
                  )}
                />
                <div className="min-w-0">
                  <div className="text-sm truncate">{r.skill}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {r.percentile}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-mono uppercase tracking-wider",
                        volColor[r.volatility],
                      )}
                    >
                      · {r.volatility}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-7 w-[70px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={r.data}>
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={stroke}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <span className="font-mono text-sm tabular text-right">
                {r.rating}
              </span>
              <span
                className={cn(
                  "font-mono text-[10px] flex items-center justify-end gap-0.5",
                  up ? "text-primary" : "text-negative",
                )}
              >
                {up ? (
                  <TrendingUp className="h-3 w-3" />
                ) : r.trend === 0 ? (
                  <Minus className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {up ? "+" : ""}
                {r.trend}
              </span>
              <span
                className="font-mono text-[10px] text-muted-foreground text-right"
                title="Confidence"
              >
                {r.confidence}%
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-foreground transition-colors" />
            </button>
          );
        })}
      </div>
    </section>
  );
}
