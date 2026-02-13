import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import HeroSection from "./HeroSection";

const meta = {
  title: "Brand/HeroSection",
  component: HeroSection,
  parameters: { layout: "fullscreen" },
  tags: ["autodocs"],
  args: {
    onCtaClick: fn(),
    onSecondaryCtaClick: fn(),
  },
} satisfies Meta<typeof HeroSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dashboard: Story = {
  name: "Dashboard hero",
  args: {
    label: "Reddit Proto",
    headline: ["Ship experiences", "that matter."],
    gradientLine: 1,
    subtitle:
      "Your workspace for prototyping, testing, and shipping Reddit experiences at scale.",
    ctaLabel: "View Prototypes ↓",
    secondaryCtaLabel: "Our Approach",
  },
};

export const PrototypersHero: Story = {
  name: "Prototypers hero",
  args: {
    label: "The Team",
    headline: ["Meet the", "prototypers."],
    gradientLine: 1,
    subtitle:
      "The people building, testing, and iterating on what Reddit looks like next.",
    ctaLabel: "Browse Profiles",
  },
};

export const StudiesHero: Story = {
  name: "User Studies hero",
  args: {
    label: "User Research",
    headline: ["Real insights,", "real users."],
    gradientLine: 0,
    subtitle:
      "Run studies, track participant behavior in real time, and ship with confidence.",
    ctaLabel: "Start a Study",
    secondaryCtaLabel: "View Dashboard",
  },
};

export const MinimalHero: Story = {
  name: "Minimal (no CTAs)",
  args: {
    headline: ["Reddit Proto"],
    subtitle: "Prototype, test, ship.",
  },
};
