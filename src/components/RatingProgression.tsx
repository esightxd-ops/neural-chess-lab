import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceDot,
} from "recharts";
import { cn } from "@/lib/utils";

const MODES = ["Rapid", "Blitz", "Bullet", "Daily"] as const;
const RANGES = ["7d", "30d", "90d", "1y", "all"] as const;

type Mode = (typeof MODES)[number];
type Range = (typeof RANGES)[number];

const baseByMode: Record<Mode, number> = {
  Rapid: 1842,
  Blitz: 1756,
  Bullet: 1612,
  Daily: 1924,
};

const rangePoints: Record<Range, number> = {
  "7d": 14,
  "30d": 30,
  "90d": 60,
  "1y": 90,
  all: 140,
};

function gen(mode: Mode, range: Range) {
  const points = rangePoints[range];
  const end = baseByMode[mode];
  const start = end - (range === "all" ? 320 : range === "1y" ? 180 : range === "90d" ? 110 : range === "30d" ? 70 : 28);
  return Array.from({ length: points }, (_, i) => {
    const t = i / (points - 1);
    const base = start + (end - start) * t;
    const noise = Math.sin(i / 2.4) * 18 + Math.cos(i / 1.5) * 8 + (i % 3) * 4;
    return { d: i, rating: Math.round(base + noise) };
  });
}

interface Props {
  className?: string;
  defaultMode?: Mode;
}

export function RatingProgression({ className, defaultMode = "Rapid" }: Props) {
  const [mode, setMode] = useState<Mode>(defaultMode);
  const [range, setRange] = useState<Range>("30d");
  const data = useMemo(() => gen(mode, range), [mode, range]);

  const max = data.reduce((a, b) => (b.rating > a.rating ? b : a));
  const min = data.reduce((a, b) => (b.rating < a.rating ? b : a));
  const current = data[data.length - 1];
  const first = data[0];
  const delta = current.rating - first.rating;

  return (
    <section className={cn("panel p-5", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight">
              Rating Progression
            </h2>
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              {mode} · {range}
            </span>
          </div>
          <div className="mt-1.5 flex items-baseline gap-3">
            <span className="font-mono text-3xl font-semibold tabular">
              {current.rating}
            </span>
            <span
              className={cn(
                "font-mono text-sm font-semibold",
                delta >= 0 ? "text-primary" : "text-negative",
              )}
            >
              {delta >= 0 ? "+" : ""}
              {delta}
            </span>
            <span className="text-[11px] font-mono text-muted-foreground">
              high {max.rating} · low {min.rating}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-1 panel-elevated p-0.5">
            {MODES.map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-2.5 h-7 rounded text-[11px] font-mono uppercase tracking-widest transition-colors",
                  mode === m
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {RANGES.map((r) => (
              <button
                key={r}
                onClick={() => setRange(r)}
                className={cn(
                  "px-2 h-6 rounded text-[10px] font-mono uppercase tracking-widest transition-colors",
                  range === r
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="h-[260px] mt-4 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 18, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-grid)" vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="d"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["dataMin - 25", "dataMax + 25"]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={42}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-panel-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
              cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.4 }}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-primary)" }}
              fill="url(#rp)"
            />
            <ReferenceDot
              x={max.d}
              y={max.rating}
              r={4}
              fill="var(--color-gold)"
              stroke="var(--color-background)"
              strokeWidth={2}
              label={{
                value: `high ${max.rating}`,
                position: "top",
                fill: "var(--color-gold)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
            />
            <ReferenceDot
              x={min.d}
              y={min.rating}
              r={4}
              fill="var(--color-negative)"
              stroke="var(--color-background)"
              strokeWidth={2}
              label={{
                value: `low ${min.rating}`,
                position: "bottom",
                fill: "var(--color-negative)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
            />
            <ReferenceDot
              x={current.d}
              y={current.rating}
              r={5}
              fill="var(--color-primary)"
              stroke="var(--color-background)"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
