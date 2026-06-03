import { useEffect, useState } from "react";
import { RefreshCw, Search, X, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useChessData } from "@/lib/chess/store";
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

  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = input.trim();
    if (!val) return;
    await importProfile(val);
    toast.success(`Imported ${val}`);
    setInput("");
  };

  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-5 sticky top-0 bg-background/85 backdrop-blur z-10 gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex h-7 w-7 rounded-md bg-primary/15 items-center justify-center">
          <span className="font-mono text-primary text-sm font-bold">♞</span>
        </div>
        <div className="hidden md:block text-sm font-semibold tracking-tight">
          Chesslab
        </div>
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
          className={cn(
            "hidden sm:flex items-center gap-2 rounded-md border bg-panel-elevated px-2.5 h-8 w-[280px] transition-colors",
            error ? "border-negative/50" : "border-border focus-within:border-primary/40",
          )}
        >
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
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
              title="Clear imported profile"
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-3 w-3" />
            </button>
          )}
          <kbd className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1">
            ⏎
          </kbd>
        </form>

        <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {error ? (
            <>
              <AlertCircle className="h-3 w-3 text-negative" />
              <span className="text-negative">import error</span>
            </>
          ) : isMock ? (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              demo data
            </>
          ) : (
            <>
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              synced {formatAgo(fetchedAt)}
              <span className="sr-only">{tick}</span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            if (username) {
              void refresh();
              toast.message(`Refreshing ${username}…`);
            } else {
              toast.message("Enter a Chess.com username first");
            }
          }}
          disabled={isLoading}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-elevated px-3 h-8 text-xs font-mono hover:border-primary/40 hover:text-primary transition-colors disabled:opacity-60"
        >
          <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
          {isLoading ? "Syncing…" : "Sync"}
        </button>
      </div>
    </div>
  );
}
