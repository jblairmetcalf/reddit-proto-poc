"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/user-research", label: "Overview", icon: "📊" },
  { href: "/user-research/participants", label: "Participants", icon: "👥" },
  { href: "/user-research/studies", label: "Studies", icon: "🧪" },
  { href: "/user-research/dashboard", label: "Live Dashboard", icon: "📡" },
  { href: "/user-research/synthetic-users", label: "Synthetic Users", icon: "🤖", badge: "WIP" },
];

export default function UxrLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="sticky top-0 h-screen w-56 flex-shrink-0 overflow-y-auto border-r border-edge bg-card">
        <div className="flex items-center gap-3 border-b border-edge px-5 py-4">
          <Link
            href="/"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            &larr;
          </Link>
          <h1 className="text-base font-bold text-foreground">User Research</h1>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/user-research"
                ? pathname === "/user-research"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-600/10 text-orange-400"
                    : "text-secondary hover:bg-input hover:text-foreground"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
                {"badge" in item && item.badge && (
                  <span className="ml-auto rounded-full bg-amber-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase text-amber-400">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
