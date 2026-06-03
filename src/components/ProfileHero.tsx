import { TrendingUp, TrendingDown, Flame, Calendar, Globe2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChessData } from "@/lib/chess/store-context";
import type { TimeClass } from "@/lib/chess/types";

const TC_LABEL: Record<TimeClass, string> = {
  rapid: "Rapid rating",
  blitz: "Blitz rating",
  bullet: "Bullet rating",
  daily: "Daily rating",
};

function initials(name: string) {
  return name
    .replace(/[^A-Za-z0-9]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0].toUpperCase())
    .join("") || name.slice(0, 2).toUpperCase();
}

function formatJoined(unix?: number) {
  if (!unix) return null;
  return new Date(unix * 1000).toLocaleDateString(undefined, {
    month: "short",
    year: "numeric",
  });
}

export function ProfileHero() {
  const { analytics, isMock } = useChessData();
  const { profile, summary, streaks } = analytics;
  const r7 = summary.primaryDelta7d;
  const r30 = summary.primaryDelta30d;
  const total = summary.totalGames;
  const lossesDraws = summary.losses + summary.draws;

  return (
    <section className="panel relative overflow-hidden">
      <div className="absolute inset-0 opacity-40 pointer-events-none bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_50%)]" />
      <div className="relative grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-10 p-5 lg:p-7">
        <div className="flex items-start gap-5">
          <div className="relative">
            <div className="h-20 w-20 lg:h-24 lg:w-24 rounded-2xl bg-gradient-to-br from-primary/40 via-accent-blue/20 to-transparent border border-border grid place-items-center text-2xl lg:text-3xl font-semibold glow-primary overflow-hidden">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.username} className="h-full w-full object-cover" />
              ) : (
                initials(profile.username)
              )}
            </div>
            {profile.title && (
              <span className="absolute -bottom-1.5 -right-1.5 h-6 px-1.5 rounded-full bg-primary text-[10px] font-mono grid place-items-center text-primary-foreground border-2 border-panel">
                {profile.title}
              </span>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-semibold tracking-tight">{profile.username}</h1>
              {profile.countryFlag && (
                <span className="text-base" title={profile.country}>
                  {profile.countryFlag}
                </span>
              )}
              {isMock && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-gold px-1.5 py-0.5 rounded bg-gold/10 border border-gold/30">
                  Demo
                </span>
              )}
              {streaks.currentResult === "W" && streaks.currentLength >= 2 && (
                <span className="text-[10px] font-mono uppercase tracking-widest text-primary px-1.5 py-0.5 rounded bg-primary/10 border border-primary/30">
                  <Flame className="h-3 w-3 inline -mt-0.5" /> {streaks.currentLength} streak
                </span>
              )}
            </div>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-muted-foreground">
              {formatJoined(profile.joinedAt) && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> joined {formatJoined(profile.joinedAt)}
                </span>
              )}
              {typeof profile.followers === "number" && (
                <span>{profile.followers.toLocaleString()} followers</span>
              )}
              <a
                href={profile.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Globe2 className="h-3 w-3" /> chess.com/{profile.username}
              </a>
            </div>

            <div className="mt-5 flex items-end gap-6 flex-wrap">
              <div>
                <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                  {TC_LABEL[summary.primaryTimeClass]}
                </div>
                <div className="flex items-baseline gap-3 mt-1">
                  <span className="font-mono text-[64px] lg:text-[80px] leading-none font-semibold tabular tracking-tight">
                    {summary.primaryRating || "—"}
                  </span>
                  <div className="flex flex-col pb-2">
                    <span
                      className={cn(
                        "font-mono font-semibold text-sm",
                        r30 >= 0 ? "text-primary" : "text-negative",
                      )}
                    >
                      {r30 >= 0 ? "+" : ""}
                      {r30} · 30d
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
                      {total.toLocaleString()} games analyzed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 lg:min-w-[420px] lg:border-l lg:border-border lg:pl-8">
          <MiniMetric label="7d change" value={r7} accent="primary" />
          <MiniMetric label="30d change" value={r30} accent="primary" />
          <MiniMetric
            label="Games analyzed"
            raw={total.toLocaleString()}
            sub="recent archives"
          />
          <MiniMetric
            label="Win rate"
            raw={`${summary.winRate.toFixed(1)}%`}
            sub={`W ${summary.wins} · L ${summary.losses} · D ${summary.draws}`}
            accent={summary.winRate >= 50 ? "primary" : "default"}
          />
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
}: {
  label: string;
  value?: number;
  raw?: string;
  sub?: string;
  accent?: "primary" | "default";
}) {
  const positive = typeof value === "number" ? value >= 0 : true;
  return (
    <div className="panel-elevated px-3.5 py-3">
      <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-1.5">
        {typeof value === "number" ? (
          <span
            className={cn(
              "font-mono text-2xl font-semibold tabular flex items-center gap-1",
              positive ? "text-primary" : "text-negative",
            )}
          >
            {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {positive ? "+" : ""}
            {value}
          </span>
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
        <div className="text-[10px] font-mono text-muted-foreground mt-0.5">{sub}</div>
      )}
    </div>
  );
}
