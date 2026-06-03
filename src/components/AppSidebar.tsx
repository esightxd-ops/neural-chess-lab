import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Swords,
  TrendingUp,
  BookOpen,
  Timer,
  Users,
  Flame,
  Trophy,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/games", label: "Games", icon: Swords },
  { to: "/ratings", label: "Ratings", icon: TrendingUp },
  { to: "/openings", label: "Openings", icon: BookOpen },
  { to: "/time-controls", label: "Time Controls", icon: Timer },
  { to: "/opponents", label: "Opponents", icon: Users },
  { to: "/streaks", label: "Streaks", icon: Flame },
  { to: "/records", label: "Records", icon: Trophy },
  { to: "/settings", label: "Settings", icon: Settings },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside className="hidden md:flex w-[72px] shrink-0 flex-col border-r border-border bg-panel sticky top-0 h-screen z-20">
      <div className="h-14 flex items-center justify-center border-b border-border">
        <div className="h-9 w-9 rounded-md bg-primary/15 grid place-items-center glow-primary">
          <span className="font-mono text-primary text-base font-bold">♞</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col items-center gap-1 py-3">
        {nav.map((item) => {
          const active =
            item.to === "/"
              ? pathname === "/"
              : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative h-10 w-10 grid place-items-center rounded-md transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] bg-primary rounded-r" />
              )}
              <Icon className="h-[18px] w-[18px]" />
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded bg-panel-elevated border border-border px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity z-50">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-3 flex flex-col items-center gap-1.5">
        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-accent-blue/20 grid place-items-center text-xs font-semibold">
          MK
        </div>
        <div className="text-[10px] font-mono text-muted-foreground">1842</div>
      </div>
    </aside>
  );
}
