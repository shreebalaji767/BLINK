import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BLINK — Camera, Chat & Stories",
  description: "BLINK is an ephemeral social camera app."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
