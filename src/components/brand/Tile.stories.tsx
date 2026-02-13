import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Tile from "./Tile";
import AnimSection from "./AnimSection";

const meta = {
  title: "Brand/Tile",
  component: Tile,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 320 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Tile>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "👤",
    title: "Prototypers",
    description:
      "Create and manage prototyper profiles and their prototype portfolios.",
    onClick: fn(),
  },
};

export const Studies: Story = {
  args: {
    icon: "🔬",
    title: "User Studies",
    description:
      "Run studies and track real-time participant insights across prototype variants.",
    onClick: fn(),
  },
};

export const TileGrid: Story = {
  name: "Tile grid",
  args: { title: "" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 700 }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const tiles = [
      {
        icon: "💬",
        title: "Rapid Prototyping",
        description:
          "Spin up high-fidelity prototypes in hours, not weeks. Test ideas before they ship.",
      },
      {
        icon: "🔥",
        title: "Live Testing",
        description:
          "Watch real participants interact with your prototype. Every tap, scroll, and pause tracked.",
      },
      {
        icon: "🤝",
        title: "Team Collaboration",
        description:
          "Share prototypes, review insights together, and align on what to build next.",
      },
      {
        icon: "🧠",
        title: "AI Summaries",
        description:
          "Get instant AI-powered session summaries. Spot patterns humans might miss.",
      },
    ];
    return (
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        {tiles.map((t, i) => (
          <AnimSection key={t.title} delay={i * 0.1}>
            <Tile {...t} />
          </AnimSection>
        ))}
      </div>
    );
  },
};
