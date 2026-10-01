"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

export default function PwaRegister() {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      if (typeof promptEvent.prompt !== "function") return;
      promptEvent.preventDefault();
      setDeferredPrompt(promptEvent);
      setInstallable(true);
    };
    const onInstalled = () => {
      setInstalled(true);
      setInstallable(false);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed || !installable || !deferredPrompt) return null;

  return (
    <button
      type="button"
      className="blink-pwa-install"
      onClick={async () => {
        const prompt = deferredPrompt;
        if (!prompt) return;
        await prompt.prompt();
        setDeferredPrompt(null);
        setInstallable(false);
      }}
      aria-label="Install BLSSNVJ21 BLINK app"
    >
      <img src="/favicon.svg" alt="" width="24" height="24" />
      <span>Install BLINK</span>
    </button>
  );
}
