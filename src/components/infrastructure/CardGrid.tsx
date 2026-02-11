import { type ReactNode } from "react";

interface CardGridProps {
  children: ReactNode;
  gap?: "4" | "5" | "6";
  columns?: 2 | 3 | 4;
}

const columnClasses = {
  2: "grid sm:grid-cols-2",
  3: "grid sm:grid-cols-2 lg:grid-cols-3",
  4: "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

export default function CardGrid({
  children,
  gap = "4",
  columns = 3,
}: CardGridProps) {
  return (
    <div className={`${columnClasses[columns]} gap-${gap}`}>{children}</div>
  );
}
