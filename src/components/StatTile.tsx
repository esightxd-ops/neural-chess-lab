import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  sub?: string;
  delta?: number;
  spark?: number[];
  accent?: "primary" | "blue" | "gold" | "negative" | "default";
}

const accentColor: Record<string, string> = {
  primary: "var(--color-primary)",
  blue: "var(--color-accent-blue)",
  gold: "var(--color-gold)",
  negative: "var(--color-negative)",
  default: "var(--color-muted-foreground)",
};

export function StatTile({ label, value, sub, delta, spark, accent = "default" }: Props) {
  const color = accentColor[accent];
  return (
    <div className="panel p-4 flex flex-col justify-between min-h-[112px] hover:border-border/80 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        {typeof delta === "number" && (
          <span
            className={cn(
              "font-mono text-[11px] px-1.5 py-0.5 rounded",
              delta > 0
                ? "text-primary bg-primary/10"
                : delta < 0
                  ? "text-negative bg-negative/10"
                  : "text-muted-foreground bg-muted",
            )}
          >
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div
            className="font-mono text-[22px] sm:text-[26px] lg:text-[28px] leading-none font-semibold tabular"
            style={accent !== "default" ? { color } : undefined}
          >
            {value}
          </div>
          {sub && (
            <div className="text-[11px] font-mono text-muted-foreground mt-1.5 truncate">{sub}</div>
          )}
        </div>
        {spark && spark.length > 1 && (
          <div className="hidden sm:block h-10 w-[88px] shrink-0 -mb-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spark.map((v, i) => ({ i, v }))}>
                <defs>
                  <linearGradient id={`st-${label.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.5} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={color}
                  strokeWidth={1.5}
                  fill={`url(#st-${label.replace(/\s/g, "")})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
