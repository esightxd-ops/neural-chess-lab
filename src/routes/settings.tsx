import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RefreshCw, Trash2, Database, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { useChessData } from "@/lib/chess/store-context";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Chesslab" }] }),
  component: SettingsPage,
});

function formatAgo(unix: number | null) {
  if (!unix) return "never";
  const diff = Math.floor(Date.now() / 1000 - unix);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function Row({ label, value, mono = true }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between panel-elevated px-4 py-3">
      <span className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
      <span className={cn("text-xs text-foreground", mono && "font-mono")}>{value}</span>
    </div>
  );
}

function SettingsPage() {
  const { username, isMock, isLoading, error, fetchedAt, analytics, refresh, clear } = useChessData();
  const [busy, setBusy] = useState(false);

  const onRefresh = async () => {
    if (!username) {
      toast.message("Import a Chess.com username first");
      return;
    }
    setBusy(true);
    const id = toast.loading(`Refreshing ${username}…`);
    const result = await refresh();
    toast.dismiss(id);
    if (result.ok) toast.success(`Synced ${result.username}`);
    else toast.error(result.error);
    setBusy(false);
  };

  const onClear = () => {
    clear();
    toast.success("Local data cleared");
  };

  const sourceLabel = isMock ? "Demo data" : username ? "Chess.com" : "None";
  const sourceTone = isMock
    ? "text-gold"
    : username
      ? "text-primary"
      : "text-muted-foreground";

  return (
    <AppShell section="Settings">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-5xl">
        <section className="panel p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Connected account</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Chess.com profile powering this dashboard.
            </p>
          </div>
          <Row
            label="Username"
            value={username ?? <span className="text-muted-foreground">not connected</span>}
          />
          <Row
            label="Data source"
            value={
              <span className={cn("inline-flex items-center gap-1.5", sourceTone)}>
                <Database className="h-3 w-3" />
                {sourceLabel}
              </span>
            }
          />
          <Row
            label="Status"
            value={
              error ? (
                <span className="inline-flex items-center gap-1.5 text-negative">
                  <AlertCircle className="h-3 w-3" /> error
                </span>
              ) : isLoading ? (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <RefreshCw className="h-3 w-3 animate-spin" /> syncing
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-primary">
                  <CheckCircle2 className="h-3 w-3" /> ready
                </span>
              )
            }
          />
          <Row label="Last sync" value={formatAgo(fetchedAt)} />
          {error && (
            <div className="text-[11px] font-mono text-negative px-1">{error}</div>
          )}
        </section>

        <section className="panel p-5 space-y-3">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Import limits</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Server caps to keep imports fast and Chess.com-friendly.
            </p>
          </div>
          <Row label="Archive window" value="latest 6 months" />
          <Row label="Max games" value="400" />
          <Row label="Server cache" value="5 min TTL" />
          <Row label="Snapshot cache" value="30 min TTL" />
          <Row
            label="Games loaded"
            value={analytics.games.length ? `${analytics.games.length.toLocaleString()}` : "—"}
          />
          {analytics.meta && (
            <Row
              label="Import meta"
              value={
                <span className="text-muted-foreground">
                  {analytics.meta.importedArchiveMonths}mo
                  {analytics.meta.failedArchiveMonths > 0 && `, ${analytics.meta.failedArchiveMonths} failed`}
                  {analytics.meta.skippedInvalidGames > 0 && `, ${analytics.meta.skippedInvalidGames} skipped`}
                </span>
              }
            />
          )}
        </section>

        <section className="panel p-5 space-y-3 lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold tracking-tight">Data controls</h2>
            <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
              Refresh from Chess.com or wipe locally-stored snapshot.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onRefresh}
              disabled={busy || isLoading || !username}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-elevated px-3 h-9 text-xs font-mono",
                "hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-60",
              )}
            >
              <RefreshCw className={cn("h-3 w-3", (busy || isLoading) && "animate-spin")} />
              Sync now
            </button>
            <button
              type="button"
              onClick={onClear}
              disabled={!username && !fetchedAt}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-elevated px-3 h-9 text-xs font-mono",
                "hover:border-negative/40 hover:text-negative transition-colors disabled:opacity-60",
              )}
            >
              <Trash2 className="h-3 w-3" />
              Clear local data
            </button>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground">
            Clearing wipes the locally-cached username and snapshot. The dashboard reverts to demo data
            until you import again.
          </p>
        </section>
      </div>
    </AppShell>
  );
}
