import { TrendingUp, TrendingDown, Flame, Calendar, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProfileHero() {
  const r7 = +24;
  const r30 = +98;
  return (
    <section className="panel relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_50%)]" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 p-5 lg:p-7">
        {/* Identity */}
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-gradient-to-br from-primary/40 via-accent-blue/20 to-transparent border border-border grid place-items-center text-2xl lg:text-3xl font-semibold glow-primary">
              MK
            </div>
            <span className="absolute -bottom-1.5 -right-1.5 h-6 w-6 rounded-full bg-primary text-[10px] font-mono grid place-items-center text-primary-foreground border-2 border-panel">
              GM
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">
                magnus_k
              </h1>
              <span className="text-base" title="Norway">🇳🇴</span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-gold px-1.5 py-0.5 rounded bg-gold/10 border border-gold/30">
                Grandmaster
              </span>
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30">
                <Flame className="h-3 w-3 inline -mt-0.5" /> 12 streak
              </span>
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" /> joined Mar 2019
              </span>
              <span>2,418 followers</span>
              <span className="flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                online now
              </span>
              <span className="flex items-center gap-1">
                <Globe2 className="h-3 w-3" /> chess.com/magnus_k
              </span>
            </div>

            <div className="mt-5 flex items-end gap-6 flex-wrap">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  Rapid rating
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-mono text-[64px] lg:text-[80px] leading-none font-semibold tabular tracking-tight">
                    1842
                  </span>
                  <div className="flex flex-col pb-2">
                    <span className="font-mono text-primary font-semibold text-sm">
                      Top 6.4%
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      #4,128 worldwide
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:min-w-[420px] lg:border-l lg:border-border lg:pl-8">
          <MiniMetric label="7d change" value={r7} accent="primary" prefix="±" />
          <MiniMetric label="30d change" value={r30} accent="primary" prefix="±" />
          <MiniMetric label="Games analyzed" raw="1,284" sub="last 90d" />
          <MiniMetric label="Win rate" raw="58.4%" sub="W 731 · L 412 · D 141" accent="primary" />
        </div>
      </div>
    </section>
  );
}

function MiniMetric({
  label,
  value,
  raw,
  sub,
  accent = "default",
  prefix,
}: {
  label: string;
  value?: number;
  raw?: string;
  sub?: string;
  accent?: "primary" | "default";
  prefix?: string;
}) {
  const positive = typeof value === "number" ? value >= 0 : true;
  return (
    <div className="panel-elevated px-3.5 py-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        {typeof value === "number" ? (
          <>
            <span
              className={cn(
                "font-mono text-2xl font-semibold tabular flex items-center gap-1",
                positive ? "text-primary" : "text-negative",
              )}
            >
              {positive ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              {prefix && positive ? "+" : ""}
              {value}
            </span>
          </>
        ) : (
          <span
            className={cn(
              "font-mono text-2xl font-semibold tabular",
              accent === "primary" && "text-primary",
            )}
          >
            {raw}
          </span>
        )}
      </div>
      {sub && (
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
          {sub}
        </div>
      )}
    </div>
  );
}
