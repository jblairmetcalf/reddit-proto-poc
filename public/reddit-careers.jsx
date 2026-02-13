import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";

// ─── Theme Definitions ───────────────────────────────────
const THEMES = {
  dark: {
    bg: "#060B0D", bgAlt: "#0B1416",
    surface: "rgba(255,255,255,0.04)", surfaceHover: "rgba(255,69,0,0.06)",
    border: "rgba(255,255,255,0.07)", borderHover: "rgba(255,69,0,0.25)",
    borderSubtle: "rgba(255,255,255,0.06)",
    text: "#FFFFFF", textSecondary: "#9AABB8", textMuted: "#6B7B8D", textFaint: "#3D4F5F",
    navBg: "rgba(6,11,13,0.75)", navBorder: "rgba(255,69,0,0.15)",
    chipBg: "rgba(255,255,255,0.04)", chipBorder: "rgba(255,255,255,0.12)", chipText: "#aab",
    heroBg: "linear-gradient(135deg, #060B0D 0%, #1a0800 40%, #0B1416 70%, #0a1a2e 100%)",
    particleOpacity: 0.35, cardShadow: "0 12px 40px rgba(0,0,0,0.3)",
    glowDivider: "rgba(255,69,0,0.3)", overlayBg: "rgba(6,11,13,0.95)",
    testimonialText: "#B0BEC5",
    remoteBg: "rgba(13,211,187,0.12)", hybridBg: "rgba(113,147,255,0.12)",
    valueBg: "linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))",
  },
  light: {
    bg: "#FFFFFF", bgAlt: "#F6F7F8",
    surface: "rgba(0,0,0,0.025)", surfaceHover: "rgba(255,69,0,0.05)",
    border: "rgba(0,0,0,0.07)", borderHover: "rgba(255,69,0,0.35)",
    borderSubtle: "rgba(0,0,0,0.05)",
    text: "#1A1A1B", textSecondary: "#4A5568", textMuted: "#6B7B8D", textFaint: "#C4CDD5",
    navBg: "rgba(255,255,255,0.85)", navBorder: "rgba(0,0,0,0.06)",
    chipBg: "rgba(0,0,0,0.03)", chipBorder: "rgba(0,0,0,0.1)", chipText: "#576F76",
    heroBg: "linear-gradient(135deg, #FFF5F0 0%, #FFF0E6 30%, #F8F9FA 60%, #EFF2FF 100%)",
    particleOpacity: 0.18, cardShadow: "0 8px 32px rgba(0,0,0,0.06)",
    glowDivider: "rgba(255,69,0,0.12)", overlayBg: "rgba(255,255,255,0.97)",
    testimonialText: "#4A5568",
    remoteBg: "rgba(13,211,187,0.08)", hybridBg: "rgba(113,147,255,0.08)",
    valueBg: "linear-gradient(145deg, rgba(255,69,0,0.025), rgba(113,147,255,0.02))",
  },
};

const BRAND = {
  orangered: "#FF4500", deepOrange: "#D93A00",
  aqua: "#0DD3BB", aquaDark: "#099E8D",
  periwinkle: "#7193FF", upvote: "#FF8B60", karma: "#FFDF00",
};

const ThemeCtx = createContext();
function useTheme() { return useContext(ThemeCtx); }

const JOBS = [
  { team: "Engineering", title: "Senior Frontend Engineer", location: "San Francisco, CA", type: "Hybrid", hot: true },
  { team: "Engineering", title: "Staff ML/AI Engineer", location: "New York, NY", type: "Remote", hot: true },
  { team: "Engineering", title: "iOS Engineer", location: "San Francisco, CA", type: "Hybrid", hot: false },
  { team: "Design", title: "Senior Product Designer", location: "San Francisco, CA", type: "Hybrid", hot: false },
  { team: "Design", title: "Brand Designer", location: "Remote", type: "Remote", hot: true },
  { team: "Product", title: "Senior Product Manager, Feeds", location: "New York, NY", type: "Hybrid", hot: false },
  { team: "Product", title: "Group PM, Safety & Trust", location: "San Francisco, CA", type: "Hybrid", hot: false },
  { team: "Data", title: "Data Scientist, Growth", location: "Remote", type: "Remote", hot: false },
  { team: "Data", title: "Analytics Engineer", location: "San Francisco, CA", type: "Hybrid", hot: true },
  { team: "Community", title: "Community Operations Lead", location: "Remote", type: "Remote", hot: false },
];

