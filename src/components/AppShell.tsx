import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";
import { MobileNav } from "./MobileNav";

interface Props {
  section: string;
  crumb?: string;
  /** When false, no visible h1 is rendered (page provides its own, e.g. ProfileHero). */
  showHeading?: boolean;
  children: ReactNode;
}

export function AppShell({ section, crumb, showHeading = true, children }: Props) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 min-w-0 pb-20 md:pb-0">
        <TopBar section={section} crumb={crumb} />
        <div className="p-4 sm:p-5 space-y-5 max-w-[1600px]">
          {showHeading && (
            <h1 className="sr-only">
              {section}
              {crumb ? ` — ${crumb}` : ""}
            </h1>
          )}
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
