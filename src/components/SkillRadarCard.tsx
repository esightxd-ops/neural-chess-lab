import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { skill: "Aggressive", value: 82, peer: 64, elite: 88 },
  { skill: "Tactical", value: 84, peer: 60, elite: 90 },
  { skill: "Calculating", value: 74, peer: 60, elite: 86 },
  { skill: "Technical", value: 51, peer: 62, elite: 84 },
  { skill: "Resourceful", value: 68, peer: 58, elite: 82 },
  { skill: "Initiative", value: 79, peer: 61, elite: 87 },
  { skill: "Defensive", value: 60, peer: 64, elite: 83 },
  { skill: "Time Mgmt", value: 44, peer: 65, elite: 85 },
];

export function SkillRadarCard() {
  return (
    <section className="panel p-5 flex flex-col">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Competitive Identity
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            8-axis skill print · last 50 games
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" /> You
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/60" /> Peers
          </span>
          <span className="flex items-center gap-1.5 text-gold">
            <span className="h-2 w-2 rounded-full bg-gold" /> Elite
          </span>
        </div>
      </div>

      <div className="h-[320px] -mx-2 mt-2 relative">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="var(--color-grid)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: "var(--color-muted-foreground)",
                fontSize: 10,
                fontFamily: "var(--font-mono)",
              }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={false}
              axisLine={false}
            />
            <Radar
              name="Elite"
              dataKey="elite"
              stroke="var(--color-gold)"
              fill="transparent"
              strokeOpacity={0.4}
              strokeDasharray="2 4"
              strokeWidth={1}
            />
            <Radar
              name="Peers"
              dataKey="peer"
              stroke="var(--color-muted-foreground)"
              fill="var(--color-muted-foreground)"
              fillOpacity={0.08}
              strokeOpacity={0.5}
              strokeDasharray="3 3"
            />
            <Radar
              name="You"
              dataKey="value"
              stroke="var(--color-primary)"
              fill="var(--color-primary)"
              fillOpacity={0.28}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-3 flex items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Your style
          </div>
          <div className="mt-0.5 text-lg font-semibold tracking-tight">
            Dynamic <span className="text-primary">Calculator</span>
          </div>
          <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Sharp · Initiative-led · 7.2% of players share this profile
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { l: "Aggression", v: 82, t: "primary" },
            { l: "Tactical", v: 84, t: "primary" },
            { l: "Endgame", v: 44, t: "negative" },
          ].map((s) => (
            <div key={s.l} className="px-2">
              <div
                className={`font-mono text-base font-semibold ${s.t === "primary" ? "text-primary" : "text-negative"}`}
              >
                {s.v}
              </div>
              <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
                {s.l}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
