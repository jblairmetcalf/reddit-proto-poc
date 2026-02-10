"use client";

import Link from "next/link";

const cards = [
  {
    href: "/user-research/dashboard",
    title: "Live Dashboard",
    icon: "📡",
    description: "Real-time event stream and session metrics from prototype interactions",
    stat: "Live",
    statColor: "text-green-400",
  },
  {
    href: "/user-research/studies",
    title: "Studies",
    icon: "🧪",
    description: "Create and manage UX research studies with prototype variants",
    stat: "Manage",
    statColor: "text-orange-400",
  },
  {
    href: "/user-research/participants",
    title: "Participants",
    icon: "👥",
    description: "Invite participants, generate token links, and track completion",
    stat: "Invite",
    statColor: "text-blue-400",
  },
  {
    href: "/user-research/synthetic-users",
    title: "Synthetic Users",
    icon: "🤖",
    description: "Create and manage synthetic user personas like new, casual, core, commenter, and poster",
    stat: "Personas",
    statColor: "text-teal-400",
  },
];

export default function UxrOverview() {
  return (
    <div className="p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white">User Research</h1>
        <p className="mt-1 text-sm text-zinc-400">
          User experience research tools for the Reddit Proto platform
        </p>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-orange-600"
          >
            <div className="mb-3 flex items-center justify-between">
              <span className="text-2xl">{card.icon}</span>
              <span className={`text-xs font-semibold uppercase ${card.statColor}`}>
                {card.stat}
              </span>
            </div>
            <h2 className="text-base font-semibold text-white group-hover:text-orange-400">
              {card.title}
            </h2>
            <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
