import type { ReactNode } from "react";
import { AppSidebar } from "./AppSidebar";
import { TopBar } from "./TopBar";

interface Props {
  section: string;
  crumb?: string;
  children: ReactNode;
}

export function AppShell({ section, crumb, children }: Props) {
  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 min-w-0">
        <TopBar section={section} crumb={crumb} />
        <div className="p-4 sm:p-5 space-y-5 max-w-[1600px]">{children}</div>
      </main>
    </div>
  );
}
