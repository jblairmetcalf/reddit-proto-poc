"use client";

import { useState, type ReactNode } from "react";
import ChatType from "./ChatType";

export interface ListItemBadge {
  label: string;
  color?: string;
  bgColor?: string;
  pulse?: boolean;
}

export interface ListItemChip {
  label: string;
  variant?: "remote" | "hybrid" | "default";
}

export interface ListItemProps {
  /** Small uppercase category label (e.g. team name) */
  category?: string;
  /** Title — uses ChatType hover animation */
  title: string;
  /** Metadata items displayed below the title */
  meta?: string[];
  /** Badges displayed to the right of the category */
  badges?: ListItemBadge[];
  /** Chips displayed below the title */
  chips?: ListItemChip[];
  /** Optional extra content */
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function ListItem({
  category,
  title,
  meta,
  badges,
  chips,
  children,
  onClick,
  className = "",
}: ListItemProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered
          ? "var(--brand-surface-hover)"
          : "var(--brand-surface)",
        border: `1px solid ${hovered ? "var(--brand-border-hover)" : "var(--brand-border)"}`,
        borderRadius: 16,
        padding: 20,
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "var(--brand-card-shadow)" : "none",
        transition: "all 0.35s cubic-bezier(.23,1,.32,1)",
      }}
    >
      {/* Gradient top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background:
            "linear-gradient(90deg, var(--brand-orangered), var(--brand-upvote), var(--brand-karma))",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s",
        }}
      />

      {/* Category + badges row */}
      {(category || badges) && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          {category && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: "var(--brand-aqua)",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {category}
            </span>
          )}
          {badges && (
            <div style={{ display: "flex", gap: 6 }}>
              {badges.map((b) => (
                <span
                  key={b.label}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    background:
                      b.bgColor || "rgba(255,69,0,0.15)",
                    color: b.color || "var(--brand-orangered)",
                    fontSize: 11,
                    fontWeight: 800,
                    padding: "3px 10px",
                    borderRadius: 99,
                    animation: b.pulse
                      ? "brand-badge-pulse 2s infinite"
                      : undefined,
                  }}
                >
                  {b.label}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Title */}
      <ChatType
        text={title}
        trigger="hover"
        speed={14}
        style={{
          fontSize: 16,
          fontWeight: 800,
          marginBottom: 10,
          lineHeight: 1.3,
          display: "block",
          color: "var(--brand-text)",
          transition: "color 0.4s ease",
        }}
      />

      {/* Meta + chips */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {meta?.map((m) => (
          <span
            key={m}
            style={{
              fontSize: 12,
              color: "var(--brand-text-muted)",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {m}
          </span>
        ))}
        {chips?.map((c) => {
          const bg =
            c.variant === "remote"
              ? "var(--brand-remote-bg)"
              : c.variant === "hybrid"
                ? "var(--brand-hybrid-bg)"
                : "var(--brand-chip-bg)";
          const color =
            c.variant === "remote"
              ? "var(--brand-aqua)"
              : c.variant === "hybrid"
                ? "var(--brand-periwinkle)"
                : "var(--brand-chip-text)";
          return (
            <span
              key={c.label}
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: 99,
                background: bg,
                color,
              }}
            >
              {c.label}
            </span>
          );
        })}
      </div>
      {children}
    </div>
  );
}
