"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type CSSProperties,
} from "react";

export interface ChatTypeProps {
  /** The text to type out */
  text: string;
  /** "appear" fires once on scroll; "hover" fires on mouseenter */
  trigger?: "appear" | "hover";
  /** Delay in ms before the animation starts (appear mode) */
  appearDelay?: number;
  /** Milliseconds per character */
  speed?: number;
  /** How long the bouncing dots phase lasts (ms) */
  dotDuration?: number;
  /** Optional gradient applied to the visible text */
  gradientStyle?: CSSProperties | null;
  className?: string;
  style?: CSSProperties;
}

export default function ChatType({
  text,
  trigger = "appear",
  appearDelay = 0,
  speed = 18,
  dotDuration = 160,
  gradientStyle = null,
  className = "",
  style = {},
}: ChatTypeProps) {
  const [display, setDisplay] = useState(trigger === "appear" ? "" : text);
  const [showDots, setShowDots] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const timeouts = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isAnimating = useRef(false);
  const hasAppeared = useRef(false);
  const elRef = useRef<HTMLSpanElement>(null);

  const clearTimers = useCallback(() => {
    timeouts.current.forEach(clearTimeout);
    timeouts.current = [];
  }, []);

  const runType = useCallback(() => {
    if (isAnimating.current) return;
    isAnimating.current = true;
    clearTimers();
    setDisplay("");
    setShowDots(true);
    setShowCursor(false);

    const t1 = setTimeout(() => {
      setShowDots(false);
      setShowCursor(true);
      const chars = text.split("");
      chars.forEach((_, i) => {
        const tid = setTimeout(() => {
          setDisplay(text.slice(0, i + 1));
          if (i === chars.length - 1) {
            const tEnd = setTimeout(() => {
              setShowCursor(false);
              isAnimating.current = false;
            }, 300);
            timeouts.current.push(tEnd);
          }
        }, i * speed);
        timeouts.current.push(tid);
      });
    }, dotDuration);
    timeouts.current.push(t1);
  }, [text, speed, dotDuration, clearTimers]);

  // Appear-once via IntersectionObserver
  useEffect(() => {
    if (trigger !== "appear") return;
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !hasAppeared.current) {
          hasAppeared.current = true;
          obs.disconnect();
          const t = setTimeout(() => runType(), appearDelay);
          timeouts.current.push(t);
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger, runType, appearDelay]);

  // Reset on text prop change in hover mode
  useEffect(() => {
    if (trigger === "hover") {
      setDisplay(text);
      setShowDots(false);
      setShowCursor(false);
      isAnimating.current = false;
      clearTimers();
    }
  }, [text, trigger, clearTimers]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  const handlers =
    trigger === "hover"
      ? { onMouseEnter: runType, onTouchStart: runType }
      : {};

  const visibleContent = (
    <>
      {showDots && (
        <span className="brand-typing-dots">
          <span className="brand-dot" />
          <span className="brand-dot" />
          <span className="brand-dot" />
        </span>
      )}
      {!showDots && display}
      {showCursor && <span className="brand-chat-cursor" />}
    </>
  );

  return (
    <span
      ref={elRef}
      className={className}
      style={{
        ...style,
        position: "relative",
        cursor: trigger === "hover" ? "default" : undefined,
      }}
      {...handlers}
    >
      {/* Invisible placeholder locks height */}
      <span
        aria-hidden="true"
        style={{
          visibility: "hidden",
          display: "block",
          height: 0,
          overflow: "hidden",
          pointerEvents: "none",
        }}
      >
        {text}
      </span>
      {gradientStyle ? (
        <span style={gradientStyle}>{visibleContent}</span>
      ) : (
        visibleContent
      )}
    </span>
  );
}
