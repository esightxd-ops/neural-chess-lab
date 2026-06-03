import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { OpeningTable } from "@/components/OpeningTable";
import { Search } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/openings")({
  head: () => ({ meta: [{ title: "Openings — Chesslab" }] }),
  component: OpeningsPage,
});

const FAMILIES = [
  "All",
  "Sicilian",
  "Caro-Kann",
  "Ruy Lopez",
  "Italian",
  "Queens Gambit",
  "Kings Indian",
  "London",
];
const COLORS = ["Both", "White", "Black"] as const;
const MODES = ["All", "Bullet", "Blitz", "Rapid", "Daily"] as const;

function OpeningsPage() {
  const [color, setColor] = useState<(typeof COLORS)[number]>("Both");
  const [mode, setMode] = useState<(typeof MODES)[number]>("All");
  const [family, setFamily] = useState("All");

  return (
    <AppShell section="Openings">
      <section className="panel p-5 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 panel-elevated px-2.5 h-9 flex-1 min-w-[220px]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input
              placeholder="Search opening or ECO…"
              className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground"
            />
          </div>
          <Group items={[...COLORS]} value={color} onChange={(v) => setColor(v as typeof color)} />
          <Group items={[...MODES]} value={mode} onChange={(v) => setMode(v as typeof mode)} />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {FAMILIES.map((f) => (
            <button
              key={f}
              onClick={() => setFamily(f)}
              className={cn(
                "h-7 px-2.5 rounded-md text-[11px] font-mono uppercase tracking-widest transition-colors",
                family === f
                  ? "bg-primary/15 text-primary"
                  : "panel-elevated text-muted-foreground hover:text-foreground",
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </section>

      <OpeningTable />
    </AppShell>
  );
}

function Group<T extends string>({
  items,
  value,
  onChange,
}: {
  items: T[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-0.5 panel-elevated p-0.5">
      {items.map((i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className={cn(
            "h-7 px-2.5 rounded text-[11px] font-mono uppercase tracking-widest transition-colors",
            value === i
              ? "bg-primary/15 text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {i}
        </button>
      ))}
    </div>
  );
}
