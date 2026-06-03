import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = Array.from({ length: 30 }, (_, i) => ({
  d: i + 1,
  rating: 1750 + Math.round(Math.sin(i / 3) * 22 + i * 3 + (i % 5) * 4),
}));

export function RatingTrendCard() {
  const start = data[0].rating;
  const end = data[data.length - 1].rating;
  const delta = end - start;

  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Rapid Rating · 30d
          </h2>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-semibold tabular">
              {end}
            </span>
            <span
              className={`font-mono text-sm ${delta >= 0 ? "text-primary" : "text-negative"}`}
            >
              {delta >= 0 ? "+" : ""}
              {delta}
            </span>
          </div>
        </div>
        <div className="flex gap-1 text-[10px] font-mono uppercase tracking-widest">
          {["7d", "30d", "90d", "1y"].map((p, idx) => (
            <button
              key={p}
              className={`px-2 py-1 rounded ${idx === 1 ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="h-[180px] mt-3 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--color-grid)" vertical={false} strokeDasharray="2 4" />
            <XAxis
              dataKey="d"
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={["dataMin - 20", "dataMax + 20"]}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }}
              axisLine={false}
              tickLine={false}
              width={36}
            />
            <Tooltip
              contentStyle={{
                background: "var(--color-panel-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
              }}
              labelStyle={{ color: "var(--color-muted-foreground)" }}
              cursor={{ stroke: "var(--color-primary)", strokeOpacity: 0.4 }}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke="var(--color-primary)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "var(--color-primary)" }}
              fill="url(#rg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
