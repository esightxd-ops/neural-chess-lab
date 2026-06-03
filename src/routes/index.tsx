import { createFileRoute } from "@tanstack/react-router";
import { AppSidebar } from "@/components/AppSidebar";
import { PlayerHeader } from "@/components/PlayerHeader";
import { SkillRadarCard } from "@/components/SkillRadarCard";
import { PerformanceRatingsCard } from "@/components/PerformanceRatingsCard";
import { LastMatchCard } from "@/components/LastMatchCard";
import { WeaknessCard } from "@/components/WeaknessCard";
import { RatingTrendCard } from "@/components/RatingTrendCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — Chess Performance Lab" },
      {
        name: "description",
        content:
          "Analytical chess performance lab. Track skill ratings, detect weaknesses, and review every move with precision.",
      },
      { property: "og:title", content: "Chess Performance Lab" },
      {
        property: "og:description",
        content: "Your chess, measured scientifically.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 min-w-0">
        <div className="h-14 border-b border-border flex items-center justify-between px-5 sticky top-0 bg-background/80 backdrop-blur z-10">
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              Dashboard
            </span>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-mono text-foreground">Overview</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Live analysis
            </div>
            <button className="rounded-md border border-border bg-panel-elevated px-3 py-1.5 text-xs font-mono hover:border-primary/40 transition-colors">
              Import games
            </button>
          </div>
        </div>

        <div className="p-5 space-y-5 max-w-[1600px]">
          <PlayerHeader />

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2 space-y-5">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                <div className="lg:col-span-3">
                  <SkillRadarCard />
                </div>
                <div className="lg:col-span-2">
                  <RatingTrendCard />
                </div>
              </div>
              <LastMatchCard />
            </div>
            <div className="space-y-5">
              <PerformanceRatingsCard />
              <WeaknessCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
