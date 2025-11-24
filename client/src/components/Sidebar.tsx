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
import { useState } from "react";

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
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 z-40 ${
        isOpen ? "w-64" : "w-20"
      }`}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-20 px-4 border-b border-sidebar-border">
        {isOpen && (
          <Link href="/">
            <a className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8 rounded" />
              <span className="font-bold text-lg text-sidebar-primary">{APP_TITLE}</span>
            </a>
          </Link>
        )}
        {!isOpen && (
          <img src={APP_LOGO} alt={APP_TITLE} className="w-8 h-8 rounded mx-auto" />
        )}
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                window.location.pathname === item.href
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/20"
              }`}
              title={!isOpen ? item.label : undefined}
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {isOpen && <span className="text-sm font-medium">{item.label}</span>}
            </a>
          </Link>
        ))}
      </nav>

      {/* Toggle Button */}
      <div className="border-t border-sidebar-border p-3">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent/20 transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg
            className={`w-5 h-5 transition-transform ${isOpen ? "rotate-0" : "rotate-180"}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
      </div>
    </aside>
  );
}
