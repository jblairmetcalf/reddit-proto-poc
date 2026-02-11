import React from "react";
import type { Preview } from "@storybook/nextjs-vite";
import "../src/app/globals.css";

function ThemeWrapper({
  theme,
  children,
}: {
  theme: string;
  children: React.ReactNode;
}) {
  React.useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    root.classList.remove("light", "dark");
    body.classList.remove("light", "dark");

    if (theme !== "auto") {
      root.classList.add(theme);
      body.classList.add(theme);
    }

    const bgColor =
      theme === "dark"
        ? "#030303"
        : theme === "auto"
          ? undefined
          : "#DAE0E6";
    if (bgColor) {
      body.style.backgroundColor = bgColor;
    } else {
      body.style.removeProperty("background-color");
    }

    return () => {
      root.classList.remove("light", "dark");
      body.classList.remove("light", "dark");
      body.style.removeProperty("background-color");
    };
  }, [theme]);

  return <>{children}</>;
}

const preview: Preview = {
  globalTypes: {
    theme: {
      description: "Theme for components",
      toolbar: {
        title: "Theme",
        icon: "sun",
        items: [
          { value: "light", icon: "sun", title: "Light" },
          { value: "dark", icon: "moon", title: "Dark" },
          { value: "auto", icon: "mirror", title: "System" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.theme as string) || "light";
      return (
        <ThemeWrapper theme={theme}>
          <Story />
        </ThemeWrapper>
      );
    },
  ],
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: { disable: true },
    a11y: {
      test: "todo",
    },
  },
};

export default preview;
