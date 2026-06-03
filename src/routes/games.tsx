import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { RecentGamesTable, SAMPLE_GAMES } from "@/components/RecentGamesTable";
import { ChevronDown, Filter } from "lucide-react";

export const Route = createFileRoute("/games")({
  head: () => ({
    meta: [
      { title: "Games — Chesslab" },
      { name: "description", content: "Full match history with filters." },
    ],
  }),
  component: GamesPage,
});

const FILTERS = [
  { label: "Time control", value: "All" },
  { label: "Result", value: "Any" },
  { label: "Color", value: "Both" },
  { label: "Date", value: "Last 90d" },
  { label: "Opp rating", value: "Any" },
  { label: "Opening", value: "Any" },
  { label: "Rated", value: "Rated" },
];

function GamesPage() {
  const rows = [...SAMPLE_GAMES, ...SAMPLE_GAMES.map((g) => ({ ...g, id: g.id + "x" }))];
  return (
    <AppShell section="Games">
      <section className="panel p-4 sm:p-5">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Filters
          </span>
          <span className="text-[10px] font-mono text-muted-foreground ml-auto">
            {rows.length} games
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md panel-elevated text-xs hover:border-primary/40 transition-colors"
            >
              <span className="text-muted-foreground">{f.label}:</span>
              <span className="text-foreground font-mono">{f.value}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-5">
        <div className="panel p-5">
          <RecentGamesTable rows={rows} showTitle={false} dense />
        </div>
        <aside className="panel p-5 h-fit space-y-4 xl:sticky xl:top-20">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Selected game
            </div>
            <div className="mt-1 text-sm font-semibold tracking-tight">
              vs grandpawn_42
            </div>
            <div className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Rapid 10+0 · Sicilian Najdorf · B90
            </div>
          </div>
          <MiniBoard />
          <div className="grid grid-cols-3 gap-2 text-center">
            <Pill label="Result" value="WIN" tone="primary" />
            <Pill label="Δ" value="+18" tone="primary" />
            <Pill label="Acc" value="91.2%" />
          </div>
          <div className="flex flex-col gap-2">
            <button className="h-9 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors">
              Open game review
            </button>
            <button className="h-9 rounded-md panel-elevated text-xs hover:border-primary/40 transition-colors">
              Download PGN
            </button>
            <button className="h-9 rounded-md panel-elevated text-xs hover:border-primary/40 transition-colors">
              Open on Chess.com
            </button>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "primary";
}) {
  return (
    <div className="panel-elevated py-2">
      <div className="text-[9px] font-mono uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-0.5 font-mono text-sm font-semibold ${tone === "primary" ? "text-primary" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

function MiniBoard() {
  // 8x8 board preview, alternating squares
  return (
    <div className="grid grid-cols-8 aspect-square rounded-md overflow-hidden border border-border">
      {Array.from({ length: 64 }, (_, i) => {
        const r = Math.floor(i / 8);
        const c = i % 8;
        const dark = (r + c) % 2 === 1;
        return (
          <div
            key={i}
            className={dark ? "bg-panel-elevated" : "bg-muted"}
          />
        );
      })}
    </div>
  );
}
