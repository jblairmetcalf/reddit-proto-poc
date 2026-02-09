import type { Metadata, Viewport } from "next";
import { Reddit_Sans, Reddit_Mono } from "next/font/google";
import AuthGate from "@/components/AuthGate";
import "./globals.css";

const redditSans = Reddit_Sans({
  variable: "--font-reddit-sans",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const redditMono = Reddit_Mono({
  variable: "--font-reddit-mono",
  subsets: ["latin"],
  weight: ["200", "300", "400", "500", "600", "700"],
});

export const viewport: Viewport = {
  themeColor: "#FF4500",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Reddit Proto",
  description: "Reddit Proto - Prototype Workspace",
  manifest: "/manifest.json",
  icons: {
    icon: "/reddit-logo.png",
    apple: "/reddit-logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Reddit Proto",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${redditSans.variable} ${redditMono.variable} antialiased`}
      >
        <AuthGate>{children}</AuthGate>
      </body>
    </html>
  );
}
