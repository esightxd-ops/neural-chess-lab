import {
  Sparkles,
  TrendingUp,
  Trophy,
  AlertCircle,
  Activity,
} from "lucide-react";

const events = [
  {
    icon: TrendingUp,
    tone: "primary",
    label: "Streak",
    title: "Defensive rating up 5 sessions in a row",
    sub: "+47 Elo · longest streak since March",
    time: "2m ago",
  },
  {
    icon: Trophy,
    tone: "gold",
    label: "Milestone",
    title: "Approaching Top 10% in initiative handling",
    sub: "1.4% to go · est. 8 games at current pace",
    time: "1h ago",
  },
  {
    icon: AlertCircle,
    tone: "negative",
    label: "Detected",
    title: "New weakness: time pressure in queenless middlegames",
    sub: "Recurring in 6 of last 12 games",
    time: "3h ago",
  },
  {
    icon: Sparkles,
    tone: "primary",
    label: "Best ever",
    title: "Best tactical performance this month",
    sub: "91.2% accuracy vs grandpawn_42 (+1798)",
    time: "5h ago",
  },
  {
    icon: Activity,
    tone: "muted",
    label: "Evolving",
    title: "Your blitz profile is becoming more tactical",
    sub: "+12 sharpness · −6 positional over 14 days",
    time: "1d ago",
  },
];

const toneStyles: Record<string, string> = {
  primary: "text-primary bg-primary/10 border-primary/30",
  gold: "text-gold bg-gold/10 border-gold/30",
  negative: "text-negative bg-negative/10 border-negative/30",
  muted: "text-muted-foreground bg-secondary border-border",
};

export function NarrativeFeedCard() {
  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Live Intelligence
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your chess brain, evolving in real time
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Live
        </span>
      </div>

      <div className="mt-4 relative">
        <span className="absolute left-[15px] top-2 bottom-2 w-px bg-border" />
        <ul className="space-y-3">
          {events.map((e) => {
            const Icon = e.icon;
            return (
              <li key={e.title} className="relative flex gap-3">
                <div
                  className={`relative z-10 h-8 w-8 shrink-0 rounded-md border grid place-items-center ${toneStyles[e.tone]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex items-baseline justify-between gap-2">
                    <span
                      className={`text-[9px] font-mono uppercase tracking-widest ${e.tone === "primary" ? "text-primary" : e.tone === "gold" ? "text-gold" : e.tone === "negative" ? "text-negative" : "text-muted-foreground"}`}
                    >
                      {e.label}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      {e.time}
                    </span>
                  </div>
                  <div className="text-sm leading-snug mt-0.5">{e.title}</div>
                  <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
                    {e.sub}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
