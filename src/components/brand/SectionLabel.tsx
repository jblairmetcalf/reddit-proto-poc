import type { ReactNode, CSSProperties } from "react";

export interface SectionLabelProps {
  children: ReactNode;
  /** "center" (default) or "left" with decorative bar */
  align?: "center" | "left";
  className?: string;
  style?: CSSProperties;
}

export default function SectionLabel({
  children,
  align = "center",
  className = "",
  style = {},
}: SectionLabelProps) {
  if (align === "left") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--brand-orangered)",
          marginBottom: 12,
          ...style,
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 3,
            height: 16,
            borderRadius: 2,
            background: "var(--brand-orangered)",
            flexShrink: 0,
          }}
        />
        {children}
      </div>
    );
  }

  return (
    <div
      className={className}
      style={{
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color: "var(--brand-orangered)",
        marginBottom: 12,
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
