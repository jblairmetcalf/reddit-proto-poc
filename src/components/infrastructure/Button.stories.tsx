import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Button from "./Button";

const meta = {
  title: "Infrastructure/Button",
  component: Button,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: "Add Prototyper" },
};

export const Secondary: Story = {
  args: { variant: "secondary", children: "Cancel" },
};

export const Danger: Story = {
  args: { variant: "danger", children: "Delete Study" },
};

export const Ghost: Story = {
  args: { variant: "ghost", children: "Edit" },
};

export const GhostDangerHover: Story = {
  name: "Ghost (danger hover)",
  args: { variant: "ghost", dangerHover: true, children: "Delete" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Preview" },
};

export const Small: Story = {
  args: { size: "sm", children: "Preview" },
};

export const SmallOutline: Story = {
  name: "Small outline",
  args: { size: "sm", variant: "outline", children: "Create Study" },
};

export const Disabled: Story = {
  args: { children: "Save", disabled: true },
};

export const AllVariants: Story = {
  name: "All variants",
  args: { children: "Primary" },
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="danger">Danger</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="ghost" dangerHover>
        Ghost Delete
      </Button>
      <Button variant="outline">Outline</Button>
    </div>
  ),
};
