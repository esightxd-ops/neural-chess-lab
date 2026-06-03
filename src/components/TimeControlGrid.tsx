import { Zap, Bolt, Clock4, CalendarDays } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChessData } from "@/lib/chess/store";
import type { TimeClass, TimeControlStats } from "@/lib/chess/types";

const META: Record<
  TimeClass,
  { label: string; icon: LucideIcon; accent: "primary" | "blue" }
> = {
  bullet: { label: "Bullet", icon: Bolt, accent: "blue" },
  blitz: { label: "Blitz", icon: Zap, accent: "blue" },
  rapid: { label: "Rapid", icon: Clock4, accent: "primary" },
  daily: { label: "Daily", icon: CalendarDays, accent: "primary" },
};

const ORDER: TimeClass[] = ["bullet", "blitz", "rapid", "daily"];

export function TimeControlGrid() {
  const { analytics } = useChessData();
  const stats = ORDER.map((tc) => analytics.byTimeClass[tc]).filter(Boolean) as NonNullable<
    ReturnType<typeof analytics.byTimeClass[TimeClass]>
  >[];

  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">Performance by Time Control</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          imported archives
        </span>
      </div>

      {stats.length === 0 ? (
        <div className="text-xs font-mono text-muted-foreground py-8 text-center">
          No time-control data yet — import a Chess.com profile.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {stats.map((m) => {
            const meta = META[m.timeClass];
            const Icon = meta.icon;
            const total = Math.max(1, m.games);
            return (
              <div key={m.timeClass} className="panel-elevated p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "h-7 w-7 rounded-md grid place-items-center",
                        meta.accent === "primary"
                          ? "bg-primary/15 text-primary"
                          : "bg-accent-blue/15 text-accent-blue",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-sm font-semibold tracking-tight">{meta.label}</span>
                  </div>
                  <span
                    className={cn(
                      "font-mono text-[11px] px-1.5 py-0.5 rounded",
                      m.delta30d >= 0 ? "text-primary bg-primary/10" : "text-negative bg-negative/10",
                    )}
                  >
                    {m.delta30d >= 0 ? "+" : ""}
                    {m.delta30d}
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-3xl font-semibold tabular">{m.rating}</span>
                  <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                    best {m.best}
                  </span>
                </div>

                <div className="flex h-1.5 rounded overflow-hidden">
                  <span className="bg-primary" style={{ width: `${(m.w / total) * 100}%` }} />
                  <span className="bg-muted-foreground/40" style={{ width: `${(m.d / total) * 100}%` }} />
                  <span className="bg-negative" style={{ width: `${(m.l / total) * 100}%` }} />
                </div>

                <div className="grid grid-cols-2 gap-y-1.5 gap-x-3 text-[11px] font-mono">
                  <KV k="Games" v={m.games.toLocaleString()} />
                  <KV k="Win %" v={`${m.winRate.toFixed(1)}%`} accent="primary" />
                  <KV k="W·L·D" v={`${m.w}·${m.l}·${m.d}`} />
                  <KV k="Avg opp" v={m.avgOpponent ? String(m.avgOpponent) : "—"} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function KV({ k, v, accent }: { k: string; v: string; accent?: "primary" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{k}</span>
      <span className={accent === "primary" ? "text-primary" : "text-foreground"}>{v}</span>
    </div>
  );
}
