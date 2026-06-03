import { StatTile } from "./StatTile";
import { useChessData } from "@/lib/chess/store-context";
import type { TimeClass } from "@/lib/chess/types";

const ACCENT: Record<TimeClass, "primary" | "blue"> = {
  rapid: "primary",
  daily: "primary",
  blitz: "blue",
  bullet: "blue",
};

function sparkFromHistory(history: { t: number; rating: number }[], n = 20) {
  if (!history.length) return undefined;
  const sliced = history.slice(-Math.max(n, 4));
  const step = Math.max(1, Math.floor(sliced.length / n));
  const out: number[] = [];
  for (let i = 0; i < sliced.length; i += step) out.push(sliced[i].rating);
  if (out[out.length - 1] !== sliced[sliced.length - 1].rating)
    out.push(sliced[sliced.length - 1].rating);
  return out;
}

export function StatTileRow() {
  const { analytics } = useChessData();
  const { byTimeClass, ratingHistory, summary, streaks } = analytics;
  const order: TimeClass[] = ["rapid", "blitz", "bullet", "daily"];

  const tiles = order.map((tc) => {
    const s = byTimeClass[tc];
    const hist = ratingHistory.filter((h) => h.timeClass === tc);
    if (!s) {
      return (
        <StatTile
          key={tc}
          label={tc[0].toUpperCase() + tc.slice(1)}
          value="—"
          sub="no games"
        />
      );
    }
    return (
      <StatTile
        key={tc}
        label={tc[0].toUpperCase() + tc.slice(1)}
        value={String(s.rating)}
        delta={s.delta30d}
        spark={sparkFromHistory(hist)}
        accent={ACCENT[tc]}
        sub={`peak ${s.best}`}
      />
    );
  });

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-3">
      {tiles}
      <StatTile
        label="Win rate"
        value={`${summary.winRate.toFixed(1)}%`}
        sub={`${summary.totalGames.toLocaleString()} games`}
        accent={summary.winRate >= 50 ? "primary" : undefined}
      />
      <StatTile
        label="Games"
        value={summary.totalGames.toLocaleString()}
        sub="recent archives"
      />
      <StatTile
        label="Avg opponent"
        value={summary.avgOpponent ? String(summary.avgOpponent) : "—"}
        sub={
          summary.avgOpponent && summary.primaryRating
            ? `${summary.avgOpponent - summary.primaryRating >= 0 ? "+" : ""}${summary.avgOpponent - summary.primaryRating} elo gap`
            : ""
        }
      />
      <StatTile
        label="Current streak"
        value={`${streaks.currentResult}${streaks.currentLength}`}
        sub={`best W${streaks.longestWin}`}
        accent="gold"
      />
    </div>
  );
}
