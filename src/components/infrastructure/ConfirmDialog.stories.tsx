import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import ConfirmDialog from "./ConfirmDialog";

const meta = {
  title: "Infrastructure/ConfirmDialog",
  component: ConfirmDialog,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
  args: {
    open: true,
    onClose: fn(),
    onConfirm: fn(),
    message: 'Delete "Feed Sorting Experiment" and all its events?',
  },
} satisfies Meta<typeof ConfirmDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CustomTitle: Story = {
  args: {
    title: "Confirm",
    message: 'Remove "Jane Doe" from this study?',
    confirmLabel: "Confirm",
  },
};

export const DefaultVariant: Story = {
  args: {
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
    confirmLabel: "Proceed",
    variant: "default",
  },
};

export const Interactive: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    const [result, setResult] = useState<string | null>(null);
    return (
      <div className="text-center">
        <button
          onClick={() => {
            setResult(null);
            setOpen(true);
          }}
          className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-500"
        >
          Delete Item
        </button>
        {result && (
          <p className="mt-4 text-sm text-secondary">{result}</p>
        )}
        <ConfirmDialog
          open={open}
          onClose={() => setOpen(false)}
          onConfirm={() => setResult("Item deleted!")}
          message='Delete "My Prototype"? This cannot be undone.'
        />
      </div>
    );
  },
};
