import { type ReactNode } from "react";
import Link from "next/link";

interface PageHeaderProps {
  backHref?: string;
  backLabel?: string;
  title: string;
  badge?: ReactNode;
  description?: string;
  actions?: ReactNode;
}

export default function PageHeader({
  backHref,
  backLabel = "Dashboard",
  title,
  badge,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-6">
      {backHref && (
        <Link
          href={backHref}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-orange-400"
        >
          &larr; {backLabel}
        </Link>
      )}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="mt-1 text-sm text-secondary">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}
