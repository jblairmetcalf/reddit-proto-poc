"use client";

import { useEffect, useState, type ReactNode } from "react";
import Particles from "./Particles";
import SectionLabel from "./SectionLabel";
import ChatType from "./ChatType";
import BrandButton from "./BrandButton";

export interface HeroSectionProps {
  /** Small uppercase label above the headline */
  label?: string;
  /** Lines of the hero headline — each is typed sequentially */
  headline: string[];
  /** Index of the headline line to apply gradient text (optional) */
  gradientLine?: number;
  /** Subtitle paragraph below the headline */
  subtitle?: string;
  /** Primary CTA label */
  ctaLabel?: string;
  /** Secondary CTA label */
  secondaryCtaLabel?: string;
  onCtaClick?: () => void;
  onSecondaryCtaClick?: () => void;
  /** Slot for stat counters or any extra content below CTAs */
  children?: ReactNode;
  className?: string;
}

export default function HeroSection({
  label,
  headline,
  gradientLine,
  subtitle,
  ctaLabel,
  secondaryCtaLabel,
  onCtaClick,
  onSecondaryCtaClick,
  children,
  className = "",
}: HeroSectionProps) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 200);
    return () => clearTimeout(t);
  }, []);

  return (
    <section
      className={className}
      style={{
        position: "relative",
        minHeight: "80vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px 60px",
        textAlign: "center",
        background: "var(--brand-hero-bg)",
        backgroundSize: "300% 300%",
        animation: "brand-gradient-shift 12s ease infinite",
        color: "var(--brand-text)",
        transition: "all 0.6s ease",
      }}
    >
      <Particles mode="rise" count={18} />

      <div style={{ position: "relative", zIndex: 2 }}>
        {label && (
          <div
            style={{
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.9s cubic-bezier(.23,1,.32,1) 0.3s",
            }}
          >
            <SectionLabel style={{ marginBottom: 16 }}>{label}</SectionLabel>
          </div>
        )}

        <h1
          style={{
            fontSize: "clamp(36px, 10vw, 52px)",
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
            maxWidth: 500,
            margin: "0 auto",
            opacity: loaded ? 1 : 0,
            transform: loaded ? "translateY(0)" : "translateY(30px)",
            transition: "all 0.9s cubic-bezier(.23,1,.32,1) 0.5s",
          }}
        >
          {headline.map((line, i) => (
            <ChatType
              key={line}
              text={line}
              trigger="appear"
              speed={20}
              appearDelay={600 + i * 500}
              className="block"
              style={{ display: "block", lineHeight: 1.1 }}
              gradientStyle={
                i === gradientLine
                  ? {
                      background:
                        "linear-gradient(135deg, var(--brand-orangered), var(--brand-upvote), var(--brand-karma))",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundSize: "200% auto",
                      animation: "brand-gradient-shift 4s ease infinite",
                    }
                  : null
              }
            />
          ))}
        </h1>

        {subtitle && (
          <p
            style={{
              marginTop: 20,
              fontSize: 16,
              lineHeight: 1.6,
              color: "var(--brand-text-secondary)",
              maxWidth: 380,
              marginLeft: "auto",
              marginRight: "auto",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(.23,1,.32,1) 0.8s",
            }}
          >
            {subtitle}
          </p>
        )}

        {(ctaLabel || secondaryCtaLabel) && (
          <div
            style={{
              marginTop: 32,
              display: "flex",
              gap: 12,
              justifyContent: "center",
              flexWrap: "wrap",
              opacity: loaded ? 1 : 0,
              transform: loaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(.23,1,.32,1) 1.1s",
            }}
          >
            {ctaLabel && (
              <BrandButton onClick={onCtaClick}>{ctaLabel}</BrandButton>
            )}
            {secondaryCtaLabel && (
              <BrandButton variant="outline" onClick={onSecondaryCtaClick}>
                {secondaryCtaLabel}
              </BrandButton>
            )}
          </div>
        )}

        {children && (
          <div
            style={{
              marginTop: 48,
              opacity: loaded ? 1 : 0,
              transition: "all 0.8s ease 1.4s",
            }}
          >
            {children}
          </div>
        )}
      </div>

      {/* Scroll hint */}
      <div
        style={{
          position: "absolute",
          bottom: 30,
          left: "50%",
          transform: "translateX(-50%)",
          animation: "brand-bobble 2.5s ease-in-out infinite",
          opacity: 0.4,
          fontSize: 24,
          color: "var(--brand-text-muted)",
        }}
      >
        ↓
      </div>
    </section>
  );
}
