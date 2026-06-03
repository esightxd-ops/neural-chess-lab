import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { ProfileHero } from "@/components/ProfileHero";
import { StatTileRow } from "@/components/StatTileRow";
import { RatingProgression } from "@/components/RatingProgression";
import { TimeControlGrid } from "@/components/TimeControlGrid";
import { RecentGamesTable } from "@/components/RecentGamesTable";
import { OpeningTable } from "@/components/OpeningTable";
import { ColorPerformance } from "@/components/ColorPerformance";
import { StreaksRecords } from "@/components/StreaksRecords";
import { useChessData } from "@/lib/chess/store-context";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — Chesslab" },
      {
        name: "description",
        content:
          "Your competitive chess profile. Ratings, time controls, openings, opponents, streaks, and records.",
      },
      { property: "og:title", content: "Chesslab — Competitive chess profile" },
      {
        property: "og:description",
        content: "Track ratings, win rate, openings, and records like a pro.",
      },
    ],
  }),
  component: Overview,
});

function Overview() {
  const { analytics } = useChessData();
  return (
    <AppShell section="Overview" showHeading={false}>
      <ProfileHero />
      <StatTileRow />
      <RatingProgression />
      <TimeControlGrid />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2">
          <RecentGamesTable
            rows={analytics.games}
            profileUsername={analytics.profile.username}
          />
        </div>
        <OpeningTable />
      </div>
      <ColorPerformance />
      <StreaksRecords compact />
    </AppShell>
  );
}
