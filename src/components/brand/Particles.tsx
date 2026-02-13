"use client";

import { useRef } from "react";

const BRAND_COLORS = ["#FF4500", "#FF8B60", "#FFDF00", "#0DD3BB", "#7193FF"];

export interface ParticlesProps {
  /** Number of particles to render */
  count?: number;
  /** "float" hovers in place; "rise" drifts upward continuously */
  mode?: "float" | "rise";
  className?: string;
}

export default function Particles({
  count = 16,
  mode = "rise",
  className = "",
}: ParticlesProps) {
  const particles = useRef(
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 3 + Math.random() * 5,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 8,
      color: BRAND_COLORS[i % BRAND_COLORS.length],
    }))
  ).current;

  return (
    <div
      className={className}
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            ...(mode === "rise"
              ? { bottom: "-10px" }
              : { top: `${p.top}%` }),
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: p.color,
            opacity: "var(--brand-particle-opacity, 0.25)",
            animation:
              mode === "rise"
                ? `brand-float-up ${p.duration}s ${p.delay}s ease-in infinite`
                : `brand-float ${p.duration}s ${p.delay}s ease-in-out infinite`,
          }}
        />
      ))}
    </div>
  );
}
