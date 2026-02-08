import Link from "next/link";

export default function UxrPage() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <header className="flex items-center gap-4 border-b border-zinc-800 px-6 py-4">
        <Link
          href="/"
          className="text-sm text-zinc-400 hover:text-white transition-colors"
        >
          &larr; Dashboard
        </Link>
        <h1 className="text-lg font-bold text-white">UXR Dashboard</h1>
      </header>
      <main className="p-6">
        <p className="text-zinc-400">
          User experience research dashboard content goes here.
        </p>
      </main>
    </div>
  );
}
