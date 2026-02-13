import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import ListItem from "./ListItem";
import AnimSection from "./AnimSection";

const meta = {
  title: "Brand/ListItem",
  component: ListItem,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 440 }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    category: "Design",
    title: "Feed Sorting Prototype",
    meta: ["Blair Metcalf", "Modified 2 days ago"],
    chips: [{ label: "Active", variant: "remote" }],
    onClick: fn(),
  },
};

export const WithBadge: Story = {
  name: "With hot badge",
  args: {
    category: "Engineering",
    title: "Compact Feed Layout v3",
    meta: ["San Francisco, CA"],
    badges: [{ label: "🔥 Hot", pulse: true }],
    chips: [{ label: "Coded", variant: "hybrid" }],
    onClick: fn(),
  },
};

export const PrototypeList: Story = {
  name: "Prototype list",
  args: { title: "" },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 440 }}>
        <Story />
      </div>
    ),
  ],
  render: () => {
    const items = [
      {
        category: "Design",
        title: "Feed Sorting Prototype",
        meta: ["Blair Metcalf", "Modified today"],
        chips: [
          { label: "Active", variant: "remote" as const },
          { label: "Link", variant: "default" as const },
        ],
      },
      {
        category: "Engineering",
        title: "Compact Feed Layout v3",
        meta: ["Alex Chen", "Modified 3 days ago"],
        badges: [{ label: "🔥 Hot", pulse: true }],
        chips: [{ label: "Coded", variant: "hybrid" as const }],
      },
      {
        category: "Product",
        title: "Notification Tray Redesign",
        meta: ["Priya Sharma", "Modified last week"],
        chips: [
          { label: "Draft", variant: "default" as const },
          { label: "Uploaded", variant: "default" as const },
        ],
      },
      {
        category: "Research",
        title: "Onboarding Flow Study",
        meta: ["Jordan Lee", "Modified 2 weeks ago"],
        chips: [{ label: "Complete", variant: "remote" as const }],
      },
    ];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {items.map((item, i) => (
          <AnimSection key={item.title} delay={i * 0.06}>
            <ListItem {...item} onClick={() => {}} />
          </AnimSection>
        ))}
      </div>
    );
  },
};
