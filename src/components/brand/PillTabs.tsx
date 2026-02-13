"use client";

export interface PillTabsProps {
  /** List of tab labels */
  items: string[];
  /** Currently selected tab */
  value: string;
  /** Called when a tab is clicked */
  onChange: (value: string) => void;
  className?: string;
}

export default function PillTabs({
  items,
  value,
  onChange,
  className = "",
}: PillTabsProps) {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 8,
        scrollbarWidth: "none",
      }}
    >
      {items.map((item) => {
        const active = item === value;
        return (
          <button
            key={item}
            onClick={() => onChange(item)}
            style={{
              padding: "8px 18px",
              borderRadius: 99,
              fontSize: 13,
              fontWeight: 700,
              border: `1.5px solid ${active ? "var(--brand-orangered)" : "var(--brand-chip-border)"}`,
              background: active
                ? "var(--brand-orangered)"
                : "var(--brand-chip-bg)",
              color: active ? "white" : "var(--brand-chip-text)",
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              boxShadow: active
                ? "0 4px 16px rgba(255,69,0,0.35)"
                : "none",
              transition: "all 0.3s ease",
            }}
          >
            {item}
          </button>
        );
      })}
    </div>
  );
}