const VALUES = [
  { icon: "💬", title: "Community First", desc: "Everything we build serves our communities. 52M+ daily active users find their people here." },
  { icon: "🔥", title: "Ship Fast, Learn Faster", desc: "We move quickly, break things thoughtfully, and iterate based on what real humans actually need." },
  { icon: "🤝", title: "Radical Belonging", desc: "We celebrate every voice. Our differences make us stronger — on the platform and on our team." },
  { icon: "🧠", title: "Think Independently", desc: "We hire people with strong opinions, loosely held. Challenge everything — respectfully." },
];

const PERKS = [
  { emoji: "🏥", label: "Full medical, dental & vision" },
  { emoji: "🏠", label: "Flexible remote & hybrid" },
  { emoji: "💰", label: "Competitive equity packages" },
  { emoji: "📚", label: "$5K annual learning stipend" },
  { emoji: "🏖️", label: "Unlimited PTO (really)" },
  { emoji: "👶", label: "16 weeks parental leave" },
  { emoji: "🍱", label: "Daily meals & snacks" },
  { emoji: "🧘", label: "Wellness & mental health" },
];

const TESTIMONIALS = [
  { name: "u/sarah_eng", role: "Staff Engineer, 3 yrs", text: "I came for the mission, stayed for the people. Nowhere else lets you ship to millions and still feel this close-knit.", avatar: "S" },
  { name: "u/mark_design", role: "Senior Designer, 2 yrs", text: "The creative freedom here is unreal. My work reaches communities I actually care about.", avatar: "M" },
  { name: "u/priya_pm", role: "Product Manager, 4 yrs", text: "Reddit treats PMs like co-founders. We own problems end-to-end. It's terrifying and wonderful.", avatar: "P" },
];

// ═══════════════════════════════════════════════════════════
// CHAT-TYPE ANIMATION COMPONENT
// ═══════════════════════════════════════════════════════════
// trigger="appear" → fires once when visible (heroes/headings)
// trigger="hover"  → fires on mouseenter (tiles/cards)
// Uses an invisible placeholder to lock height at all times.

function ChatType({
  text,
  as: Tag = "span",
  style = {},
  gradientStyle = null,
  speed = 16,
  dotDuration = 160,
  trigger = "hover",
  appearDelay = 0,
}) {
  const [display, setDisplay] = useState(trigger === "appear" ? "" : text);
  const [showDots, setShowDots] = useState(false);
  const [showCursor, setShowCursor] = useState(false);
  const timeouts = useRef([]);
  const isAnimating = useRef(false);
  const hasAppeared = useRef(false);
  const elRef = useRef(null);

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

  // Appear-once: fire via IntersectionObserver
  useEffect(() => {
    if (trigger !== "appear") return;
    const el = elRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !hasAppeared.current) {
        hasAppeared.current = true;
        obs.disconnect();
        const t = setTimeout(() => runType(), appearDelay);
        timeouts.current.push(t);
      }
    }, { threshold: 0.2 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [trigger, runType, appearDelay]);

  // Reset on text prop change (e.g. filter switch)
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

  // Visible layer (typed characters + cursor/dots)
  const visibleContent = (
    <>
      {showDots && (
        <span className="typing-dots" style={{ display: "inline-flex", gap: 3, verticalAlign: "middle" }}>
          <span className="dot dot1" />
          <span className="dot dot2" />
          <span className="dot dot3" />
        </span>
      )}
      {!showDots && display}
      {showCursor && <span className="chat-cursor" />}
    </>
  );

  // Invisible placeholder locks the box to the full text size always
  const placeholder = (
    <span aria-hidden="true" style={{ visibility: "hidden", display: "block", height: 0, overflow: "hidden", pointerEvents: "none" }}>
      {text}
    </span>
  );

  const handlers = trigger === "hover" ? { onMouseEnter: runType, onTouchStart: runType } : {};

  return (
    <Tag
      ref={elRef}
      style={{ ...style, cursor: trigger === "hover" ? "default" : undefined, position: "relative" }}
      {...handlers}
    >
      {placeholder}
      {gradientStyle ? (
        <span style={gradientStyle}>{visibleContent}</span>
      ) : (
        visibleContent
      )}
    </Tag>
  );
}

