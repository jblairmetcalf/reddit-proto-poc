import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Particles from "./Particles";

const meta = {
  title: "Brand/Particles",
  component: Particles,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div
        style={{
          position: "relative",
          height: 400,
          background: "var(--brand-hero-bg)",
          backgroundSize: "300% 300%",
          animation: "brand-gradient-shift 12s ease infinite",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Particles>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Rising: Story = {
  args: { count: 18, mode: "rise" },
};

export const Floating: Story = {
  args: { count: 14, mode: "float" },
};
