import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RatingProgression } from "@/components/RatingProgression";
import { StatTile } from "@/components/StatTile";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const Route = createFileRoute("/ratings")({
  head: () => ({ meta: [{ title: "Ratings — Chesslab" }] }),
  component: RatingsPage,
});

const weekly = Array.from({ length: 12 }, (_, i) => ({
  w: `W${i + 1}`,
  delta: Math.round(Math.sin(i / 1.4) * 30 + (i % 3) * 8 - 4),
}));

const monthly = Array.from({ length: 6 }, (_, i) => ({
  m: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i],
  delta: [-22, 38, 65, -14, 98, 24][i],
}));

function RatingsPage() {
  return (
    <AppShell section="Ratings">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatTile label="Rapid · best" value="1864" sub="May 22" accent="primary" />
        <StatTile label="Blitz · best" value="1812" sub="Feb 03" accent="blue" />
        <StatTile label="Bullet · best" value="1634" sub="Jan 18" accent="blue" />
        <StatTile label="Daily · best" value="1948" sub="Apr 09" accent="primary" />
        <StatTile label="Rapid · worst" value="1612" sub="Aug 12" accent="negative" />
        <StatTile label="Blitz · worst" value="1502" sub="Jul 02" accent="negative" />
        <StatTile label="Bullet · worst" value="1391" sub="Jun 18" accent="negative" />
        <StatTile label="Daily · worst" value="1722" sub="Sep 04" accent="negative" />
      </div>

      <RatingProgression />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <DeltaChart title="Weekly rating change · Rapid" data={weekly} xKey="w" />
        <DeltaChart title="Monthly rating change · Rapid" data={monthly} xKey="m" />
      </div>

      <section className="panel p-5">
        <h2 className="text-sm font-semibold tracking-tight mb-4">
          Activity by mode
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { m: "Rapid", g: 286, wr: 62.2, accent: "primary" as const },
            { m: "Blitz", g: 532, wr: 56.0, accent: "blue" as const },
            { m: "Bullet", g: 412, wr: 54.4, accent: "blue" as const },
            { m: "Daily", g: 54, wr: 57.4, accent: "primary" as const },
          ].map((x) => (
            <StatTile
              key={x.m}
              label={`${x.m} · games`}
              value={x.g}
              sub={`${x.wr}% win rate`}
              accent={x.accent}
            />
          ))}
        </div>
      </section>
    </AppShell>
  );
}

function DeltaChart({
  title,
  data,
  xKey,
}: {
  title: string;
  data: Array<Record<string, number | string>>;
  xKey: string;
}) {
  return (
    <section className="panel p-5">
      <h2 className="text-sm font-semibold tracking-tight mb-3">{title}</h2>
      <div className="h-[220px] -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--color-grid)" vertical={false} strokeDasharray="2 4" />
            <XAxis dataKey={xKey} tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "var(--font-mono)" }} axisLine={false} tickLine={false} width={36} />
            <Tooltip
              contentStyle={{ background: "var(--color-panel-elevated)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12, fontFamily: "var(--font-mono)" }}
              cursor={{ fill: "var(--color-muted)", opacity: 0.4 }}
            />
            <Bar dataKey="delta" radius={[3, 3, 0, 0]}>
              {data.map((d, i) => (
                <cell key={i} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
