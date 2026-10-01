"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaRegister() {
  const [installable, setInstallable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    let refreshing = false;
    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/", updateViaCache: "none" });

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) setUpdateReady(true);
          });
        });

        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (refreshing) return;
          refreshing = true;
          window.location.reload();
        });

        if (registration.waiting) setUpdateReady(true);
        window.addEventListener("online", () => { registration.update().catch(() => {}); });
      } catch {
        // PWA support is optional; the core app continues normally.
      }
    };

    void register();

    const onBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      if (typeof promptEvent.prompt !== "function") return;
      event.preventDefault();
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

  if (updateReady) {
    return (
      <button
        type="button"
        className="blink-pwa-install"
        onClick={() => navigator.serviceWorker.ready.then((registration) => registration.waiting?.postMessage({ type: "SKIP_WAITING" }))}
        aria-label="Update BLINK"
      >
        <span>Update BLINK</span>
      </button>
    );
  }

  if (installed || !installable || !deferredPrompt) return null;

  return (
    <button type="button" className="blink-pwa-install" onClick={async () => {
      const prompt = deferredPrompt;
      if (!prompt) return;
      await prompt.prompt();
      setDeferredPrompt(null);
      setInstallable(false);
    }} aria-label="Install BLSSNVJ21 BLINK app">
      <img src="/favicon.svg" alt="" width="24" height="24" />
      <span>Install BLINK</span>
    </button>
  );
}