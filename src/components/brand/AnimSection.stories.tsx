import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AnimSection from "./AnimSection";

const meta = {
  title: "Brand/AnimSection",
  component: AnimSection,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof AnimSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div
        style={{
          padding: 32,
          borderRadius: 16,
          background: "var(--brand-surface)",
          border: "1px solid var(--brand-border)",
          color: "var(--brand-text)",
          textAlign: "center",
        }}
      >
        <h3 style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
          Scroll-triggered fade-in
        </h3>
        <p style={{ color: "var(--brand-text-muted)", fontSize: 14 }}>
          This block fades in and slides up when it enters the viewport.
        </p>
      </div>
    ),
  },
};

export const StaggeredList: Story = {
  name: "Staggered list",
  args: { children: null },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {["Prototypers", "Prototypes", "Studies", "Live Dashboard"].map(
        (label, i) => (
          <AnimSection key={label} delay={i * 0.1}>
            <div
              style={{
                padding: 20,
                borderRadius: 12,
                background: "var(--brand-surface)",
                border: "1px solid var(--brand-border)",
                color: "var(--brand-text)",
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              {label}
            </div>
          </AnimSection>
        )
      )}
    </div>
  ),
};
