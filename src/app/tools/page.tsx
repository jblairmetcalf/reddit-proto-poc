import Link from "next/link";

const tools = [
  {
    href: "/tools/apis",
    title: "APIs",
    description: "Explore and test all available API endpoints",
  },
  {
    href: "/tools/feed-builder",
    title: "Feed Builder",
    description: "Compose and configure custom feed layouts with live preview",
  },
  {
    href: "/tools/feed-playground",
    title: "Feed Playground",
    description: "Experiment with sorting, filtering, and density options in real time",
  },
  {
    href: "/tools/data-query",
    title: "Data Query",
    description: "Run queries against Reddit data and inspect raw API responses",
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-6">
        <Link
          href="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-orange-400"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Tools</h1>
        <p className="mt-1 text-sm text-secondary">
          Feed builder, playground, data queries, and API explorer
        </p>
      </header>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="group rounded-xl border border-edge bg-card p-6 transition-colors hover:border-orange-600"
          >
            <h2 className="text-lg font-semibold text-foreground group-hover:text-orange-400">
              {tool.title}
            </h2>
            <p className="mt-2 text-sm text-secondary">{tool.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
