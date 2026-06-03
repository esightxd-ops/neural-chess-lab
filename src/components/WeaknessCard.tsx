import { AlertTriangle, Activity, ShieldAlert } from "lucide-react";

const insights = [
  {
    icon: ShieldAlert,
    severity: "high",
    title: "Rook endgames",
    body: "Conversion rate of winning rook endings is 54% vs 78% expected at your rating.",
    recurrence: "18 of last 50 games",
    eloLoss: -74,
    confidence: 92,
  },
  {
    icon: AlertTriangle,
    severity: "high",
    title: "Opposite-side castling attacks",
    body: "You underperform by 142 Elo when opponent castles long. Defensive tempo lost on average move 14.",
    recurrence: "11 of last 50 games",
    eloLoss: -58,
    confidence: 87,
  },
  {
    icon: Activity,
    severity: "med",
    title: "Advantage retention after exchanges",
    body: "+1.4 eval drops to +0.3 within 4 moves after major piece trades. Simplification timing needs work.",
    recurrence: "23 of last 50 games",
    eloLoss: -31,
    confidence: 78,
  },
];

const sevStyles = {
  high: {
    chip: "text-negative border-negative/30 bg-negative/5",
    label: "Critical",
    bar: "bg-negative",
  },
  med: {
    chip: "text-gold border-gold/30 bg-gold/5",
    label: "Moderate",
    bar: "bg-gold",
  },
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
            Diagnostic alerts · last 50 games · est −163 Elo
          </p>
        </div>
        <span className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          AI live
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {insights.map((i) => {
          const Icon = i.icon;
          const s = sevStyles[i.severity as "high" | "med"];
          return (
            <div
              key={i.title}
              className="group relative rounded-md border border-border bg-panel-elevated hover:border-primary/40 transition-colors p-3 overflow-hidden"
            >
              <span className={`absolute left-0 top-0 bottom-0 w-[3px] ${s.bar}`} />
              <div className="flex gap-3">
                <div
                  className={`h-8 w-8 shrink-0 rounded-md border grid place-items-center ${s.chip}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="text-sm font-medium truncate">{i.title}</h3>
                    <span
                      className={`font-mono text-[10px] uppercase tracking-widest ${i.severity === "high" ? "text-negative" : "text-gold"}`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {i.body}
                  </p>
                  <div className="mt-2.5 grid grid-cols-3 gap-2 text-[10px] font-mono">
                    <Metric
                      label="Recurrence"
                      value={i.recurrence}
                    />
                    <Metric
                      label="Est. Elo loss"
                      value={`${i.eloLoss}`}
                      tone="negative"
                    />
                    <Metric
                      label="Confidence"
                      value={`${i.confidence}%`}
                      tone="primary"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button className="mt-4 w-full rounded-md border border-primary/40 bg-primary/10 hover:bg-primary/20 transition-colors py-2.5 text-xs font-mono uppercase tracking-widest text-primary">
        Generate training plan →
      </button>
    </section>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary" | "negative";
}) {
  return (
    <div className="rounded bg-panel border border-border px-2 py-1.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 ${tone === "primary" ? "text-primary" : tone === "negative" ? "text-negative" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}
