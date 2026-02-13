import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import BrandButton from "./BrandButton";

const meta = {
  title: "Brand/BrandButton",
  component: BrandButton,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { onClick: fn() },
} satisfies Meta<typeof BrandButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const GradientCTA: Story = {
  name: "Gradient CTA",
  args: { children: "Get Started" },
};

export const OutlinePill: Story = {
  name: "Outline pill",
  args: { variant: "outline", children: "Learn More" },
};

export const CTAPair: Story = {
  name: "CTA pair",
  args: { children: "" },
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <BrandButton>View Prototypes ↓</BrandButton>
      <BrandButton variant="outline">Our Approach</BrandButton>
    </div>
  ),
};

export const LargeCTA: Story = {
  name: "Large CTA",
  args: {
    children: "Launch Prototype",
    style: { padding: "16px 36px", fontSize: 16 },
  },
};
