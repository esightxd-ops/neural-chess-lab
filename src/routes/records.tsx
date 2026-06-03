import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";
import { StreaksRecords } from "@/components/StreaksRecords";

export const Route = createFileRoute("/records")({
  head: () => ({ meta: [{ title: "Records — Chesslab" }] }),
  component: () => (
    <AppShell section="Records">
      <StreaksRecords title="Trophy room" />
    </AppShell>
  ),
});
