import Link from "next/link";
import Image from "next/image";

const routes = [
  {
    href: "/prototype",
    title: "Default Prototype",
    description: "Open the default Reddit prototype",
    external: true,
  },
  {
    href: "/prototypes",
    title: "Prototypes",
    description: "Review all prototype variants and preview them",
  },
  {
    href: "/prototypers",
    title: "Prototypers",
    description: "Manage prototypers and their prototype portfolios",
  },
  {
    href: "/user-research",
    title: "User Research",
    description: "User experience research dashboard",
  },
  {
    href: "/tools",
    title: "Tools",
    description: "Feed builder, playground, data queries, and API explorer",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-10 flex items-center gap-4">
        <Image
          src="/reddit-logo.png"
          alt="Reddit"
          width={48}
          height={48}
          className="rounded-full"
        />
        <div>
          <h1 className="text-3xl font-bold text-white">Reddit Proto</h1>
          <p className="mt-1 text-zinc-400">Dashboard</p>
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
            className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-orange-600"
          >
            <h2 className="text-lg font-semibold text-white group-hover:text-orange-400">
              {route.title}
            </h2>
            <p className="mt-2 text-sm text-zinc-400">{route.description}</p>
          </Link>
        ))}
        <a
          href="https://reddit-proto-poc-storybook.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="group rounded-xl border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-orange-600"
        >
          <h2 className="text-lg font-semibold text-white group-hover:text-orange-400">
            Design System
          </h2>
          <p className="mt-2 text-sm text-zinc-400">Component library and design system documentation</p>
        </a>
      </div>
    </div>
  );
}
