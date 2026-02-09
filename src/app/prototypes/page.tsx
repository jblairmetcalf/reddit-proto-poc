"use client";

import Link from "next/link";
import { VARIANT_PRESETS, type VariantConfig } from "@/lib/variants";

const CONFIG_ROWS: {
  key: keyof VariantConfig;
  label: string;
  format?: (v: unknown) => string;
}[] = [
  { key: "defaultSort", label: "Default Sort" },
  { key: "feedDensity", label: "Feed Density" },
  {
    key: "showAwards",
    label: "Awards",
    format: (v) => (v ? "Visible" : "Hidden"),
  },
  {
    key: "showFlairs",
    label: "Flairs",
    format: (v) => (v ? "Visible" : "Hidden"),
  },
  {
    key: "showVoteCount",
    label: "Vote Counts",
    format: (v) => (v ? "Numeric" : "Hidden"),
  },
  { key: "commentSort", label: "Comment Sort" },
];

const VARIANT_COLORS: Record<string, string> = {
  default: "border-zinc-600",
  "variant-a": "border-blue-500",
  "variant-b": "border-green-500",
  "variant-c": "border-purple-500",
};

const VARIANT_BADGE_COLORS: Record<string, string> = {
  default: "bg-zinc-700 text-zinc-300",
  "variant-a": "bg-blue-500/20 text-blue-400",
  "variant-b": "bg-green-500/20 text-green-400",
  "variant-c": "bg-purple-500/20 text-purple-400",
};

export default function PrototypesPage() {
  const variants = Object.values(VARIANT_PRESETS);

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-white transition-colors"
          >
            &larr;
          </Link>
          <h1 className="text-2xl font-bold text-white">Prototypes</h1>
        </div>
        <p className="text-sm text-zinc-400">
          Review all prototype variants and click to preview them.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {variants.map((v) => (
          <div
            key={v.id}
            className={`rounded-xl border-2 bg-zinc-900 p-5 flex flex-col ${VARIANT_COLORS[v.id] || VARIANT_COLORS.default}`}
          >
            <div className="mb-4 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${VARIANT_BADGE_COLORS[v.id] || VARIANT_BADGE_COLORS.default}`}
              >
                {v.label}
              </span>
              <span className="font-mono text-[10px] text-zinc-600">
                {v.id}
              </span>
            </div>

            <div className="mb-5 space-y-2 flex-1">
              {CONFIG_ROWS.map((row) => {
                const raw = v[row.key];
                const display = row.format ? row.format(raw) : String(raw);
                return (
                  <div
                    key={row.key}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="text-zinc-500">{row.label}</span>
                    <span className="font-medium text-zinc-300">{display}</span>
                  </div>
                );
              })}
            </div>

            <Link
              href={`/prototype?variant=${v.id}`}
              target="_blank"
              className="block w-full rounded-lg bg-orange-600 py-2.5 text-center text-sm font-medium text-white transition-colors hover:bg-orange-500"
            >
              Preview Prototype
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
