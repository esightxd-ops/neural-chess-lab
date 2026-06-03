import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { TimeControlGrid } from "@/components/TimeControlGrid";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/time-controls")({
  head: () => ({ meta: [{ title: "Time Controls — Chesslab" }] }),
  component: TimeControlsPage,
});

const comparison = [
  { m: "Bullet", g: 412, wr: 54.4, opp: 1604, gain: -22, best: 1634, activity: 38 },
  { m: "Blitz", g: 532, wr: 56.0, opp: 1742, gain: -8, best: 1812, activity: 64 },
  { m: "Rapid", g: 286, wr: 62.2, opp: 1798, gain: 98, best: 1864, activity: 42 },
  { m: "Daily", g: 54, wr: 57.4, opp: 1880, gain: 24, best: 1948, activity: 12 },
];

function TimeControlsPage() {
  return (
    <AppShell section="Time Controls">
      <TimeControlGrid />

      <section className="panel p-5">
        <h2 className="text-sm font-semibold tracking-tight mb-4">Mode comparison</h2>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left font-normal py-2 pr-3">Mode</th>
                <th className="text-right font-normal py-2 px-2">Games</th>
                <th className="text-right font-normal py-2 px-2">Win %</th>
                <th className="text-right font-normal py-2 px-2">Avg opp</th>
                <th className="text-right font-normal py-2 px-2">Δ gain</th>
                <th className="text-right font-normal py-2 px-2">Best</th>
                <th className="text-left font-normal py-2 pl-2">Activity</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((r) => (
                <tr key={r.m} className="border-b border-border/60">
                  <td className="py-2.5 pr-3 text-foreground">{r.m}</td>
                  <td className="py-2.5 px-2 text-right">{r.g}</td>
                  <td className="py-2.5 px-2 text-right text-primary">{r.wr}%</td>
                  <td className="py-2.5 px-2 text-right">{r.opp}</td>
                  <td
                    className={cn(
                      "py-2.5 px-2 text-right",
                      r.gain > 0 ? "text-primary" : r.gain < 0 ? "text-negative" : "text-muted-foreground",
                    )}
                  >
                    {r.gain > 0 ? "+" : ""}
                    {r.gain}
                  </td>
                  <td className="py-2.5 px-2 text-right text-gold">{r.best}</td>
                  <td className="py-2.5 pl-2">
                    <div className="h-1.5 w-32 rounded bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${(r.activity / 64) * 100}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
