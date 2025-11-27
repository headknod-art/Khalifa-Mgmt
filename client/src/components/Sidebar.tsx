import { Link } from "wouter";
import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Settings,
  BarChart3,
  Ticket,
} from "lucide-react";
import { APP_LOGO, APP_TITLE } from "@/const";
// Sidebar is now always open and static

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/", icon: <LayoutDashboard className="w-5 h-5" /> },
  { label: "Client Management", href: "/clients", icon: <Users className="w-5 h-5" /> },
  { label: "Asset Management", href: "/assets", icon: <TrendingUp className="w-5 h-5" /> },
  { label: "Services", href: "/services", icon: <Ticket className="w-5 h-5" /> },
  { label: "Reports", href: "/reports", icon: <BarChart3 className="w-5 h-5" /> },
  { label: "Documents", href: "/documents", icon: <FileText className="w-5 h-5" /> },
  { label: "Settings", href: "/settings", icon: <Settings className="w-5 h-5" /> },
];


export default function Sidebar() {
  return (
    <aside
      className="fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border z-40 shadow-xl"
    >
      {/* Logo Section */}
      <div className="flex items-center h-20 px-6 border-b border-sidebar-border bg-white/80 backdrop-blur-md">
        <Link href="/">
          <a className="flex items-center gap-3 hover:opacity-90 transition-opacity">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10 rounded shadow-sm" />
            <span className="font-extrabold text-xl tracking-wide text-sidebar-primary font-display">{APP_TITLE}</span>
          </a>
        </Link>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = window.location.pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex items-center gap-4 px-4 py-3 rounded-xl font-medium transition-all duration-150 group
                  ${isActive ? "bg-sidebar-accent/90 text-sidebar-accent-foreground shadow-md" : "hover:bg-sidebar-accent/10 hover:text-sidebar-accent"}
                `}
                style={{ letterSpacing: ".01em" }}
              >
                <span className={`flex-shrink-0 transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-105"}`}>{item.icon}</span>
                <span className="text-base font-medium font-display tracking-wide">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
