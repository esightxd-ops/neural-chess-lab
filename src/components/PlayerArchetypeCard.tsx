import { Swords, Crosshair, Wind } from "lucide-react";

export function PlayerArchetypeCard() {
  return (
    <section className="panel p-5 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent-cyan/5 pointer-events-none" />
      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Player Archetype
          </span>
          <span className="text-[10px] font-mono uppercase tracking-widest text-primary">
            7.2% of players
          </span>
        </div>

        <div className="mt-3 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl border border-primary/40 bg-primary/10 grid place-items-center glow-primary">
            <Swords className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight leading-none">
              Dynamic Attacker
            </h2>
            <p className="text-xs text-muted-foreground mt-1.5 font-mono">
              Initiative-driven · sharp calculator
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-md border border-primary/25 bg-primary/5 p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-primary flex items-center gap-1">
              <Crosshair className="h-3 w-3" /> Strengths
            </div>
            <ul className="mt-2 space-y-1 text-xs">
              <li className="flex justify-between">
                <span>Initiative</span>
                <span className="font-mono text-primary">+22</span>
              </li>
              <li className="flex justify-between">
                <span>Tactical conv.</span>
                <span className="font-mono text-primary">+42</span>
              </li>
              <li className="flex justify-between">
                <span>Sharp play</span>
                <span className="font-mono text-primary">+18</span>
              </li>
            </ul>
          </div>
          <div className="rounded-md border border-negative/25 bg-negative/5 p-3">
            <div className="text-[10px] font-mono uppercase tracking-widest text-negative flex items-center gap-1">
              <Wind className="h-3 w-3" /> Weaknesses
            </div>
            <ul className="mt-2 space-y-1 text-xs">
              <li className="flex justify-between">
                <span>Simplification</span>
                <span className="font-mono text-negative">−31</span>
              </li>
              <li className="flex justify-between">
                <span>Endgame precision</span>
                <span className="font-mono text-negative">−74</span>
              </li>
              <li className="flex justify-between">
                <span>Time mgmt</span>
                <span className="font-mono text-negative">−18</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-border bg-panel-elevated p-3">
          <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Closest archetype
          </div>
          <div className="mt-1 flex items-baseline justify-between">
            <span className="text-sm font-medium">Tal-style attacker</span>
            <span className="font-mono text-xs text-primary">84% match</span>
          </div>
        </div>
      </div>
    </section>
  );
}
