import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Chesslab" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AppShell section="Settings">
      <section className="panel p-5 max-w-2xl space-y-5">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">Connected accounts</h2>
          <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
            Sync games and ratings from your chess platforms.
          </p>
        </div>
        {[
          { name: "Chess.com", handle: "magnus_k", status: "Connected" },
          { name: "Lichess", handle: "—", status: "Connect" },
        ].map((a) => (
          <div key={a.name} className="flex items-center justify-between panel-elevated px-4 py-3">
            <div>
              <div className="text-sm font-semibold">{a.name}</div>
              <div className="text-[11px] font-mono text-muted-foreground">{a.handle}</div>
            </div>
            <button
              className={`h-8 px-3 rounded-md text-xs font-mono ${a.status === "Connected" ? "bg-primary/15 text-primary border border-primary/30" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {a.status}
            </button>
          </div>
        ))}

        <div className="border-t border-border pt-5">
          <h2 className="text-sm font-semibold tracking-tight">Preferences</h2>
          <div className="mt-3 space-y-3">
            {[
              { label: "Email weekly summary", on: true },
              { label: "Notify on new record", on: true },
              { label: "Auto-import new games", on: false },
            ].map((p) => (
              <div
                key={p.label}
                className="flex items-center justify-between panel-elevated px-4 py-3"
              >
                <span className="text-sm">{p.label}</span>
                <div
                  className={`relative h-5 w-9 rounded-full transition-colors ${p.on ? "bg-primary" : "bg-muted"}`}
                >
                  <span
                    className={`absolute top-0.5 ${p.on ? "left-[18px]" : "left-0.5"} h-4 w-4 rounded-full bg-background transition-all`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </AppShell>
  );
}
