import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StreaksRecords } from "@/components/StreaksRecords";

export const Route = createFileRoute("/streaks")({
  head: () => ({ meta: [{ title: "Streaks — Chesslab" }] }),
  component: () => (
    <AppShell section="Streaks">
      <StreaksRecords title="Active streaks & milestones" />
    </AppShell>
  ),
});
