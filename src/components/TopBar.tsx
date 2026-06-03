import { Search, RefreshCw } from "lucide-react";

interface Props {
  section: string;
  crumb?: string;
}

export function TopBar({ section, crumb }: Props) {
  return (
    <div className="h-14 border-b border-border flex items-center justify-between px-4 sm:px-5 sticky top-0 bg-background/85 backdrop-blur z-10">
      <div className="flex items-center gap-3 min-w-0">
        <div className="hidden md:flex h-7 w-7 rounded-md bg-primary/15 items-center justify-center">
          <span className="font-mono text-primary text-sm font-bold">♞</span>
        </div>
        <div className="hidden md:block text-sm font-semibold tracking-tight">
          Chesslab
        </div>
        <span className="hidden md:inline text-muted-foreground/40">/</span>
        <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {section}
        </span>
        {crumb && (
          <>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-mono text-foreground truncate">
              {crumb}
            </span>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-2 rounded-md border border-border bg-panel-elevated px-2.5 h-8 w-[260px]">
          <Search className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            placeholder="Search username…"
            className="bg-transparent text-xs outline-none flex-1 placeholder:text-muted-foreground"
          />
          <kbd className="font-mono text-[10px] text-muted-foreground border border-border rounded px-1">
            ⌘K
          </kbd>
        </div>
        <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Synced 2m ago
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-elevated px-3 h-8 text-xs font-mono hover:border-primary/40 hover:text-primary transition-colors">
          <RefreshCw className="h-3 w-3" />
          Import / Sync
        </button>
      </div>
    </div>
  );
}
