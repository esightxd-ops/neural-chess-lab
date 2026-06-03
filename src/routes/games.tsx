import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { RecentGamesTable } from "@/components/RecentGamesTable";
import { ChevronDown, Filter } from "lucide-react";
import { useChessData } from "@/lib/chess/store-context";
import type { Game, TimeClass } from "@/lib/chess/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — Chesslab" },
      { name: "description", content: "Full match history with filters." },
    ],
  }),
  component: GamesPage,
});

const TIME_OPTS: ("All" | TimeClass)[] = ["All", "bullet", "blitz", "rapid", "daily"];
const RESULT_OPTS: ("Any" | "W" | "L" | "D")[] = ["Any", "W", "L", "D"];
const COLOR_OPTS: ("Both" | "white" | "black")[] = ["Both", "white", "black"];

function GamesPage() {
  const { analytics } = useChessData();
  const [tc, setTc] = useState<(typeof TIME_OPTS)[number]>("All");
  const [result, setResult] = useState<(typeof RESULT_OPTS)[number]>("Any");
  const [color, setColor] = useState<(typeof COLOR_OPTS)[number]>("Both");

  const rows: Game[] = useMemo(() => {
    return analytics.games.filter((g) => {
      if (tc !== "All" && g.timeClass !== tc) return false;
      if (result !== "Any" && g.result !== result) return false;
      if (color !== "Both" && g.playerColor !== color) return false;
      return true;
    });
  }, [analytics.games, tc, result, color]);

  const selected = rows[0];

  return (
    <AppShell section="Games">
      <section className="panel p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Filters
          </span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
            {rows.length} of {analytics.games.length} games
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Dropdown label="Time" value={tc} options={TIME_OPTS} onChange={setTc} />
          <Dropdown label="Result" value={result} options={RESULT_OPTS} onChange={setResult} />
          <Dropdown label="Color" value={color} options={COLOR_OPTS} onChange={setColor} />
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="panel p-5">
          <RecentGamesTable rows={rows} limit={rows.length} showTitle={false} dense />
        </div>
        {selected && (
          <aside className="panel p-5 h-fit space-y-4 xl:sticky xl:top-20">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                Most recent in filter
              </div>
              <div className="mt-1 text-sm font-semibold tracking-tight truncate">
                vs {selected.opponent}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground mt-0.5 truncate">
                {selected.timeClass} · {selected.opening} {selected.eco && `· ${selected.eco}`}
              </div>
            </div>
            <MiniBoard />
            <div className="grid grid-cols-3 gap-2 text-center">
              <Pill label="Result" value={selected.result} tone={selected.result === "W" ? "primary" : selected.result === "L" ? "negative" : undefined} />
              <Pill label="Moves" value={String(selected.moves || "—")} />
              <Pill label="Opp" value={String(selected.opponentRating || "—")} />
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={selected.url}
                target="_blank"
                rel="noreferrer"
                className="h-9 grid place-items-center rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
              >
                Open on chess.com
              </a>
            </div>
          </aside>
        )}
      </div>
    </AppShell>
  );
}

function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <label className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md panel-elevated text-xs hover:border-primary/40 transition-colors cursor-pointer">
      <span className="text-muted-foreground">{label}:</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="bg-transparent text-foreground font-mono outline-none cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o} className="bg-panel text-foreground">
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </label>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary" | "negative";
}) {
  return (
    <div className="panel-elevated py-2">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 font-mono text-sm font-semibold",
          tone === "primary" && "text-primary",
          tone === "negative" && "text-negative",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function MiniBoard() {
  return (
    <div className="grid grid-cols-8 aspect-square rounded-md overflow-hidden border border-border">
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8);
        const c = i % 8;
        const dark = (r + c) % 2 === 1;
        return <div key={i} className={dark ? "bg-panel-elevated" : "bg-muted"} />;
      })}
    </div>
  );
}
