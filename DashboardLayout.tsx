import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 overflow-auto ml-64 transition-all duration-300">
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-card/30">
          {children}
        </div>
      </main>
    </div>
  );
}
