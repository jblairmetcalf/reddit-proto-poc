"use client";

import { useEffect, useRef } from "react";
import lottie, { type AnimationItem } from "lottie-web";

// Eagerly fetch the Lottie JSON so it's cached before any Loader mounts
let animationDataPromise: Promise<object> | null = null;
function getAnimationData(): Promise<object> {
  if (!animationDataPromise) {
    animationDataPromise = fetch("/loader.json").then((r) => r.json());
  }
  return animationDataPromise;
}
// Kick off preload immediately on module evaluation
if (typeof window !== "undefined") {
  getAnimationData();
}

interface LoaderProps {
  size?: number;
  className?: string;
}

export default function Loader({ size = 200, className = "" }: LoaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const animRef = useRef<AnimationItem | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let cancelled = false;

    getAnimationData().then((data) => {
      if (cancelled || !containerRef.current) return;
      animRef.current = lottie.loadAnimation({
        container: containerRef.current,
        renderer: "svg",
        loop: true,
        autoplay: true,
        animationData: data,
      });
    });

    return () => {
      cancelled = true;
      animRef.current?.destroy();
    };
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div ref={containerRef} style={{ width: size, height: size }} />
    </div>
  );
}
