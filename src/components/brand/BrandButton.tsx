"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export interface BrandButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** "brand" = gradient CTA, "outline" = bordered pill */
  variant?: "brand" | "outline";
  children: ReactNode;
}

export default function BrandButton({
  variant = "brand",
  children,
  style = {},
  ...props
}: BrandButtonProps) {
  if (variant === "outline") {
    return (
      <button
        style={{
          background: "transparent",
          color: "var(--brand-text)",
          border: "2px solid var(--brand-border-hover)",
          padding: "13px 26px",
          borderRadius: 99,
          fontWeight: 700,
          fontSize: 15,
          cursor: "pointer",
          fontFamily: "inherit",
          transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
          ...style,
        }}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      style={{
        background:
          "linear-gradient(135deg, var(--brand-orangered), var(--brand-deep-orange))",
        color: "white",
        border: "none",
        padding: "14px 28px",
        borderRadius: 99,
        fontWeight: 800,
        fontSize: 15,
        cursor: "pointer",
        letterSpacing: "0.02em",
        fontFamily: "inherit",
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(255,69,0,0.3)",
        ...style,
      }}
      {...props}
    >
      <span style={{ position: "relative", zIndex: 1 }}>{children}</span>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
          backgroundSize: "200% 100%",
          animation: "brand-shimmer 3s ease-in-out infinite",
        }}
      />
    </button>
  );
}
