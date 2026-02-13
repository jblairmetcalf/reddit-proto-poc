import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import HeroSection from "./HeroSection";
import AnimSection from "./AnimSection";
import SectionLabel from "./SectionLabel";
import ChatType from "./ChatType";
import GlowDivider from "./GlowDivider";
import Tile from "./Tile";
import PillTabs from "./PillTabs";
import ListItem from "./ListItem";
import CommentCard from "./CommentCard";
import BrandButton from "./BrandButton";
import Particles from "./Particles";

const meta = {
  title: "Brand/Compositions",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const FullPage: Story = {
  name: "Full page composition",
  render: () => {
    const [filter, setFilter] = useState("All");

    const prototypes = [
      { category: "Design", title: "Feed Sorting Prototype", meta: ["Blair Metcalf", "Modified today"], chips: [{ label: "Active", variant: "remote" as const }] },
      { category: "Engineering", title: "Compact Feed Layout v3", meta: ["Alex Chen", "Modified 3 days ago"], badges: [{ label: "🔥 Hot", pulse: true }], chips: [{ label: "Coded", variant: "hybrid" as const }] },
      { category: "Product", title: "Notification Tray Redesign", meta: ["Priya Sharma", "Modified last week"], chips: [{ label: "Draft", variant: "default" as const }] },
      { category: "Research", title: "Onboarding Flow Study", meta: ["Jordan Lee", "Modified 2 weeks ago"], chips: [{ label: "Complete", variant: "remote" as const }] },
    ];

    const filtered = filter === "All" ? prototypes : prototypes.filter((p) => p.category === filter);

    return (
      <div style={{ background: "var(--brand-bg)", color: "var(--brand-text)", minHeight: "100vh" }}>
        {/* Hero */}
        <HeroSection
          label="Reddit Proto"
          headline={["Ship experiences", "that matter."]}
          gradientLine={1}
          subtitle="Your workspace for prototyping, testing, and shipping Reddit experiences at scale."
          ctaLabel="View Prototypes ↓"
          secondaryCtaLabel="Our Approach"
        />

        <GlowDivider />

        {/* Values / Features */}
        <section style={{ padding: "60px 20px" }}>
          <AnimSection>
            <SectionLabel>Why Reddit Proto</SectionLabel>
            <ChatType
              text="Built for speed and clarity"
              trigger="appear"
              speed={16}
              style={{
                fontSize: 28,
                fontWeight: 900,
                textAlign: "center",
                letterSpacing: "-0.02em",
                marginBottom: 8,
                lineHeight: 1.2,
                display: "block",
                color: "var(--brand-text)",
              }}
            />
            <p style={{ textAlign: "center", color: "var(--brand-text-muted)", fontSize: 14, maxWidth: 360, margin: "0 auto 28px" }}>
              Everything you need to go from idea to insight, without the overhead.
            </p>
          </AnimSection>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, maxWidth: 480, margin: "0 auto" }}>
            {[
              { icon: "💬", title: "Rapid Prototyping", description: "Spin up high-fidelity prototypes in hours, not weeks. Test ideas before they ship." },
              { icon: "🔥", title: "Live Testing", description: "Watch real participants interact with your prototype. Every tap, scroll, and pause tracked." },
              { icon: "🤝", title: "Team Collaboration", description: "Share prototypes, review insights together, and align on what to build next." },
              { icon: "🧠", title: "AI Summaries", description: "Get instant AI-powered session summaries. Spot patterns humans might miss." },
            ].map((t, i) => (
              <AnimSection key={t.title} delay={i * 0.1}>
                <Tile {...t} />
              </AnimSection>
            ))}
          </div>
        </section>

        <GlowDivider />

        {/* Prototypes List */}
        <section style={{ padding: "60px 20px" }}>
          <AnimSection>
            <SectionLabel>Prototypes</SectionLabel>
            <ChatType
              text="Explore what's in progress"
              trigger="appear"
              speed={16}
              style={{
                fontSize: 28,
                fontWeight: 900,
                textAlign: "center",
                letterSpacing: "-0.02em",
                marginBottom: 24,
                lineHeight: 1.2,
                display: "block",
                color: "var(--brand-text)",
              }}
            />
          </AnimSection>

          <AnimSection delay={0.15}>
            <div style={{ maxWidth: 480, margin: "0 auto 20px" }}>
              <PillTabs
                items={["All", "Design", "Engineering", "Product", "Research"]}
                value={filter}
                onChange={setFilter}
              />
            </div>
          </AnimSection>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 480, margin: "0 auto" }}>
            {filtered.map((item, i) => (
              <AnimSection key={item.title} delay={i * 0.06}>
                <ListItem {...item} onClick={() => {}} />
              </AnimSection>
            ))}
          </div>

          <AnimSection delay={0.3}>
            <div style={{ textAlign: "center", marginTop: 28 }}>
              <BrandButton>See All Prototypes</BrandButton>
            </div>
          </AnimSection>
        </section>

        <GlowDivider />

        {/* Comments / Testimonials */}
        <section style={{ padding: "60px 0" }}>
          <AnimSection>
            <SectionLabel style={{ padding: "0 20px" }}>From the Team</SectionLabel>
            <ChatType
              text="What prototypers are saying"
              trigger="appear"
              speed={14}
              style={{
                fontSize: 28,
                fontWeight: 900,
                textAlign: "center",
                letterSpacing: "-0.02em",
                marginBottom: 24,
                padding: "0 20px",
                lineHeight: 1.2,
                display: "block",
                color: "var(--brand-text)",
              }}
            />
          </AnimSection>

          <div style={{ display: "flex", gap: 16, overflowX: "auto", scrollSnapType: "x mandatory", padding: "10px 20px 20px", scrollbarWidth: "none" }}>
            {[
              { name: "u/blair_ux", role: "Lead Prototyper, 2 yrs", avatar: "B", text: "This platform changed how we ship prototypes. From concept to user test in a day — not a sprint.", upvotes: 142 },
              { name: "u/priya_research", role: "UX Researcher, 3 yrs", avatar: "P", text: "Running moderated and unmoderated studies from one place? With real-time events? Yes please.", upvotes: 89 },
              { name: "u/jordan_pm", role: "Product Manager", avatar: "J", text: "The AI summaries save me hours of session review. I get the signal without watching every recording.", upvotes: 167 },
            ].map((c, i) => (
              <AnimSection key={c.name} delay={i * 0.12}>
                <CommentCard {...c} style={{ minWidth: 280, maxWidth: 300, flexShrink: 0, scrollSnapAlign: "start" }} />
              </AnimSection>
            ))}
          </div>
        </section>

        <GlowDivider />

        {/* CTA */}
        <section style={{ padding: "80px 24px", textAlign: "center", position: "relative", background: "var(--brand-bg)" }}>
          <Particles mode="float" count={10} />
          <AnimSection>
            <div style={{ position: "relative", zIndex: 2 }}>
              <h2 style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1.15 }}>
                <ChatType text="Ready to ship" trigger="appear" speed={18} style={{ display: "block", lineHeight: 1.15 }} />
                <ChatType
                  text="something great?"
                  trigger="appear"
                  speed={16}
                  appearDelay={400}
                  style={{ display: "block", lineHeight: 1.15 }}
                  gradientStyle={{
                    background: "linear-gradient(135deg, var(--brand-orangered), var(--brand-karma))",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                />
              </h2>
              <p style={{ color: "var(--brand-text-muted)", fontSize: 15, marginTop: 14, maxWidth: 300, marginLeft: "auto", marginRight: "auto", lineHeight: 1.6 }}>
                Your next prototype is one click away. Let&apos;s make it count.
              </p>
              <div style={{ marginTop: 28 }}>
                <BrandButton style={{ padding: "16px 36px", fontSize: 16 }}>
                  Get Started
                </BrandButton>
              </div>
            </div>
          </AnimSection>
        </section>
      </div>
    );
  },
};

