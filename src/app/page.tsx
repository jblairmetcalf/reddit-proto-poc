import Link from "next/link";

const routes = [
  {
    href: "/prototypes",
    title: "Prototypes",
    description: "Review all prototype variants and preview them",
  },
  {
    href: "/uxr",
    title: "UXR Dashboard",
    description: "User experience research dashboard",
  },
  {
    href: "/apis",
    title: "APIs",
    description: "Explore and test all available API endpoints",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-white">Reddit Proto</h1>
        <p className="mt-1 text-zinc-400">Dashboard</p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
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
            Storybook
          </h2>
          <p className="mt-2 text-sm text-zinc-400">Component library and design system documentation</p>
        </a>
      </div>
    </div>
  );
}
