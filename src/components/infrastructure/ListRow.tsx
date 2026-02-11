import { type ReactNode } from "react";

interface ListRowProps {
  children: ReactNode;
  actions?: ReactNode;
  align?: "center" | "start";
}

export default function ListRow({
  children,
  actions,
  align = "center",
}: ListRowProps) {
  return (
    <div
      className={`flex ${align === "center" ? "items-center" : "items-start"} justify-between rounded-xl border border-edge bg-card px-5 py-4 transition-colors hover:border-edge-strong`}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {actions && (
        <div className="ml-4 flex flex-shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
