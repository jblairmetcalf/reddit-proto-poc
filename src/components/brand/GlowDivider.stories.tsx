import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import GlowDivider from "./GlowDivider";

const meta = {
  title: "Brand/GlowDivider",
  component: GlowDivider,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof GlowDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const BetweenSections: Story = {
  name: "Between sections",
  args: {},
  render: () => (
    <div>
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--brand-text)",
          fontWeight: 800,
          fontSize: 20,
        }}
      >
        Section One
      </div>
      <GlowDivider />
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--brand-text)",
          fontWeight: 800,
          fontSize: 20,
        }}
      >
        Section Two
      </div>
      <GlowDivider />
      <div
        style={{
          padding: 32,
          textAlign: "center",
          color: "var(--brand-text)",
          fontWeight: 800,
          fontSize: 20,
        }}
      >
        Section Three
      </div>
    </div>
  ),
};
