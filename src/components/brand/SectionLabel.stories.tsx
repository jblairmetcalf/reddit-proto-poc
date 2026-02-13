import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import SectionLabel from "./SectionLabel";

const meta = {
  title: "Brand/SectionLabel",
  component: SectionLabel,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof SectionLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Centered: Story = {
  args: { children: "Operations" },
};

export const LeftAligned: Story = {
  name: "Left with bar",
  args: { children: "Development", align: "left" },
};

export const AllLabels: Story = {
  name: "All section labels",
  args: { children: "" },
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24, minWidth: 300 }}>
      <SectionLabel>Operations</SectionLabel>
      <SectionLabel>Development</SectionLabel>
      <SectionLabel align="left">Prototypers</SectionLabel>
      <SectionLabel align="left">User Studies</SectionLabel>
    </div>
  ),
};
