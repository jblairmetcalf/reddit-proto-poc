import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import PageHeader from "./PageHeader";
import Button from "./Button";

const meta = {
  title: "Infrastructure/PageHeader",
  component: PageHeader,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
} satisfies Meta<typeof PageHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Prototypers",
    description: "Manage prototypers and their prototype portfolios",
    actions: <Button>Add Prototyper</Button>,
  },
};

export const WithBackLink: Story = {
  name: "With back link",
  args: {
    backHref: "/",
    backLabel: "Dashboard",
    title: "Prototypers",
    description: "Manage prototypers and their prototype portfolios",
    actions: <Button>Add Prototyper</Button>,
  },
};

export const WithBadge: Story = {
  name: "With badge",
  args: {
    backHref: "/user-research/studies",
    backLabel: "Studies",
    title: "Feed Sorting Experiment",
    badge: (
      <span className="rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
        Active
      </span>
    ),
    description: "Testing feed sorting algorithm preferences",
  },
};

export const TitleOnly: Story = {
  name: "Title only",
  args: {
    title: "Studies",
  },
};

export const FullExample: Story = {
  name: "Full example",
  args: {
    backHref: "/",
    backLabel: "Dashboard",
    title: "Studies",
    description: "Create and manage UX research studies",
    actions: (
      <>
        <Button variant="outline">Export</Button>
        <Button>New Study</Button>
      </>
    ),
  },
};
