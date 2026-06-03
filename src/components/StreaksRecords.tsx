import { Flame, Trophy, TrendingUp, Clock, Zap, ShieldCheck, CalendarHeart, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useChessData } from "@/lib/chess/store-context";

const KIND_ICON: Record<string, LucideIcon> = {
  streak: Flame,
  rating: TrendingUp,
  activity: Zap,
  game: Clock,
};

const KIND_ACCENT: Record<string, string> = {
  streak: "text-primary bg-primary/10 border-primary/30",
  rating: "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  activity: "text-gold bg-gold/10 border-gold/30",
  game: "text-muted-foreground bg-muted border-border",
};

interface Props {
  title?: string;
  compact?: boolean;
}

export function StreaksRecords({ title = "Streaks & Records", compact = false }: Props) {
  const { analytics } = useChessData();
  const items = compact ? analytics.records.slice(0, 6) : analytics.records;

  if (!items.length) {
    return (
      <section className="panel p-5 text-xs font-mono text-muted-foreground text-center py-10">
        No records yet — import a profile to populate the trophy room.
      </section>
    );
  }

  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          trophy room
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((r, i) => {
          const Icon = KIND_ICON[r.kind] ?? Star;
          const isPB =
            r.label.toLowerCase().includes("longest") || r.label.toLowerCase().includes("highest");
          return (
            <div
              key={`${r.label}-${i}`}
              className="panel-elevated p-4 relative overflow-hidden group hover:border-primary/40 transition-colors"
            >
              <div
                className={cn(
                  "absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity",
                  r.kind === "streak" && "bg-primary",
                  r.kind === "rating" && "bg-accent-blue",
                  r.kind === "activity" && "bg-gold",
                )}
              />
              <div
                className={cn(
                  "h-8 w-8 rounded-md border grid place-items-center relative",
                  KIND_ACCENT[r.kind] ?? "text-muted-foreground bg-muted border-border",
                )}
              >
                {isPB ? <Trophy className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {r.label}
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular text-foreground">
                {r.value}
              </div>
              {r.sub && (
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5 truncate">
                  {r.sub}
                </div>
              )}
            </div>
          );
        })}
        {compact && (
          <div className="panel-elevated p-4 flex items-center justify-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground hover:text-primary cursor-default">
            <CalendarHeart className="h-3 w-3 mr-1" /> + {analytics.records.length - items.length} more
          </div>
        )}
      </div>
    </section>
  );
}

// Re-export for legacy import paths
export { ShieldCheck };
