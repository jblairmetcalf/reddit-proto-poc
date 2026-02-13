import type { CSSProperties } from "react";

export interface CommentCardProps {
  /** Display name (e.g. "u/sarah_eng") */
  name: string;
  /** Role or subtitle */
  role?: string;
  /** Single-character avatar fallback */
  avatar?: string;
  /** The comment / testimonial text */
  text: string;
  /** Upvote count */
  upvotes?: number;
  className?: string;
  style?: CSSProperties;
}

export default function CommentCard({
  name,
  role,
  avatar,
  text,
  upvotes,
  className = "",
  style = {},
}: CommentCardProps) {
  return (
    <div
      className={className}
      style={{
        background: "var(--brand-surface)",
        border: "1px solid var(--brand-border)",
        borderRadius: 20,
        padding: 24,
        transition: "all 0.4s ease",
        color: "var(--brand-text)",
        ...style,
      }}
    >
      {/* Author row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background:
              "linear-gradient(135deg, var(--brand-orangered), var(--brand-upvote))",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: 18,
            color: "#FFF",
            flexShrink: 0,
          }}
        >
          {avatar || name[0]?.toUpperCase()}
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: 14 }}>{name}</div>
          {role && (
            <div
              style={{
                fontSize: 12,
                color: "var(--brand-text-muted)",
              }}
            >
              {role}
            </div>
          )}
        </div>
      </div>

      {/* Comment text */}
      <p
        style={{
          fontSize: 14,
          lineHeight: 1.6,
          color: "var(--brand-testimonial-text)",
          fontStyle: "italic",
        }}
      >
        &ldquo;{text}&rdquo;
      </p>

      {/* Upvotes */}
      {upvotes != null && (
        <div
          style={{
            marginTop: 14,
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: "var(--brand-orangered)",
            fontSize: 13,
            fontWeight: 700,
          }}
        >
          ⬆ {upvotes.toLocaleString()} upvotes
        </div>
      )}
    </div>
  );
}
