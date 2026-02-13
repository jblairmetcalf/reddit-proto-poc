import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import PillTabs from "./PillTabs";

const meta = {
  title: "Brand/PillTabs",
  component: PillTabs,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof PillTabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: ["All", "Active", "Draft", "Complete"],
    value: "All",
    onChange: () => {},
  },
};

export const PrototypeFilter: Story = {
  name: "Prototype filter",
  args: { items: [], value: "", onChange: () => {} },
  render: () => {
    const [value, setValue] = useState("All");
    return (
      <PillTabs
        items={["All", "Link", "Uploaded", "Coded"]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const TeamFilter: Story = {
  name: "Team filter",
  args: { items: [], value: "", onChange: () => {} },
  render: () => {
    const [value, setValue] = useState("All");
    return (
      <PillTabs
        items={["All", "Design", "Engineering", "Product", "Research"]}
        value={value}
        onChange={setValue}
      />
    );
  },
};

export const StatusFilter: Story = {
  name: "Study status",
  args: { items: [], value: "", onChange: () => {} },
  render: () => {
    const [value, setValue] = useState("All");
    return (
      <PillTabs
        items={["All", "Draft", "Recruiting", "In Progress", "Complete"]}
        value={value}
        onChange={setValue}
      />
    );
  },
};
