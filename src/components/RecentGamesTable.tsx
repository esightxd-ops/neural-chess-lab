import { ArrowUpRight, ExternalLink, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export interface GameRow {
  id: string;
  result: "W" | "L" | "D";
  opponent: string;
  oppRating: number;
  color: "white" | "black";
  delta: number;
  mode: string;
  opening: string;
  eco: string;
  moves: number;
  date: string;
  termination: string;
}

export const SAMPLE_GAMES: GameRow[] = [
  { id: "g1", result: "W", opponent: "grandpawn_42", oppRating: 1798, color: "white", delta: 18, mode: "Rapid 10+0", opening: "Sicilian Najdorf", eco: "B90", moves: 38, date: "2h ago", termination: "resign" },
  { id: "g2", result: "W", opponent: "knightmare", oppRating: 1812, color: "black", delta: 22, mode: "Rapid 10+0", opening: "Caro-Kann Advance", eco: "B12", moves: 47, date: "4h ago", termination: "checkmate" },
  { id: "g3", result: "L", opponent: "bishop_blast", oppRating: 1856, color: "white", delta: -14, mode: "Blitz 5+0", opening: "Ruy Lopez Berlin", eco: "C67", moves: 52, date: "6h ago", termination: "time" },
  { id: "g4", result: "W", opponent: "rookieboss", oppRating: 1734, color: "white", delta: 12, mode: "Blitz 3+2", opening: "Italian Game", eco: "C50", moves: 31, date: "8h ago", termination: "resign" },
  { id: "g5", result: "D", opponent: "endgame_eli", oppRating: 1844, color: "black", delta: 2, mode: "Rapid 15+10", opening: "Queens Gambit Declined", eco: "D37", moves: 64, date: "Yesterday", termination: "repetition" },
  { id: "g6", result: "W", opponent: "tactical_tim", oppRating: 1780, color: "black", delta: 19, mode: "Bullet 1+0", opening: "Pirc Defense", eco: "B07", moves: 28, date: "Yesterday", termination: "resign" },
  { id: "g7", result: "L", opponent: "deepblue_jr", oppRating: 1902, color: "white", delta: -18, mode: "Rapid 10+0", opening: "Kings Indian", eco: "E90", moves: 41, date: "2d ago", termination: "checkmate" },
  { id: "g8", result: "W", opponent: "pawnpusher", oppRating: 1764, color: "white", delta: 14, mode: "Blitz 5+0", opening: "London System", eco: "D02", moves: 36, date: "2d ago", termination: "resign" },
];

const resultColor: Record<GameRow["result"], string> = {
  W: "text-primary bg-primary/10 border-primary/30",
  L: "text-negative bg-negative/10 border-negative/30",
  D: "text-muted-foreground bg-muted border-border",
};

interface Props {
  rows?: GameRow[];
  showTitle?: boolean;
  dense?: boolean;
}

export function RecentGamesTable({
  rows = SAMPLE_GAMES,
  showTitle = true,
  dense = false,
}: Props) {
  return (
    <section className={cn(!dense && "panel p-5")}>
      {showTitle && (
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">
              Recent Games
            </h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              last {rows.length} games · click any row to review
            </p>
          </div>
          <button className="text-[10px] font-mono uppercase tracking-widest text-primary hover:underline flex items-center gap-1">
            View all <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
      )}

      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground border-b border-border">
              <th className="text-left font-normal py-2 pr-3">Result</th>
              <th className="text-left font-normal py-2 pr-3">Opponent</th>
              <th className="text-center font-normal py-2 px-2">Color</th>
              <th className="text-right font-normal py-2 px-2">Δ</th>
              <th className="text-left font-normal py-2 px-2 hidden md:table-cell">Mode</th>
              <th className="text-left font-normal py-2 px-2 hidden lg:table-cell">Opening</th>
              <th className="text-right font-normal py-2 px-2 hidden sm:table-cell">Moves</th>
              <th className="text-right font-normal py-2 pl-2">Date</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {rows.map((g) => (
              <tr
                key={g.id}
                className="border-b border-border/60 hover:bg-panel-elevated/60 cursor-pointer transition-colors group"
              >
                <td className="py-2.5 pr-3">
                  <span
                    className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded border text-[11px] font-semibold",
                      resultColor[g.result],
                    )}
                  >
                    {g.result}
                  </span>
                </td>
                <td className="py-2.5 pr-3">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-gradient-to-br from-panel-elevated to-panel border border-border grid place-items-center text-[10px] text-muted-foreground">
                      {g.opponent[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-foreground text-xs truncate">{g.opponent}</div>
                      <div className="text-[10px] text-muted-foreground">{g.oppRating}</div>
                    </div>
                  </div>
                </td>
                <td className="py-2.5 px-2 text-center">
                  <Circle
                    className={cn(
                      "inline h-3 w-3",
                      g.color === "white"
                        ? "fill-foreground text-foreground"
                        : "fill-background text-foreground",
                    )}
                  />
                </td>
                <td
                  className={cn(
                    "py-2.5 px-2 text-right tabular text-xs",
                    g.delta > 0
                      ? "text-primary"
                      : g.delta < 0
                        ? "text-negative"
                        : "text-muted-foreground",
                  )}
                >
                  {g.delta > 0 ? "+" : ""}
                  {g.delta}
                </td>
                <td className="py-2.5 px-2 hidden md:table-cell text-xs text-muted-foreground">
                  {g.mode}
                </td>
                <td className="py-2.5 px-2 hidden lg:table-cell text-xs">
                  <span className="text-foreground">{g.opening}</span>
                  <span className="text-muted-foreground ml-1.5">{g.eco}</span>
                </td>
                <td className="py-2.5 px-2 hidden sm:table-cell text-right text-xs text-muted-foreground tabular">
                  {g.moves}
                </td>
                <td className="py-2.5 pl-2 text-right text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1 group-hover:text-primary transition-colors">
                    {g.date}
                    <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
