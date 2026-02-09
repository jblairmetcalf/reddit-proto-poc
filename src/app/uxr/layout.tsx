"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/uxr", label: "Overview", icon: "📊" },
  { href: "/uxr/dashboard", label: "Live Dashboard", icon: "📡" },
  { href: "/uxr/studies", label: "Studies", icon: "🧪" },
  { href: "/uxr/participants", label: "Participants", icon: "👥" },
  { href: "/uxr/synthetic-users", label: "Synthetic Users", icon: "🤖" },
  { href: "/uxr/variants", label: "Variants", icon: "🔀" },
];

export default function UxrLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-56 flex-shrink-0 border-r border-zinc-800 bg-zinc-900">
        <div className="flex items-center gap-3 border-b border-zinc-800 px-5 py-4">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            &larr;
          </Link>
          <h1 className="text-base font-bold text-white">UXR</h1>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.href === "/uxr"
                ? pathname === "/uxr"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-orange-600/10 text-orange-400"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-white"
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
