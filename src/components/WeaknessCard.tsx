import { AlertTriangle, Activity, ShieldAlert } from "lucide-react";

const insights = [
  {
    icon: AlertTriangle,
    severity: "high",
    title: "Opposite-side castling attacks",
    body: "You underperform by 142 Elo when opponent castles long. Defensive tempo lost on average move 14.",
    metric: "Bottom 21%",
  },
  {
    icon: Activity,
    severity: "med",
    title: "Advantage retention after exchanges",
    body: "+1.4 eval drops to +0.3 within 4 moves after major piece trades. Simplification timing needs work.",
    metric: "−0.9 avg",
  },
  {
    icon: ShieldAlert,
    severity: "high",
    title: "Rook endgames",
    body: "Conversion rate of winning rook endings is 54% vs 78% expected at your rating.",
    metric: "Bottom 18%",
  },
];

const sevColor = {
  high: "text-negative border-negative/30 bg-negative/5",
  med: "text-gold border-gold/30 bg-gold/5",
};

export function WeaknessCard() {
  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Weakness Detection
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Diagnostic alerts from your last 50 games
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          AI · live
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {insights.map((i) => {
          const Icon = i.icon;
          return (
            <div
              key={i.title}
              className="group rounded-md border border-border bg-panel-elevated hover:border-primary/40 transition-colors p-3 flex gap-3"
            >
              <div
                className={`h-8 w-8 shrink-0 rounded-md border grid place-items-center ${sevColor[i.severity as "high" | "med"]}`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <h3 className="text-sm font-medium truncate">{i.title}</h3>
                  <span className="font-mono text-[11px] text-negative whitespace-nowrap">
                    {i.metric}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {i.body}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/15 transition-colors py-2 text-xs font-mono uppercase tracking-widest text-primary">
        Generate training plan
      </button>
    </section>
  );
}
