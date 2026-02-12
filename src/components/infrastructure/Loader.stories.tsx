import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Loader from "./Loader";

const meta = {
  title: "Infrastructure/Loader",
  component: Loader,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Loader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Small: Story = {
  args: { size: 60 },
};

export const Large: Story = {
  args: { size: 200 },
};

export const FullPage: Story = {
  args: { className: "min-h-[400px]" },
  decorators: [
    (Story) => (
      <div style={{ width: 600, height: 400, background: "var(--background)" }}>
        <Story />
      </div>
    ),
  ],
};