// ─── Snoo SVG ────────────────────────────────────────────
function Snoo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="48" fill={BRAND.orangered} />
      <ellipse cx="50" cy="58" rx="30" ry="24" fill="#FFF" />
      <circle cx="38" cy="52" r="6" fill={BRAND.orangered} />
      <circle cx="62" cy="52" r="6" fill={BRAND.orangered} />
      <circle cx="38" cy="51" r="2.5" fill="#1A1A1B" />
      <circle cx="62" cy="51" r="2.5" fill="#1A1A1B" />
      <ellipse cx="50" cy="20" rx="6" ry="12" fill={BRAND.orangered} />
      <circle cx="64" cy="10" r="6" fill={BRAND.orangered} stroke="#FFF" strokeWidth="2" />
      <path d="M42 66 Q50 74 58 66" stroke={BRAND.orangered} strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </svg>
  );
}

// ─── Theme Toggle ────────────────────────────────────────
function ThemeToggle() {
  const { mode, toggle } = useTheme();
  const isDark = mode === "dark";
  return (
    <button onClick={toggle} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
      style={{
        position: "relative", width: 58, height: 30, borderRadius: 99,
        border: `1.5px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.08)"}`,
        background: isDark ? "rgba(255,255,255,0.06)" : "rgba(255,165,0,0.08)",
        cursor: "pointer", padding: 0, flexShrink: 0, overflow: "hidden",
        transition: "all 0.5s cubic-bezier(.23,1,.32,1)",
      }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 99, overflow: "hidden" }}>
        {isDark ? (
          <>
            <div style={{ position: "absolute", top: 8, left: 10, width: 2, height: 2, borderRadius: "50%", background: "#FFF", opacity: 0.5 }} />
            <div style={{ position: "absolute", top: 16, left: 18, width: 1.5, height: 1.5, borderRadius: "50%", background: "#FFF", opacity: 0.3 }} />
            <div style={{ position: "absolute", top: 6, left: 24, width: 1, height: 1, borderRadius: "50%", background: "#FFF", opacity: 0.4 }} />
          </>
        ) : (
          <>
            <div style={{ position: "absolute", top: 4, right: 12, width: 14, height: 14, borderRadius: "50%", background: "rgba(255,165,0,0.1)" }} />
            <div style={{ position: "absolute", bottom: 2, right: 8, width: 8, height: 8, borderRadius: "50%", background: "rgba(255,69,0,0.06)" }} />
          </>
        )}
      </div>
      <div style={{
        position: "absolute", top: 3, left: isDark ? 30 : 3,
        width: 22, height: 22, borderRadius: "50%",
        background: isDark ? "linear-gradient(135deg, #334, #445)" : "linear-gradient(135deg, #FFB347, #FF8C00)",
        transition: "all 0.5s cubic-bezier(.68,-.55,.27,1.55)",
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12,
        boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 10px rgba(255,140,0,0.45)",
      }}>
        <span style={{
          transition: "transform 0.5s cubic-bezier(.68,-.55,.27,1.55)",
          transform: isDark ? "rotate(-30deg)" : "rotate(180deg)",
          display: "block", lineHeight: 1, fontSize: 13,
        }}>{isDark ? "🌙" : "☀️"}</span>
      </div>
    </button>
  );
}

// ─── Floating particles ──────────────────────────────────
function Particles() {
  const { t } = useTheme();
  const particles = useRef(Array.from({ length: 18 }, (_, i) => ({
    id: i, left: Math.random() * 100, size: 3 + Math.random() * 5,
    delay: Math.random() * 8, duration: 6 + Math.random() * 8,
    color: [BRAND.orangered, BRAND.upvote, BRAND.karma, BRAND.aqua, BRAND.periwinkle][i % 5],
  }))).current;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {particles.map((p) => (
        <div key={p.id} style={{
          position: "absolute", left: `${p.left}%`, bottom: "-10px",
          width: p.size, height: p.size, borderRadius: "50%",
          background: p.color, opacity: t.particleOpacity,
          animation: `floatUp ${p.duration}s ${p.delay}s ease-in infinite`,
          transition: "opacity 0.6s ease",
        }} />
      ))}
    </div>
  );
}

// ─── Hooks & helpers ─────────────────────────────────────
function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function AnimSection({ children, delay = 0 }) {
  const [ref, visible] = useInView(0.1);
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(40px)",
      transition: `opacity 0.8s cubic-bezier(.23,1,.32,1) ${delay}s, transform 0.8s cubic-bezier(.23,1,.32,1) ${delay}s`,
    }}>{children}</div>
  );
}

