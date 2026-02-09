import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { BottomNav } from "./BottomNav";

const meta = {
  title: "Reddit/BottomNav",
  component: BottomNav,
  parameters: {
    layout: "centered",
    backgrounds: { disable: true },
  },
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 390, width: "100%" }}>
        <Story />
      </div>
    ),
  ],
  args: {
    onTabChange: fn(),
  },
} satisfies Meta<typeof BottomNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Home: Story = {
  args: {
    activeTab: "home",
  },
};

export const Communities: Story = {
  args: {
    activeTab: "communities",
  },
};

export const Notifications: Story = {
  args: {
    activeTab: "notifications",
  },
};

export const Profile: Story = {
  args: {
    activeTab: "profile",
  },
};
