import type { Metadata, Viewport } from "next";
import "./globals.css";
import { getSiteUrl } from "@/lib/env";
import PwaRegister from "@/components/blink/PwaRegister";

const siteUrl = getSiteUrl();
const brand = "BLSSNVJ21";
const siteDescription = "BLSSNVJ21 — BLINK camera, chat, stories, friends, snaps, and private social communication.";

export const metadata: Metadata = {
  title: { default: "BLSSNVJ21 · BLINK", template: "%s · BLSSNVJ21" },
  description: siteDescription,
  applicationName: brand,
  generator: "Next.js",
  keywords: ["BLSSNVJ21", "BLINK", "social", "chat", "stories", "snaps", "messaging"],
  authors: [{ name: brand }],
  creator: brand,
  publisher: brand,
  category: "social",
  manifest: "/manifest.webmanifest",
  metadataBase: new URL(siteUrl),
  appleWebApp: { capable: true, title: brand, statusBarStyle: "black-translucent" },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }, { url: "/favicon.svg", type: "image/svg+xml" }],
    shortcut: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/apple-icon.svg", type: "image/svg+xml" }],
  },
  alternates: { canonical: "/" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    siteName: brand,
    title: "BLSSNVJ21 · BLINK",
    description: siteDescription,
    url: siteUrl,
  },
  twitter: {
    card: "summary",
    title: "BLSSNVJ21 · BLINK",
    description: siteDescription,
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
  return <html lang="en" suppressHydrationWarning><body>{children}<PwaRegister /></body></html>;
}
