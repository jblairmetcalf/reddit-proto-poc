import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import Toast from "./Toast";

const meta = {
  title: "Infrastructure/Toast",
  component: Toast,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    message: 'Updated "Feed Sorting v2"',
    onDismiss: fn(),
  },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithUndo: Story = {
  args: {
    message: 'Deleted "Prototype A"',
    onUndo: fn(),
  },
};

export const Interactive: Story = {
  render: () => {
    const [toast, setToast] = useState<{
      message: string;
      onUndo?: () => void;
    } | null>(null);
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => setToast({ message: "Action completed!" })}
          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-500"
        >
          Show Toast
        </button>
        <button
          onClick={() =>
            setToast({
              message: 'Deleted "Item"',
              onUndo: () => setToast({ message: "Undo successful!" }),
            })
          }
          className="rounded-lg border border-edge-strong px-4 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground"
        >
          Show Toast with Undo
        </button>
        {toast && (
          <Toast
            message={toast.message}
            onUndo={toast.onUndo}
            onDismiss={() => setToast(null)}
          />
        )}
      </div>
    );
  },
};
