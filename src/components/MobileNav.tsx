import { useState } from "react";
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
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const primary = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/games", label: "Games", icon: Swords },
  { to: "/ratings", label: "Ratings", icon: TrendingUp },
  { to: "/openings", label: "Openings", icon: BookOpen },
];

const more = [
  { to: "/time-controls", label: "Time Controls", icon: Timer },
  { to: "/opponents", label: "Opponents", icon: Users },
  { to: "/streaks", label: "Streaks", icon: Flame },
  { to: "/records", label: "Records", icon: Trophy },
  { to: "/settings", label: "Settings", icon: Settings },
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background";

function isActive(pathname: string, to: string) {
  return to === "/" ? pathname === "/" : pathname.startsWith(to);
}

export function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const moreActive = more.some((m) => isActive(pathname, m.to));

  return (
    <nav
      aria-label="Primary"
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border bg-background/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="grid grid-cols-5">
        {primary.map((item) => {
          const active = isActive(pathname, item.to);
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <Link
                to={item.to}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 min-h-14 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  focusRing,
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                aria-label="More navigation"
                className={cn(
                  "w-full flex flex-col items-center justify-center gap-0.5 min-h-14 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors",
                  moreActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                  focusRing,
                )}
              >
                <MoreHorizontal className="h-5 w-5" />
                <span>More</span>
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="pb-[calc(env(safe-area-inset-bottom)+1rem)]">
              <SheetHeader>
                <SheetTitle>More</SheetTitle>
              </SheetHeader>
              <ul className="mt-4 grid grid-cols-1 gap-1">
                {more.map((item) => {
                  const active = isActive(pathname, item.to);
                  const Icon = item.icon;
                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 h-12 px-3 rounded-md text-sm font-medium transition-colors",
                          active
                            ? "bg-primary/10 text-primary"
                            : "text-foreground hover:bg-secondary",
                          focusRing,
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </SheetContent>
          </Sheet>
        </li>
      </ul>
    </nav>
  );
}
