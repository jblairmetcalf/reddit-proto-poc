"use client";

import { useState, type ReactNode, type CSSProperties } from "react";
import ChatType from "./ChatType";

export interface TileProps {
  /** Emoji or icon displayed at top */
  icon?: string;
  /** Title — uses ChatType hover animation */
  title: string;
  /** Description text */
  description?: string;
  /** Optional ReactNode rendered below the description */
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  onClick?: () => void;
}

export default function Tile({
  icon,
  title,
  description,
  children,
  className = "",
  style = {},
  onClick,
}: TileProps) {
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
        borderRadius: 20,
        padding: "28px 22px",
        cursor: onClick ? "pointer" : "default",
        position: "relative",
        overflow: "hidden",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? "var(--brand-card-shadow)" : "none",
        transition: "all 0.35s cubic-bezier(.23,1,.32,1)",
        ...style,
      }}
    >
      {/* Gradient top bar on hover */}
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
      {icon && (
        <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
      )}
      <ChatType
        text={title}
        trigger="hover"
        speed={14}
        style={{
          fontSize: 15,
          fontWeight: 800,
          marginBottom: 8,
          lineHeight: 1.2,
          display: "block",
          color: "var(--brand-text)",
        }}
      />
      {description && (
        <p
          style={{
            fontSize: 12.5,
            color: "var(--brand-text-muted)",
            lineHeight: 1.55,
            transition: "color 0.4s ease",
          }}
        >
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
