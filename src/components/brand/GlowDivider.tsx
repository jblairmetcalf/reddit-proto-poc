export interface GlowDividerProps {
  className?: string;
}

export default function GlowDivider({ className = "" }: GlowDividerProps) {
  return (
    <div
      className={className}
      style={{
        height: 1,
        margin: "0 20px",
        background:
          "linear-gradient(90deg, transparent, var(--brand-glow-divider), transparent)",
        transition: "background 0.5s ease",
      }}
    />
  );
}
