import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "BLINK — Camera, Chat & Stories", template: "%s · BLINK" },
  description: "BLINK is a lightweight social communication app for chat, snaps, stories, friends, and temporary sharing.",
  applicationName: "BLINK",
  generator: "Next.js",
  keywords: ["BLINK", "social", "chat", "stories", "snaps", "messaging"],
  authors: [{ name: "BLINK" }],
  creator: "BLINK",
  publisher: "BLINK",
  category: "social",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    shortcut: ["/icon.svg"],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "BLINK",
    title: "BLINK — Camera, Chat & Stories",
    description: "Chat, share snaps, post stories, and connect through BLINK.",
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "BLINK — Camera, Chat & Stories",
    description: "A lightweight social communication experience.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export const viewport: Viewport = {
  themeColor: "#050507",
  colorScheme: "dark light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
