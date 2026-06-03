import { useEffect, useState } from "react";
import { RefreshCw, Search, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useChessData } from "@/lib/chess/store-context";
import { cn } from "@/lib/utils";

interface Props {
  section: string;
  crumb?: string;
}

function formatAgo(unix: number | null) {
  if (!unix) return "—";
  const diff = Math.floor(Date.now() / 1000 - unix);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function TopBar({ section, crumb }: Props) {
  const { username, isMock, isLoading, error, fetchedAt, importProfile, refresh, clear } =
    useChessData();
  const [input, setInput] = useState("");
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  // Note: error toasts are surfaced from the submit/refresh handlers below to
  // avoid duplicate toasts. The visible `error` state still drives inline UI.

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    setInput("");
    const id = toast.loading(`Importing ${val}…`);
    const result = await importProfile(val);
    toast.dismiss(id);
    if (result.ok) toast.success(`Imported ${result.username}`);
    else toast.error(result.error);
  };

  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-5 sticky top-0 bg-background/85 backdrop-blur z-10 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex h-7 w-7 rounded-md bg-primary/15 items-center justify-center">
          <span className="font-mono text-primary text-sm font-bold">♞</span>
        </div>
        <div className="hidden md:block text-sm font-semibold tracking-tight">Chesslab</div>
        <span className="hidden md:inline text-muted-foreground/40">/</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground whitespace-nowrap">
          {section}
        </span>
        {crumb && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-mono text-foreground truncate">{crumb}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <form
          onSubmit={submit}
          role="search"
          aria-label="Import Chess.com profile"
          className={cn(
            "hidden sm:flex items-center gap-2 rounded-md border bg-panel-elevated px-2.5 h-9 w-[280px] transition-colors",
            "focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-1 focus-within:ring-offset-background",
            error ? "border-negative/50" : "border-border focus-within:border-primary/40",
          )}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
          <label htmlFor="chesslab-import" className="sr-only">
            Chess.com username
          </label>
          <input
            id="chesslab-import"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={username ? username : "chess.com username…"}
            disabled={isLoading}
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground min-w-0"
          />
          {username && !input && (
            <button
              type="button"
              onClick={clear}
              aria-label="Clear imported profile"
              className={cn(
                "text-muted-foreground hover:text-foreground rounded p-1 -m-1",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
              )}
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <kbd
            className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1"
            aria-hidden="true"
          >
            ⏎
          </kbd>
        </form>

        <div
          className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground"
          aria-live="polite"
        >
          {error ? (
            <>
              <AlertCircle className="h-3 w-3 text-negative" aria-hidden="true" />
              <span className="text-negative">import error</span>
            </>
          ) : isLoading && isMock ? (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                aria-hidden="true"
              />
              importing…
            </>
          ) : isMock ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
              demo data
            </>
          ) : (
            <>
              <span
                className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse"
                aria-hidden="true"
              />
              synced {formatAgo(fetchedAt)}
              <span className="sr-only">{tick}</span>
            </>
          )}
        </div>

        <button
          type="button"
          aria-label={
            isLoading
              ? "Syncing profile"
              : username
                ? `Sync ${username} from chess.com`
                : "Sync (enter a username first)"
          }
          onClick={async () => {
            if (!username) {
              toast.message("Enter a Chess.com username first");
              return;
            }
            const id = toast.loading(`Refreshing ${username}…`);
            const result = await refresh();
            toast.dismiss(id);
            if (result.ok) toast.success(`Synced ${result.username}`);
            else toast.error(result.error);
          }}
          disabled={isLoading}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-elevated px-3 h-9 text-xs font-mono hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-60",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-background",
          )}
        >
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} aria-hidden="true" />
          {isLoading ? "Syncing…" : "Sync"}
        </button>
      </div>
    </div>
  );
}
