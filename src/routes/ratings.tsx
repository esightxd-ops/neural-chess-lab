import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RatingProgression } from "@/components/RatingProgression";
import { StatTile } from "@/components/StatTile";
import { useChessData } from "@/lib/chess/store-context";
import type { TimeClass } from "@/lib/chess/types";

export const Route = createFileRoute("/ratings")({
  head: () => ({ meta: [{ title: "Ratings — Chesslab" }] }),
  component: RatingsPage,
});

const ORDER: TimeClass[] = ["rapid", "blitz", "bullet", "daily"];

function RatingsPage() {
  const { analytics } = useChessData();
  const tiles = ORDER.flatMap((tc) => {
    const s = analytics.byTimeClass[tc];
    if (!s) return [];
    return [
      <StatTile
        key={`${tc}-best`}
        label={`${tc} · best`}
        value={String(s.best)}
        sub={`current ${s.rating}`}
        accent={tc === "rapid" || tc === "daily" ? "primary" : "blue"}
      />,
      <StatTile
        key={`${tc}-worst`}
        label={`${tc} · low`}
        value={s.worst ? String(s.worst) : "—"}
        sub={`Δ30d ${s.delta30d >= 0 ? "+" : ""}${s.delta30d}`}
        accent="negative"
      />,
    ];
  });

  return (
    <AppShell section="Ratings">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">{tiles}</div>
      <RatingProgression />
      <section className="panel p-5">
        <h2 className="text-sm font-semibold tracking-tight mb-4">Activity by mode</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {ORDER.map((tc) => {
            const s = analytics.byTimeClass[tc];
            if (!s) return null;
            return (
              <StatTile
                key={tc}
                label={`${tc} · games`}
                value={s.games}
                sub={`${s.winRate.toFixed(1)}% win rate`}
                accent={tc === "rapid" || tc === "daily" ? "primary" : "blue"}
              />
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
