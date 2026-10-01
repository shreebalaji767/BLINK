import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "BLINK — Camera, Chat & Stories",
    short_name: "BLINK",
    description: "A lightweight social communication app for chat, snaps, stories, friends, and temporary sharing.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait-primary",
    background_color: "#050507",
    theme_color: "#050507",
    lang: "en",
    categories: ["social", "communication"],
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" }],
  };
}
