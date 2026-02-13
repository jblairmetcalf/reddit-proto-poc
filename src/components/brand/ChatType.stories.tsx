import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import ChatType from "./ChatType";

const meta = {
  title: "Brand/ChatType",
  component: ChatType,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ChatType>;

export default meta;
type Story = StoryObj<typeof meta>;

export const AppearOnScroll: Story = {
  name: "Appear on scroll",
  args: {
    text: "Prototype the future",
    trigger: "appear",
    speed: 20,
    style: {
      fontSize: "clamp(28px, 8vw, 48px)",
      fontWeight: 900,
      letterSpacing: "-0.03em",
      color: "var(--brand-text)",
    },
  },
};

export const HoverToType: Story = {
  name: "Hover to type",
  args: {
    text: "Ship experiences that matter",
    trigger: "hover",
    speed: 14,
    style: {
      fontSize: 18,
      fontWeight: 800,
      color: "var(--brand-text)",
      cursor: "default",
    },
  },
};

export const WithGradient: Story = {
  name: "Gradient text",
  args: {
    text: "Reddit Proto",
    trigger: "appear",
    speed: 22,
    style: {
      fontSize: 48,
      fontWeight: 900,
      letterSpacing: "-0.03em",
      display: "block",
      lineHeight: 1.1,
    },
    gradientStyle: {
      background:
        "linear-gradient(135deg, var(--brand-orangered), var(--brand-upvote), var(--brand-karma))",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundSize: "200% auto",
      animation: "brand-gradient-shift 4s ease infinite",
    },
  },
};

export const MultiLine: Story = {
  name: "Multi-line hero",
  args: { text: "" },
  render: () => (
    <div style={{ textAlign: "center" }}>
      <h1
        style={{
          fontSize: "clamp(32px, 8vw, 48px)",
          fontWeight: 900,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: "var(--brand-text)",
        }}
      >
        <ChatType
          text="Ship experiences"
          trigger="appear"
          speed={20}
          appearDelay={200}
          style={{ display: "block", lineHeight: 1.1 }}
        />
        <ChatType
          text="that matter."
          trigger="appear"
          speed={18}
          appearDelay={800}
          style={{ display: "block", lineHeight: 1.1 }}
          gradientStyle={{
            background:
              "linear-gradient(135deg, var(--brand-orangered), var(--brand-karma))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        />
      </h1>
    </div>
  ),
};
