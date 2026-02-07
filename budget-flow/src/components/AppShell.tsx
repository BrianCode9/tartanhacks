"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main
        className={`min-h-screen transition-all duration-300 ${
          collapsed ? "ml-16" : "ml-64"
        }`}
      >
        {children}
      </main>
    </>
  );
}
