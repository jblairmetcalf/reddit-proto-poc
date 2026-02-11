import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import AuthGate from "./AuthGate";

const meta = {
  title: "Infrastructure/AuthGate",
  component: AuthGate,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
} satisfies Meta<typeof AuthGate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-lg font-semibold text-foreground">
          Authenticated content visible here
        </p>
      </div>
    ),
  },
};
