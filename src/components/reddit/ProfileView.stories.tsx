import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ProfileView } from "./ProfileView";

const meta = {
  title: "Reddit/ProfileView",
  component: ProfileView,
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
    onSavedPosts: fn(),
    onHistory: fn(),
    onAchievements: fn(),
  },
} satisfies Meta<typeof ProfileView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const PowerUser: Story = {
  args: {
    username: "u/BlairMetcalf",
    karma: "125.3k",
    accountAge: "8y",
    postCount: 892,
    commentCount: "12.4k",
    awardCount: 156,
  },
};

export const NewUser: Story = {
  args: {
    username: "u/NewRedditor2024",
    karma: "1.2k",
    accountAge: "3mo",
    postCount: 5,
    commentCount: "42",
    awardCount: 1,
  },
};