function UpvoteCounter({ target, label }) {
  const [count, setCount] = useState(0);
  const [ref, visible] = useInView();
  const { t } = useTheme();
  useEffect(() => {
    if (!visible) return;
    let start = 0;
    const step = Math.ceil(target / 60);
    const id = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(id); } else setCount(start);
    }, 20);
    return () => clearInterval(id);
  }, [visible, target]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontSize: 36, fontWeight: 900, color: BRAND.orangered, fontFamily: "'Reddit Sans', sans-serif" }}>
        {count.toLocaleString()}+
      </div>
      <div style={{ fontSize: 13, color: t.textMuted, marginTop: 4, letterSpacing: "0.02em", transition: "color 0.4s ease" }}>{label}</div>
    </div>
  );
}

function SectionLabel({ children, style: s = {} }) {
  return (
    <div style={{
      fontSize: 11, fontWeight: 800, letterSpacing: "0.16em",
      textTransform: "uppercase", color: BRAND.orangered,
      marginBottom: 12, textAlign: "center", ...s,
    }}>{children}</div>
  );
}

function Divider() {
  const { t } = useTheme();
  return <div style={{ height: 1, margin: "0 20px", background: `linear-gradient(90deg, transparent, ${t.glowDivider}, transparent)`, transition: "background 0.5s ease" }} />;
}

