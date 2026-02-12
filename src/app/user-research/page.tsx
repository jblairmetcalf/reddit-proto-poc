"use client";

import Link from "next/link";

const cards = [
  {
    href: "/user-research/participants",
    title: "Participants",
    icon: "👥",
    description: "Invite participants, generate token links, and track completion",
    badge: "Invite",
    badgeColor: "bg-blue-500/20 text-blue-400",
  },
  {
    href: "/user-research/studies",
    title: "Studies",
    icon: "🧪",
    description: "Create and manage UX research studies with prototype variants",
    badge: "Manage",
    badgeColor: "bg-orange-500/20 text-orange-400",
  },
  {
    href: "/user-research/live-dashboard",
    title: "Live Dashboard",
    icon: "📡",
    description: "Real-time event stream and session metrics from prototype interactions",
    badge: "Live",
    badgeColor: "bg-green-500/20 text-green-400",
  },
  {
    href: "/user-research/synthetic-users",
    title: "Synthetic Users",
    icon: "🤖",
    description: "Create and manage synthetic user personas like new, casual, core, commenter, and poster",
    badge: "WIP",
    badgeColor: "bg-amber-500/20 text-amber-400",
  },
];

export default function UxrOverview() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">User Research</h1>
        <p className="mt-1 text-sm text-secondary">
          User experience research tools for the Reddit Proto platform
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-edge bg-card p-5 transition-colors hover:border-orange-600"
          >
            <div className="mb-3">
              <span className="text-2xl">{card.icon}</span>
            </div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground group-hover:text-orange-400">
                {card.title}
              </h2>
              <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
