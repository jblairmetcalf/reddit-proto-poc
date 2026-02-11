import Link from "next/link";
import Image from "next/image";

const routes = [
  {
    href: "/prototype",
    emoji: "📱",
    title: "Coded Prototype Example",
    description: "Open the coded Reddit prototype",
    external: true,
  },
  {
    href: "/prototypes",
    emoji: "🧩",
    title: "Prototypes",
    description: "Review all prototype variants and preview them",
  },
  {
    href: "/prototypers",
    emoji: "👤",
    title: "Prototypers",
    description: "Manage prototypers and their prototype portfolios",
  },
  {
    href: "/user-research",
    emoji: "🔬",
    title: "User Research",
    description: "User experience research dashboard",
  },
  {
    href: "/tools",
    emoji: "🛠️",
    title: "Tools",
    description: "Feed builder, playground, data queries, and API explorer",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-10 flex items-center gap-4">
        <Image
          src="/reddit-logo.png"
          alt="Reddit"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reddit Proto</h1>
          <p className="mt-1 text-secondary">Dashboard</p>
        </div>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            {...("external" in route && route.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="group rounded-xl border border-edge bg-card p-6 transition-colors hover:border-orange-600"
          >
            <p className="text-2xl">{route.emoji}</p>
            <h2 className="mt-2 text-lg font-semibold text-foreground group-hover:text-orange-400">
              {route.title}
            </h2>
            <p className="mt-2 text-sm text-secondary">{route.description}</p>
          </Link>
        ))}
        <a
          href="https://reddit-proto-poc-storybook.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-edge bg-card p-6 transition-colors hover:border-orange-600"
        >
          <p className="text-2xl">🎨</p>
          <h2 className="mt-2 text-lg font-semibold text-foreground group-hover:text-orange-400">
            Design System
          </h2>
          <p className="mt-2 text-sm text-secondary">Component library and design system documentation</p>
        </a>
      </div>
    </div>
  );
}
