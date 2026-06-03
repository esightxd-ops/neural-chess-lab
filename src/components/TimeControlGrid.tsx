import { Zap, Bolt, Clock4, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

const modes = [
  {
    name: "Bullet",
    icon: Bolt,
    rating: 1612,
    delta: 12,
    games: 412,
    w: 224,
    l: 158,
    d: 30,
    avgOpp: 1604,
    best: 1634,
    accent: "blue",
  },
  {
    name: "Blitz",
    icon: Zap,
    rating: 1756,
    delta: -8,
    games: 532,
    w: 298,
    l: 198,
    d: 36,
    avgOpp: 1742,
    best: 1812,
    accent: "blue",
  },
  {
    name: "Rapid",
    icon: Clock4,
    rating: 1842,
    delta: 24,
    games: 286,
    w: 178,
    l: 84,
    d: 24,
    avgOpp: 1798,
    best: 1864,
    accent: "primary",
  },
  {
    name: "Daily",
    icon: CalendarDays,
    rating: 1924,
    delta: 3,
    games: 54,
    w: 31,
    l: 16,
    d: 7,
    avgOpp: 1880,
    best: 1948,
    accent: "primary",
  },
] as const;

export function TimeControlGrid() {
  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">
          Performance by Time Control
        </h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          all time
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const wr = ((m.w / m.games) * 100).toFixed(1);
          return (
            <div
              key={m.name}
              className="panel-elevated p-4 flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-7 w-7 rounded-md grid place-items-center",
                      m.accent === "primary"
                        ? "bg-primary/15 text-primary"
                        : "bg-accent-blue/15 text-accent-blue",
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-semibold tracking-tight">
                    {m.name}
                  </span>
                </div>
                <span
                  className={cn(
                    "font-mono text-[11px] px-1.5 py-0.5 rounded",
                    m.delta >= 0
                      ? "text-primary bg-primary/10"
                      : "text-negative bg-negative/10",
                  )}
                >
                  {m.delta >= 0 ? "+" : ""}
                  {m.delta}
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-semibold tabular">
                  {m.rating}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                  best {m.best}
                </span>
              </div>

              {/* W/L/D bar */}
              <div className="flex h-1.5 rounded overflow-hidden">
                <span
                  className="bg-primary"
                  style={{ width: `${(m.w / m.games) * 100}%` }}
                />
                <span
                  className="bg-muted-foreground/40"
                  style={{ width: `${(m.d / m.games) * 100}%` }}
                />
                <span
                  className="bg-negative"
                  style={{ width: `${(m.l / m.games) * 100}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] font-mono">
                <KV k="Games" v={m.games.toLocaleString()} />
                <KV k="Win %" v={`${wr}%`} accent="primary" />
                <KV k="W·L·D" v={`${m.w}·${m.l}·${m.d}`} />
                <KV k="Avg opp" v={m.avgOpp.toString()} />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function KV({
  k,
  v,
  accent,
}: {
  k: string;
  v: string;
  accent?: "primary";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={accent === "primary" ? "text-primary" : "text-foreground"}>
        {v}
      </span>
    </div>
  );
}
