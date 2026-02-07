"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  GitBranch,
  BarChart3,
  LogOut,
  Wallet,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Budget Flow", icon: LayoutDashboard },
  { href: "/strategy", label: "Strategy", icon: GitBranch },
  { href: "/statistics", label: "Statistics", icon: BarChart3 },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-bg-secondary border-r border-border-main flex flex-col z-50">
      {/* Logo */}
      <div className="p-6 border-b border-border-main">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-green/20 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-accent-green" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary">BudgetFlow</h1>
            <p className="text-xs text-text-secondary">Smart Budgeting</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "bg-accent-green/10 text-accent-green border border-accent-green/20"
                  : "text-text-secondary hover:text-text-primary hover:bg-bg-card"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-border-main">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-full bg-accent-blue/20 flex items-center justify-center">
            <span className="text-sm font-bold text-accent-blue">B</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Demo User</p>
            <p className="text-xs text-text-secondary">Free Plan</p>
          </div>
          <button className="text-text-secondary hover:text-accent-red transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
