import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import FormField, { INPUT_CLASSES, TEXTAREA_CLASSES, SELECT_CLASSES } from "./FormField";

const meta = {
  title: "Infrastructure/FormField",
  component: FormField,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof FormField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const TextInput: Story = {
  args: {
    label: "Name",
    children: (
      <input
        type="text"
        placeholder="e.g., Blair Metcalf"
        className={INPUT_CLASSES}
      />
    ),
  },
};

export const WithHint: Story = {
  args: {
    label: "Prototype",
    hint: "Add prototypes from the Prototypers page first.",
    children: (
      <select className={SELECT_CLASSES}>
        <option value="">Select a prototype...</option>
      </select>
    ),
  },
};

export const TextArea: Story = {
  args: {
    label: "Description",
    children: (
      <textarea
        placeholder="What are you testing?"
        rows={3}
        className={TEXTAREA_CLASSES}
      />
    ),
  },
};

export const FormExample: Story = {
  name: "Full form example",
  args: { label: "", children: null },
  render: () => (
    <div className="w-80 space-y-3">
      <FormField label="Study Name">
        <input
          type="text"
          placeholder="e.g., Feed Sorting Experiment"
          className={INPUT_CLASSES}
        />
      </FormField>
      <FormField label="Description">
        <textarea
          placeholder="What are you testing?"
          rows={3}
          className={TEXTAREA_CLASSES}
        />
      </FormField>
      <FormField label="Status">
        <select className={SELECT_CLASSES}>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
        </select>
      </FormField>
    </div>
  ),
};
