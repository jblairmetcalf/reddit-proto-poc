import { type ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  children?: ReactNode;
}

export default function StatCard({ label, value, children }: StatCardProps) {
  return (
    <div className="rounded-xl border border-edge bg-card p-4">
      <p className="text-xs font-medium uppercase text-muted">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
      {children}
    </div>
  );
}