export const Typography: Story = {
  name: "Typography scale",
  render: () => (
    <div style={{ padding: 40, maxWidth: 600, color: "var(--brand-text)" }}>
      <SectionLabel align="left" style={{ marginBottom: 24 }}>Typography</SectionLabel>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Hero — clamp(36px, 10vw, 52px) / 900 / -0.03em</span>
          <h1 style={{ fontSize: "clamp(36px, 10vw, 52px)", fontWeight: 900, lineHeight: 1.1, letterSpacing: "-0.03em", marginTop: 4 }}>
            Ship experiences
          </h1>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Section heading — 28px / 900 / -0.02em</span>
          <h2 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.02em", marginTop: 4 }}>
            Built for speed and clarity
          </h2>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Card title — 16px / 800 / normal</span>
          <h3 style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.3, marginTop: 4 }}>
            Feed Sorting Prototype
          </h3>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Tile title — 15px / 800 / normal</span>
          <h4 style={{ fontSize: 15, fontWeight: 800, lineHeight: 1.2, marginTop: 4 }}>
            Rapid Prototyping
          </h4>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Body — 16px / 400 / 1.6</span>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: "var(--brand-text-secondary)", marginTop: 4 }}>
            Your workspace for prototyping, testing, and shipping Reddit experiences at scale. From concept to user test in a day.
          </p>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Description — 12.5px / 400 / 1.55</span>
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--brand-text-muted)", marginTop: 4 }}>
            Spin up high-fidelity prototypes in hours, not weeks. Test ideas before they ship to millions.
          </p>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Section label — 11px / 800 / 0.16em / uppercase</span>
          <div style={{ marginTop: 4 }}>
            <SectionLabel align="left">Operations</SectionLabel>
          </div>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Category — 11px / 700 / 0.04em / uppercase</span>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--brand-aqua)", marginTop: 4 }}>
            Engineering
          </p>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Meta — 12px / 400</span>
          <p style={{ fontSize: 12, color: "var(--brand-text-muted)", marginTop: 4 }}>
            Blair Metcalf &middot; Modified today
          </p>
        </div>

        <div>
          <span style={{ fontSize: 11, color: "var(--brand-text-faint)", fontWeight: 600 }}>Gradient text</span>
          <p style={{
            fontSize: 36, fontWeight: 900, letterSpacing: "-0.03em", marginTop: 4,
            background: "linear-gradient(135deg, var(--brand-orangered), var(--brand-upvote), var(--brand-karma))",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundSize: "200% auto", animation: "brand-gradient-shift 4s ease infinite",
          }}>
            that matter.
          </p>
        </div>
      </div>
    </div>
  ),
};
