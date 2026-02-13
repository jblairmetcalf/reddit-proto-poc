"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export interface AnimSectionProps {
  delay?: number;
  className?: string;
  children: ReactNode;
}

export default function AnimSection({
  delay = 0,
  className = "",
  children,
}: AnimSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`${visible ? "brand-anim-visible" : "brand-anim-hidden"} ${className}`}
      style={{ transitionDelay: visible ? `${delay}s` : "0s" }}
    >
      {children}
    </div>
  );
}
