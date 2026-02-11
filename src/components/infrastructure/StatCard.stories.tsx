import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import StatCard from "./StatCard";

const meta = {
  title: "Infrastructure/StatCard",
  component: StatCard,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: 250 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof StatCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Total Events", value: 1234 },
};

export const StringValue: Story = {
  args: { label: "Prototype", value: "Feed Sorting v2" },
};

export const WithChildren: Story = {
  args: {
    label: "Prototype",
    value: "Compact Feed",
  },
  render: (args) => (
    <StatCard {...args}>
      <button className="mt-2 inline-block rounded-lg border border-edge-strong px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-orange-500 hover:text-orange-400">
        Preview
      </button>
    </StatCard>
  ),
};

export const StatsRow: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 700 }}>
        <Story />
      </div>
    ),
  ],
  render: () => (
    <div className="grid gap-4 sm:grid-cols-3">
      <StatCard label="Prototype" value="Feed Sorting v2" />
      <StatCard label="Participants" value={12} />
      <StatCard label="Events Tracked" value={847} />
    </div>
  ),
};
