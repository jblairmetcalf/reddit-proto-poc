interface StatusBadgeProps {
  status: string;
  styleMap?: Record<string, string>;
  size?: "sm" | "md";
}

export const STUDY_STATUS_STYLES: Record<string, string> = {
  draft: "bg-subtle text-secondary",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
};

export const PARTICIPANT_STATUS_STYLES: Record<string, string> = {
  invited: "bg-amber-500/20 text-amber-400",
  viewed: "bg-cyan-500/20 text-cyan-400",
  active: "bg-green-500/20 text-green-400",
  completed: "bg-blue-500/20 text-blue-400",
  timed_out: "bg-red-500/20 text-red-400",
};

export const PROTOTYPE_STATUS_STYLES: Record<string, string> = {
  draft: "bg-subtle text-secondary",
  "in-progress": "bg-amber-500/20 text-amber-400",
  complete: "bg-green-500/20 text-green-400",
};

export const ROLE_STYLES: Record<string, string> = {
  "Lead Prototyper": "bg-orange-500/20 text-orange-400",
  "UX Engineer": "bg-violet-500/20 text-violet-400",
  "Interaction Designer": "bg-sky-500/20 text-sky-400",
};

export const VARIANT_BADGE_COLORS: Record<string, string> = {
  default: "bg-subtle text-secondary",
  "variant-a": "bg-blue-500/20 text-blue-400",
  "variant-b": "bg-green-500/20 text-green-400",
  "variant-c": "bg-purple-500/20 text-purple-400",
};

export default function StatusBadge({
  status,
  styleMap,
  size = "md",
}: StatusBadgeProps) {
  const styles = styleMap ?? {};
  const colorClass = styles[status] || "bg-subtle text-secondary";
  const sizeClass = size === "sm" ? "text-[9px]" : "text-[10px]";

  return (
    <span
      className={`rounded-full px-2 py-0.5 font-bold uppercase ${sizeClass} ${colorClass}`}
    >
      {status}
    </span>
  );
}
