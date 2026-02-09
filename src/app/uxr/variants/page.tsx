"use client";

import Link from "next/link";
import { VARIANT_PRESETS, type VariantConfig } from "@/lib/variants";

const CONFIG_ROWS: { key: keyof VariantConfig; label: string; format?: (v: unknown) => string }[] = [
  { key: "defaultSort", label: "Default Sort" },
  { key: "feedDensity", label: "Feed Density" },
  { key: "showAwards", label: "Awards", format: (v) => (v ? "Visible" : "Hidden") },
  { key: "showFlairs", label: "Flairs", format: (v) => (v ? "Visible" : "Hidden") },
  { key: "showVoteCount", label: "Vote Counts", format: (v) => (v ? "Numeric" : "Hidden") },
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

function DiffDot({ differs }: { differs: boolean }) {
  if (!differs) return null;
  return <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-orange-400" title="Differs from default" />;
}

export default function VariantsPage() {
  const variants = Object.values(VARIANT_PRESETS);
  const defaultVariant = VARIANT_PRESETS.default;

  return (
    <div className="p-8">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">Prototype Variants</h1>
        <p className="mt-1 text-sm text-zinc-400">
          Compare variant configurations before assigning one to a study.
          <span className="ml-2 inline-flex items-center gap-1 text-orange-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400" /> = differs from default
          </span>
        </p>
      </header>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-5 py-3 text-left text-xs font-medium uppercase text-zinc-500">
                Setting
              </th>
              {variants.map((v) => (
                <th key={v.id} className="px-5 py-3 text-center">
                  <span
                    className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${VARIANT_BADGE_COLORS[v.id] || VARIANT_BADGE_COLORS.default}`}
                  >
                    {v.label}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CONFIG_ROWS.map((row) => (
              <tr key={row.key} className="border-b border-zinc-800/50 last:border-0">
                <td className="px-5 py-3 text-xs font-medium text-zinc-400">
                  {row.label}
                </td>
                {variants.map((v) => {
                  const raw = v[row.key];
                  const defaultRaw = defaultVariant[row.key];
                  const display = row.format ? row.format(raw) : String(raw);
                  const differs = v.id !== "default" && raw !== defaultRaw;
                  return (
                    <td
                      key={v.id}
                      className={`px-5 py-3 text-center text-xs font-medium ${differs ? "text-white" : "text-zinc-500"}`}
                    >
                      {display}
                      <DiffDot differs={differs} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards with preview links */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {variants.map((v) => (
          <div
            key={v.id}
            className={`rounded-xl border-2 bg-zinc-900 p-5 ${VARIANT_COLORS[v.id] || VARIANT_COLORS.default}`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${VARIANT_BADGE_COLORS[v.id] || VARIANT_BADGE_COLORS.default}`}
              >
                {v.label}
              </span>
              <span className="font-mono text-[10px] text-zinc-600">{v.id}</span>
            </div>

            <div className="mb-4 space-y-1.5">
              {CONFIG_ROWS.map((row) => {
                const raw = v[row.key];
                const display = row.format ? row.format(raw) : String(raw);
                return (
                  <div key={row.key} className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">{row.label}</span>
                    <span className="font-medium text-zinc-300">{display}</span>
                  </div>
                );
              })}
            </div>

            <Link
              href={`/prototype?variant=${v.id}`}
              target="_blank"
              className="block w-full rounded-lg border border-zinc-700 py-2 text-center text-xs font-medium text-zinc-400 transition-colors hover:border-orange-500 hover:text-orange-400"
            >
              Preview
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
