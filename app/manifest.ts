import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/?app=blssnvj21",
    name: "BLSSNVJ21 — BLINK",
    short_name: "BLSSNVJ21",
    description: "BLSSNVJ21 — BLINK camera, chat, stories, friends, snaps, and private social communication.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone"],
    orientation: "portrait-primary",
    background_color: "#050507",
    theme_color: "#050507",
    lang: "en",
    categories: ["social", "communication"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any maskable" },
    ],
    prefer_related_applications: false,
    launch_handler: { client_mode: "navigate-existing" },
    shortcuts: [
      { name: "Open BLINK", short_name: "Open", url: "/home", icons: [{ src: "/icon.svg", sizes: "any" }] },
    ],
  };
}
