import {
  Flame,
  Trophy,
  TrendingUp,
  CalendarHeart,
  Clock,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface RecordItem {
  label: string;
  value: string;
  sub?: string;
  icon: LucideIcon;
  accent: "primary" | "blue" | "gold" | "negative";
}

const records: RecordItem[] = [
  { label: "Current win streak", value: "12", sub: "ongoing", icon: Flame, accent: "primary" },
  { label: "Longest win streak", value: "18", sub: "Apr 14, 2024", icon: Trophy, accent: "gold" },
  { label: "Longest unbeaten", value: "27", sub: "Mar – Apr 2024", icon: ShieldCheck, accent: "primary" },
  { label: "Highest rapid", value: "1864", sub: "May 22, 2024", icon: TrendingUp, accent: "primary" },
  { label: "Highest blitz", value: "1812", sub: "Feb 03, 2024", icon: TrendingUp, accent: "blue" },
  { label: "Highest bullet", value: "1634", sub: "Jan 18, 2024", icon: TrendingUp, accent: "blue" },
  { label: "Best day", value: "+68 elo", sub: "9W · 1L · Apr 14", icon: CalendarHeart, accent: "gold" },
  { label: "Most active day", value: "24 games", sub: "Mar 02, 2024", icon: Zap, accent: "blue" },
  { label: "Longest game", value: "146 moves", sub: "vs deepblue_jr", icon: Clock, accent: "default" as never },
  { label: "Shortest win", value: "11 moves", sub: "vs rookieboss", icon: Zap, accent: "primary" },
];

const accentMap: Partial<globalThis.Record<string, string>> = {
  primary: "text-primary bg-primary/10 border-primary/30",
  blue: "text-accent-blue bg-accent-blue/10 border-accent-blue/30",
  gold: "text-gold bg-gold/10 border-gold/30",
  negative: "text-negative bg-negative/10 border-negative/30",
};

interface Props {
  title?: string;
  compact?: boolean;
}

export function StreaksRecords({ title = "Streaks & Records", compact = false }: Props) {
  const items = compact ? records.slice(0, 6) : records;
  return (
    <section className="panel p-5">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          trophy room
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {items.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.label}
              className="panel-elevated p-4 relative overflow-hidden group cursor-pointer hover:border-primary/40 transition-colors"
            >
              <div
                className={cn(
                  "absolute -top-6 -right-6 h-20 w-20 rounded-full blur-2xl opacity-30 group-hover:opacity-50 transition-opacity",
                  r.accent === "primary" && "bg-primary",
                  r.accent === "blue" && "bg-accent-blue",
                  r.accent === "gold" && "bg-gold",
                )}
              />
              <div
                className={cn(
                  "h-8 w-8 rounded-md border grid place-items-center relative",
                  accentMap[r.accent] ?? "text-muted-foreground bg-muted border-border",
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="mt-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                {r.label}
              </div>
              <div className="mt-1 font-mono text-2xl font-semibold tabular text-foreground">
                {r.value}
              </div>
              {r.sub && (
                <div className="text-[10px] font-mono text-muted-foreground mt-0.5">
                  {r.sub}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
