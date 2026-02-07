"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  GitBranch,
  BarChart3,
  TrendingUp,
  LogOut,
  Wallet,
  PanelLeftClose,
  PanelLeftOpen,
  Sun,
  Moon,
  CalendarDays,
  Landmark,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

const navItems = [
  { href: "/dashboard", label: "Budget Flow", icon: LayoutDashboard },
  { href: "/history", label: "History", icon: CalendarDays },
  { href: "/strategy", label: "Strategy", icon: GitBranch },
  { href: "/debt-payoff", label: "Debt Payoff", icon: Landmark },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
  { href: "/investments", label: "Savings", icon: TrendingUp },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  accountID: string;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme, mounted } = useTheme();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch("/api/user");
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch user:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchUser();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Get user initials from name
  const getUserInitials = (name: string): string => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-bg-secondary border-r border-border-main flex flex-col z-50 transition-all duration-300 ${collapsed ? "w-16" : "w-64"
        }`}
    >
      {/* Logo */}
      <div className="p-4 border-b border-border-main flex items-center justify-between">
        <Link href="/" className={`flex items-center gap-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center flex-shrink-0">
            <Wallet className="w-5 h-5 text-accent-green" />
          </div>
          {!collapsed && (
            <div>
              <h1 className="text-lg font-bold text-text-primary">BudgetFlow</h1>
              <p className="text-xs text-text-secondary">Smart Budgeting</p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={onToggle}
            className="text-text-secondary hover:text-text-primary transition-colors p-1"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="p-2 flex justify-center">
          <button
            onClick={onToggle}
            className="text-text-secondary hover:text-text-primary transition-colors p-2 rounded-lg hover:bg-bg-card"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 ${collapsed ? "justify-center" : ""
                } ${isActive
                  ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
                }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Theme toggle */}
      {mounted && (
        <div className={`p-2 ${collapsed ? "flex justify-center" : "px-3"}`}>
          <button
            onClick={toggleTheme}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-bg-card transition-all duration-200 ${collapsed ? "justify-center" : "w-full"}`}
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 flex-shrink-0" />
            )}
            {!collapsed && <span className="font-medium">{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>}
          </button>
        </div>
      )}

      {/* User section */}
      <div className="p-2 border-t border-border-main">
        <div className={`flex items-center gap-3 px-3 py-3 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-bold text-accent-blue">
              {loading ? "..." : (user ? getUserInitials(user.name) : "?")}
            </span>
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary truncate">
                  {loading ? "Loading..." : (user?.name || "Guest")}
                </p>
                <p className="text-xs text-text-secondary">Free Plan</p>
              </div>
              <button
                onClick={handleLogout}
                title="Logout"
                className="text-text-secondary hover:text-accent-red transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
