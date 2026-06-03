import {
  Radar,
  RadarChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

const data = [
  { skill: "Tactics", value: 82, peer: 64 },
  { skill: "Calculation", value: 74, peer: 60 },
  { skill: "Endgames", value: 51, peer: 62 },
  { skill: "Defense", value: 68, peer: 58 },
  { skill: "Initiative", value: 79, peer: 61 },
  { skill: "Time Mgmt", value: 44, peer: 65 },
  { skill: "Positional", value: 71, peer: 63 },
];

export function SkillRadarCard() {
  return (
    <section className="panel p-5 flex flex-col">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Skill Radar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your competitive identity
          </p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-mono uppercase tracking-widest">
          <span className="flex items-center gap-1.5 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary" /> You
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/60" />{" "}
            Peers
          </span>
        </div>
      </div>

      <div className="h-[320px] -mx-2 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={data} outerRadius="78%">
            <PolarGrid stroke="var(--color-grid)" />
            <PolarAngleAxis
              dataKey="skill"
              tick={{
                fill: "var(--color-muted-foreground)",
                fontSize: 11,
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
              fillOpacity={0.25}
              strokeWidth={2}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