function JobCard({ job }) {
  const { t, mode } = useTheme();
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)} onTouchEnd={() => setHovered(false)}
      style={{
        background: hovered ? t.surfaceHover : t.surface,
        border: `1px solid ${hovered ? t.borderHover : t.border}`,
        borderRadius: 16, padding: 20, cursor: "pointer",
        position: "relative", overflow: "hidden",
        transform: hovered ? "translateY(-3px)" : "none",
        boxShadow: hovered ? t.cardShadow : "none",
        transition: "all 0.35s cubic-bezier(.23,1,.32,1)",
      }}>
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${BRAND.orangered}, ${BRAND.upvote}, ${BRAND.karma})`,
        opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
      }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: mode === "dark" ? BRAND.aqua : BRAND.aquaDark, letterSpacing: "0.04em", textTransform: "uppercase" }}>{job.team}</span>
        {job.hot && (
          <span style={{
            display: "inline-flex", alignItems: "center", gap: 4,
            background: "rgba(255,69,0,0.15)", color: BRAND.orangered,
            fontSize: 11, fontWeight: 800, padding: "3px 10px",
            borderRadius: 99, animation: "hotBadgePulse 2s infinite",
          }}>🔥 Hot</span>
        )}
      </div>
      <ChatType text={job.title} as="h3" trigger="hover" speed={14}
        style={{ fontSize: 16, fontWeight: 800, marginBottom: 10, lineHeight: 1.3, transition: "color 0.4s ease" }} />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 12, color: t.textMuted, display: "flex", alignItems: "center", gap: 4 }}>📍 {job.location}</span>
        <span style={{
          fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
          background: job.type === "Remote" ? t.remoteBg : t.hybridBg,
          color: job.type === "Remote" ? (mode === "dark" ? BRAND.aqua : BRAND.aquaDark) : BRAND.periwinkle,
        }}>{job.type}</span>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════
export default function RedditCareers() {
  const [mode, setMode] = useState("dark");
  const toggle = () => setMode((m) => (m === "dark" ? "light" : "dark"));
  const t = THEMES[mode];

  const [filter, setFilter] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);
  const [heroLoaded, setHeroLoaded] = useState(false);
  useEffect(() => { setTimeout(() => setHeroLoaded(true), 200); }, []);

  const teams = ["All", ...new Set(JOBS.map((j) => j.team))];
  const filtered = filter === "All" ? JOBS : JOBS.filter((j) => j.team === filter);

  return (
    <ThemeCtx.Provider value={{ mode, toggle, t }}>
      <div style={{
        background: t.bg, minHeight: "100vh",
        fontFamily: "'Reddit Sans', system-ui, -apple-system, sans-serif",
        color: t.text, overflow: "hidden",
        transition: "background 0.5s cubic-bezier(.23,1,.32,1), color 0.4s ease",
      }}>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Reddit+Sans:wght@400;600;700;800;900&display=swap');
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html { scroll-behavior: smooth; }

          @keyframes floatUp {
            0%   { transform: translateY(0) scale(1); opacity: 0.35; }
            50%  { opacity: 0.6; }
            100% { transform: translateY(-100vh) scale(0.3); opacity: 0; }
          }
          @keyframes bobble {
            0%, 100% { transform: translateY(0) rotate(-2deg); }
            50% { transform: translateY(-10px) rotate(2deg); }
          }
          @keyframes gradientShift {
            0%   { background-position: 0% 50%; }
            50%  { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes shimmer {
            0%   { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes hotBadgePulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(255,69,0,0.4); }
            50% { box-shadow: 0 0 0 6px rgba(255,69,0,0); }
          }

          @keyframes cursorBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes dotBounce1 {
            0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
            40% { transform: scale(1); opacity: 1; }
          }
          @keyframes dotBounce2 {
            0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
            40% { transform: scale(1); opacity: 1; }
          }
          @keyframes dotBounce3 {
            0%, 80%, 100% { transform: scale(0.5); opacity: 0.25; }
            40% { transform: scale(1); opacity: 1; }
          }
          .chat-cursor {
            display: inline-block;
            width: 2px;
            height: 0.8em;
            background: ${BRAND.orangered};
            margin-left: 1px;
            vertical-align: text-bottom;
            animation: cursorBlink 0.5s step-end infinite;
            border-radius: 1px;
          }
          .typing-dots .dot {
            display: inline-block;
            width: 5px;
            height: 5px;
            border-radius: 50%;
            background: ${BRAND.orangered};
          }
          .typing-dots .dot1 { animation: dotBounce1 0.6s infinite; }
          .typing-dots .dot2 { animation: dotBounce2 0.6s 0.1s infinite; }
          .typing-dots .dot3 { animation: dotBounce3 0.6s 0.2s infinite; }

          .scroll-track {
            display: flex; gap: 16px; overflow-x: auto;
            scroll-snap-type: x mandatory;
            -ms-overflow-style: none; scrollbar-width: none;
            padding: 10px 20px 20px;
          }
          .scroll-track::-webkit-scrollbar { display: none; }
        `}</style>

        {/* ─── NAV ───────────────────────────────────── */}
        <nav style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 999,
          padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
          backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
          background: t.navBg, borderBottom: `1px solid ${t.navBorder}`,
          transition: "all 0.5s ease",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Snoo size={32} />
            <span style={{ fontWeight: 900, fontSize: 16, letterSpacing: "-0.02em" }}>
              reddit <span style={{ color: BRAND.orangered }}>careers</span>
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ThemeToggle />
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: "none", border: "none", color: t.text,
              fontSize: 22, cursor: "pointer", padding: 6, transition: "color 0.4s ease",
            }}>{menuOpen ? "✕" : "☰"}</button>
          </div>
        </nav>

        {menuOpen && (
          <div style={{
            position: "fixed", inset: 0, background: t.overlayBg,
            backdropFilter: "blur(30px)", zIndex: 1000,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28,
          }} onClick={() => setMenuOpen(false)}>
            <div style={{ position: "absolute", top: 16, right: 20 }}>
              <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: t.text, fontSize: 28, cursor: "pointer" }}>✕</button>
            </div>
            {["Open Roles", "Our Values", "Benefits", "Stories", "Apply"].map((item, i) => (
              <a key={item} href={`#${item.toLowerCase().replace(/\s/g, "")}`}
                style={{ color: t.text, textDecoration: "none", fontSize: 28, fontWeight: 800, animation: `slideInLeft 0.4s ${i * 0.08}s both`, opacity: 0 }}
                onClick={() => setMenuOpen(false)}>{item}</a>
            ))}
          </div>
        )}

        {/* ─── HERO ──────────────────────────────────── */}
        <section style={{
          position: "relative", minHeight: "100vh",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          padding: "100px 24px 60px", textAlign: "center",
          background: t.heroBg, backgroundSize: "300% 300%",
          animation: "gradientShift 12s ease infinite", transition: "all 0.6s ease",
        }}>
          <Particles />

          <div style={{ position: "relative", zIndex: 2 }}>
            <div style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0) scale(1)" : "translateY(20px) scale(0.9)",
              transition: "all 1s cubic-bezier(.23,1,.32,1) 0.2s",
            }}><Snoo size={72} /></div>

            <div style={{
              marginTop: 28, opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.9s cubic-bezier(.23,1,.32,1) 0.5s",
            }}>
              <SectionLabel style={{ marginBottom: 16 }}>We're hiring</SectionLabel>

              <h1 style={{
                fontSize: "clamp(36px, 10vw, 52px)", fontWeight: 900,
                lineHeight: 1.1, letterSpacing: "-0.03em",
                maxWidth: 400, margin: "0 auto", transition: "color 0.4s ease",
              }}>
                <ChatType text="Build the" as="span" trigger="appear" speed={20} appearDelay={600}
                  style={{ display: "block", lineHeight: 1.1 }} />
                <ChatType text="front page" as="span" trigger="appear" speed={22} dotDuration={120} appearDelay={1000}
                  style={{ display: "block", lineHeight: 1.1 }}
                  gradientStyle={{
                    background: `linear-gradient(135deg, ${BRAND.orangered}, ${BRAND.upvote}, ${BRAND.karma})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                    backgroundSize: "200% auto", animation: "gradientShift 4s ease infinite",
                  }} />
                <ChatType text="of the internet." as="span" trigger="appear" speed={18} dotDuration={100} appearDelay={1500}
                  style={{ display: "block", lineHeight: 1.1 }} />
              </h1>
            </div>

            <p style={{
              marginTop: 20, fontSize: 16, lineHeight: 1.6, color: t.textSecondary,
              maxWidth: 340, marginLeft: "auto", marginRight: "auto",
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(.23,1,.32,1) 0.8s, color 0.4s ease",
            }}>
              Join the team that keeps 52M+ daily users talking, laughing, learning, and belonging.
            </p>

            <div style={{
              marginTop: 32, display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap",
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(20px)",
              transition: "all 0.8s cubic-bezier(.23,1,.32,1) 1.1s",
            }}>
              <a href="#openroles" style={{ textDecoration: "none" }}>
                <button style={{
                  background: `linear-gradient(135deg, ${BRAND.orangered}, ${BRAND.deepOrange})`,
                  color: "white", border: "none", padding: "14px 28px",
                  borderRadius: 99, fontWeight: 800, fontSize: 15, cursor: "pointer",
                  letterSpacing: "0.02em", fontFamily: "'Reddit Sans', sans-serif",
                  position: "relative", overflow: "hidden",
                  boxShadow: "0 4px 20px rgba(255,69,0,0.3)",
                }}>
                  <span style={{ position: "relative", zIndex: 1 }}>View Open Roles ↓</span>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite",
                  }} />
                </button>
              </a>
              <button style={{
                background: "transparent", color: t.text,
                border: `2px solid ${mode === "dark" ? "rgba(255,69,0,0.5)" : "rgba(255,69,0,0.4)"}`,
                padding: "13px 26px", borderRadius: 99, fontWeight: 700, fontSize: 15,
                cursor: "pointer", fontFamily: "'Reddit Sans', sans-serif",
                transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
              }}>Our Story</button>
            </div>
          </div>

          <div style={{
            marginTop: 60, display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 8, width: "100%", maxWidth: 400,
            opacity: heroLoaded ? 1 : 0, transition: "all 0.8s ease 1.4s",
          }}>
            <UpvoteCounter target={2200} label="Redditors on team" />
            <UpvoteCounter target={52} label="M daily actives" />
            <UpvoteCounter target={100} label="K+ communities" />
          </div>

          <div style={{
            position: "absolute", bottom: 30, left: "50%",
            transform: "translateX(-50%)", animation: "bobble 2.5s ease-in-out infinite",
            opacity: 0.4, fontSize: 24, color: t.textMuted,
          }}>↓</div>
        </section>

        <Divider />

        {/* ─── VALUES ────────────────────────────────── */}
        <section id="ourvalues" style={{ padding: "60px 20px" }}>
          <AnimSection>
            <SectionLabel>Our Values</SectionLabel>
            <ChatType text="What we believe in" as="h2" trigger="appear" speed={16}
              style={{ fontSize: 28, fontWeight: 900, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 8, lineHeight: 1.2, transition: "color 0.4s ease" }} />
            <p style={{ textAlign: "center", color: t.textMuted, fontSize: 14, maxWidth: 320, margin: "0 auto 28px", transition: "color 0.4s ease" }}>
              The principles that guide how we build, ship, and show up for each other.
            </p>
          </AnimSection>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 420, margin: "0 auto" }}>
            {VALUES.map((v, i) => (
              <AnimSection key={i} delay={i * 0.1}>
                <div style={{
                  background: t.valueBg, border: `1px solid ${t.border}`,
                  borderRadius: 20, padding: "28px 22px",
                  transition: "all 0.4s cubic-bezier(.23,1,.32,1)",
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{v.icon}</div>
                  <ChatType text={v.title} as="h3" trigger="hover" speed={14}
                    style={{ fontSize: 15, fontWeight: 800, marginBottom: 8, lineHeight: 1.2 }} />
                  <p style={{ fontSize: 12.5, color: t.textMuted, lineHeight: 1.55, transition: "color 0.4s ease" }}>{v.desc}</p>
                </div>
              </AnimSection>
            ))}
          </div>
        </section>

        <Divider />

        {/* ─── OPEN ROLES ────────────────────────────── */}
        <section id="openroles" style={{ padding: "60px 20px" }}>
          <AnimSection>
            <SectionLabel>Open Roles</SectionLabel>
            <ChatType text="Find your subreddit" as="h2" trigger="appear" speed={16}
              style={{ fontSize: 28, fontWeight: 900, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 24, lineHeight: 1.2, transition: "color 0.4s ease" }} />
          </AnimSection>

          <AnimSection delay={0.15}>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 20, scrollbarWidth: "none" }}>
              {teams.map((tm) => (
                <button key={tm} onClick={() => setFilter(tm)} style={{
                  padding: "8px 18px", borderRadius: 99, fontSize: 13, fontWeight: 700,
                  border: `1.5px solid ${filter === tm ? BRAND.orangered : t.chipBorder}`,
                  background: filter === tm ? BRAND.orangered : t.chipBg,
                  color: filter === tm ? "white" : t.chipText,
                  cursor: "pointer", fontFamily: "'Reddit Sans', sans-serif", whiteSpace: "nowrap",
                  boxShadow: filter === tm ? "0 4px 16px rgba(255,69,0,0.35)" : "none",
                  transition: "all 0.3s ease",
                }}>{tm}</button>
              ))}
            </div>
          </AnimSection>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 420, margin: "0 auto" }}>
            {filtered.map((job, i) => (
              <AnimSection key={job.title} delay={i * 0.06}>
                <JobCard job={job} />
              </AnimSection>
            ))}
          </div>

          <AnimSection delay={0.3}>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <button style={{
                background: `linear-gradient(135deg, ${BRAND.orangered}, ${BRAND.deepOrange})`,
                color: "white", border: "none", padding: "14px 28px",
                borderRadius: 99, fontWeight: 800, fontSize: 15, cursor: "pointer",
                fontFamily: "'Reddit Sans', sans-serif",
                boxShadow: "0 4px 20px rgba(255,69,0,0.3)",
              }}>See All {JOBS.length}+ Openings</button>
            </div>
          </AnimSection>
        </section>

        <Divider />

        {/* ─── PERKS ─────────────────────────────────── */}
        <section id="benefits" style={{ padding: "60px 20px" }}>
          <AnimSection>
            <SectionLabel>Benefits</SectionLabel>
            <ChatType text="The good stuff" as="h2" trigger="appear" speed={18}
              style={{ fontSize: 28, fontWeight: 900, textAlign: "center", letterSpacing: "-0.02em", marginBottom: 28, lineHeight: 1.2, transition: "color 0.4s ease" }} />
          </AnimSection>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 420, margin: "0 auto" }}>
            {PERKS.map((p, i) => (
              <AnimSection key={i} delay={i * 0.06}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 12, padding: "14px 18px",
                  background: t.surface, borderRadius: 12, border: `1px solid ${t.borderSubtle}`,
                  transition: "all 0.3s ease",
                }}>
                  <span style={{ fontSize: 22 }}>{p.emoji}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.35 }}>{p.label}</span>
                </div>
              </AnimSection>
            ))}
          </div>
        </section>

        <Divider />

        {/* ─── TESTIMONIALS ──────────────────────────── */}
        <section id="stories" style={{ padding: "60px 0" }}>
          <AnimSection>
            <SectionLabel style={{ padding: "0 20px" }}>From the Community</SectionLabel>
            <ChatType text="Redditors tell it like it is" as="h2" trigger="appear" speed={14}
              style={{
                fontSize: 28, fontWeight: 900, textAlign: "center",
                letterSpacing: "-0.02em", marginBottom: 24, padding: "0 20px", lineHeight: 1.2,
              }} />
          </AnimSection>

          <div className="scroll-track">
            {TESTIMONIALS.map((tst, i) => (
              <AnimSection key={i} delay={i * 0.12}>
                <div style={{
                  background: t.surface, border: `1px solid ${t.border}`,
                  borderRadius: 20, padding: 24,
                  minWidth: 280, maxWidth: 300, flexShrink: 0, scrollSnapAlign: "start",
                  transition: "all 0.4s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div style={{
                      width: 42, height: 42, borderRadius: "50%",
                      background: `linear-gradient(135deg, ${BRAND.orangered}, ${BRAND.upvote})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontWeight: 900, fontSize: 18, color: "#FFF",
                    }}>{tst.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 14 }}>{tst.name}</div>
                      <div style={{ fontSize: 12, color: t.textMuted }}>{tst.role}</div>
                    </div>
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.6, color: t.testimonialText, fontStyle: "italic" }}>
                    "{tst.text}"
                  </p>
                  <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 6, color: BRAND.orangered, fontSize: 13, fontWeight: 700 }}>
                    ⬆ {120 + i * 47} upvotes
                  </div>
                </div>
              </AnimSection>
            ))}
          </div>
        </section>

        <Divider />

        {/* ─── CTA ───────────────────────────────────── */}
        <section id="apply" style={{
          padding: "80px 24px", textAlign: "center", position: "relative",
          background: mode === "dark"
            ? "linear-gradient(180deg, transparent, rgba(255,69,0,0.03))"
            : "linear-gradient(180deg, transparent, rgba(255,69,0,0.02))",
        }}>
          <Particles />
          <AnimSection>
            <div style={{ position: "relative", zIndex: 2 }}>
              <Snoo size={56} />
              <h2 style={{ fontSize: 30, fontWeight: 900, marginTop: 20, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                <ChatType text="Ready to join" as="span" trigger="appear" speed={18}
                  style={{ display: "block", lineHeight: 1.15 }} />
                <ChatType text="the conversation?" as="span" trigger="appear" speed={16} dotDuration={120} appearDelay={400}
                  style={{ display: "block", lineHeight: 1.15 }}
                  gradientStyle={{
                    background: `linear-gradient(135deg, ${BRAND.orangered}, ${BRAND.karma})`,
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }} />
              </h2>
              <p style={{
                color: t.textMuted, fontSize: 15, marginTop: 14,
                maxWidth: 300, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6,
              }}>
                There's a place for you here. Come help us build something that matters.
              </p>
              <div style={{ marginTop: 28 }}>
                <button style={{
                  background: `linear-gradient(135deg, ${BRAND.orangered}, ${BRAND.deepOrange})`,
                  color: "white", border: "none", padding: "16px 36px",
                  borderRadius: 99, fontWeight: 800, fontSize: 16,
                  cursor: "pointer", fontFamily: "'Reddit Sans', sans-serif",
                  boxShadow: "0 4px 24px rgba(255,69,0,0.35)",
                  position: "relative", overflow: "hidden",
                }}>
                  <span style={{ position: "relative", zIndex: 1 }}>Apply Now 🚀</span>
                  <div style={{
                    position: "absolute", inset: 0,
                    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                    backgroundSize: "200% 100%", animation: "shimmer 3s ease-in-out infinite",
                  }} />
                </button>
              </div>
            </div>
          </AnimSection>
        </section>

        {/* ─── FOOTER ────────────────────────────────── */}
        <footer style={{ padding: "32px 20px", borderTop: `1px solid ${t.borderSubtle}`, textAlign: "center" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 14 }}>
            <Snoo size={24} />
            <span style={{ fontWeight: 800, fontSize: 14 }}>reddit</span>
          </div>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
            {["About", "Blog", "Press", "Careers", "Advertise"].map((item) => (
              <a key={item} href="#" style={{ color: t.textMuted, fontSize: 13, textDecoration: "none", fontWeight: 600 }}>{item}</a>
            ))}
          </div>
          <p style={{ fontSize: 12, color: t.textFaint }}>© 2026 Reddit, Inc. All rights reserved.</p>
        </footer>
      </div>
    </ThemeCtx.Provider>
  );
}
