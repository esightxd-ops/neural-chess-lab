import { ArrowUpRight, Flag, Clock } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, ReferenceLine } from "recharts";

const moves = [
  { n: 1, q: "Elite", eval: 0.2, t: 6, avgT: 8 },
  { n: 2, q: "Accurate", eval: 0.3, t: 8, avgT: 10 },
  { n: 3, q: "Accurate", eval: 0.4, t: 11, avgT: 12 },
  { n: 4, q: "Practical", eval: 0.2, t: 14, avgT: 15 },
  { n: 5, q: "Elite", eval: 0.6, t: 22, avgT: 24 },
  { n: 6, q: "Accurate", eval: 0.7, t: 18, avgT: 20 },
  { n: 7, q: "Risky", eval: 0.4, t: 9, avgT: 28 },
  { n: 8, q: "Practical", eval: 0.5, t: 16, avgT: 22 },
  { n: 9, q: "Accurate", eval: 0.8, t: 24, avgT: 24 },
  { n: 10, q: "Elite", eval: 1.2, t: 30, avgT: 26 },
  { n: 11, q: "Accurate", eval: 1.3, t: 18, avgT: 24 },
  { n: 12, q: "Risky", eval: 0.9, t: 11, avgT: 30 },
  { n: 13, q: "Panic", eval: 0.2, t: 5, avgT: 32, turning: true },
  { n: 14, q: "Losing", eval: -0.4, t: 4, avgT: 28 },
  { n: 15, q: "Practical", eval: 0.1, t: 19, avgT: 22 },
  { n: 16, q: "Accurate", eval: 0.8, t: 26, avgT: 24 },
  { n: 17, q: "Elite", eval: 1.8, t: 4, avgT: 28, turning: true },
  { n: 18, q: "Accurate", eval: 2.1, t: 12, avgT: 20 },
];

const colorByQ: Record<string, string> = {
  Elite: "bg-gold",
  Accurate: "bg-primary",
  Practical: "bg-accent-cyan",
  Risky: "bg-muted-foreground",
  Panic: "bg-negative/70",
  Losing: "bg-negative",
};

export function LastMatchCard() {
  return (
    <section className="panel p-5 flex flex-col">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Last Match Review
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            vs <span className="text-foreground">grandpawn_42</span> (1798) ·
            Rapid 10+0 · 2h ago
          </p>
        </div>
        <button className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
          Full review <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-5 gap-3">
        <Stat label="Result" value="WIN" accent="primary" sub="+18 Elo" />
        <Stat label="Accuracy" value="91.2%" sub="vs 84.1% avg" />
        <Stat label="Perf" value="1924" sub="+82 above" />
        <Stat label="Critical" value="1" accent="negative" sub="move 13" />
        <Stat label="Avg think" value="14.2s" sub="opp 19.4s" />
      </div>

      {/* Pressure / eval graph */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-1.5">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Evaluation · pressure curve
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1 text-gold">
              <Flag className="h-3 w-3" /> turning points
            </span>
          </div>
        </div>
        <div className="h-[90px] -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={moves} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="evalg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <ReferenceLine y={0} stroke="var(--color-grid)" />
              {moves.filter((m) => m.turning).map((m) => (
                <ReferenceLine
                  key={m.n}
                  x={m.n}
                  stroke="var(--color-gold)"
                  strokeDasharray="2 3"
                  strokeOpacity={0.7}
                />
              ))}
              <Area
                type="monotone"
                dataKey="eval"
                stroke="var(--color-primary)"
                strokeWidth={2}
                fill="url(#evalg)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Move quality timeline */}
      <div className="mt-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Move quality timeline · hover for detail
        </div>
        <div className="flex items-end gap-[3px] h-12">
          {moves.map((m) => {
            const fast = m.t < m.avgT * 0.4;
            return (
              <div
                key={m.n}
                className={`group relative flex-1 rounded-sm ${colorByQ[m.q]} opacity-90 hover:opacity-100 hover:ring-1 hover:ring-foreground/40 transition`}
                style={{
                  height:
                    m.q === "Elite"
                      ? "100%"
                      : m.q === "Accurate"
                        ? "80%"
                        : m.q === "Practical"
                          ? "60%"
                          : m.q === "Risky"
                            ? "45%"
                            : m.q === "Panic"
                              ? "30%"
                              : "20%",
                }}
              >
                {m.turning && (
                  <Flag className="absolute -top-3 left-1/2 -translate-x-1/2 h-2.5 w-2.5 text-gold" />
                )}
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap rounded bg-panel-elevated border border-border px-2 py-1.5 text-[10px] font-mono opacity-0 group-hover:opacity-100 transition-opacity z-20 text-left shadow-lg">
                  <div className="text-foreground font-semibold">Move {m.n} · {m.q}</div>
                  <div className="text-muted-foreground">eval {m.eval > 0 ? "+" : ""}{m.eval.toFixed(1)}</div>
                  <div className={fast ? "text-negative" : "text-muted-foreground"}>
                    {m.t}s {fast && `(avg ${m.avgT}s)`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {Object.keys(colorByQ).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-sm ${colorByQ[k]}`} /> {k}
            </span>
          ))}
        </div>
      </div>

      {/* Turning point annotation */}
      <div className="mt-5 rounded-md border border-gold/30 bg-gold/5 px-3 py-2.5 text-sm flex items-start gap-3">
        <Clock className="h-4 w-4 text-gold mt-0.5 shrink-0" />
        <div>
          <span className="text-gold font-mono uppercase tracking-widest text-[10px]">
            Move 17 · turning point
          </span>
          <div className="text-foreground mt-0.5">
            Sharp calculation under clock pressure —{" "}
            <span className="font-mono text-gold">4s</span> spent vs avg{" "}
            <span className="font-mono text-muted-foreground">28s</span>.
            Eval swung <span className="font-mono text-primary">+1.0</span>.
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            → <span className="text-primary">+12 tactical rating</span>,
            +8 initiative
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent?: "primary" | "negative";
  sub?: string;
}) {
  return (
    <div className="rounded-md bg-panel-elevated border border-border px-3 py-2.5">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 font-mono text-lg tabular ${
          accent === "primary"
            ? "text-primary"
            : accent === "negative"
              ? "text-negative"
              : "text-foreground"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}
