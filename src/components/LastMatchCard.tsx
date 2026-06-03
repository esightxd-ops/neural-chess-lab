import { ArrowUpRight } from "lucide-react";

const moves = [
  { n: 1, q: "Elite" },
  { n: 2, q: "Accurate" },
  { n: 3, q: "Accurate" },
  { n: 4, q: "Practical" },
  { n: 5, q: "Elite" },
  { n: 6, q: "Accurate" },
  { n: 7, q: "Risky" },
  { n: 8, q: "Practical" },
  { n: 9, q: "Accurate" },
  { n: 10, q: "Elite" },
  { n: 11, q: "Accurate" },
  { n: 12, q: "Risky" },
  { n: 13, q: "Panic" },
  { n: 14, q: "Losing" },
  { n: 15, q: "Practical" },
  { n: 16, q: "Accurate" },
  { n: 17, q: "Elite" },
  { n: 18, q: "Accurate" },
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
            vs <span className="text-foreground">grandpawn_42</span> · Rapid
            10+0
          </p>
        </div>
        <button className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
          Full review <ArrowUpRight className="h-3 w-3" />
        </button>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-3">
        <Stat label="Result" value="WIN" accent="primary" />
        <Stat label="Accuracy" value="91.2%" />
        <Stat label="Perf" value="1924" />
        <Stat label="Critical" value="1" accent="negative" />
      </div>

      <div className="mt-5">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
          Move quality timeline
        </div>
        <div className="flex items-end gap-[3px] h-12">
          {moves.map((m) => (
            <div
              key={m.n}
              className={`flex-1 rounded-sm ${colorByQ[m.q]} opacity-90`}
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
              title={`Move ${m.n}: ${m.q}`}
            />
          ))}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {Object.keys(colorByQ).map((k) => (
            <span key={k} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-sm ${colorByQ[k]}`} /> {k}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 rounded-md border border-primary/30 bg-primary/5 px-3 py-2.5 text-sm">
        <span className="text-primary font-medium">+12</span>{" "}
        <span className="text-muted-foreground">tactical rating</span>{" "}
        <span className="text-foreground">
          — sharp calculation on move 17 converted the advantage.
        </span>
      </div>
    </section>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "negative";
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
    </div>
  );
}
