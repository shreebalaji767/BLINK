const CACHE = "blssnvj21-shell-v5";
const SHELL = ["/login", "/icon.svg", "/favicon.svg", "/apple-icon.svg", "/manifest.webmanifest"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (
          response.ok &&
          request.destination === "document" &&
          url.pathname === "/login"
        ) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => {
        if (request.destination !== "document") {
          return caches.match(request);
        }
        return caches.match(request).then(
          (cached) => cached || caches.match("/login")
        );
      })
  );
});
