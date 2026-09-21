/* Service Worker de La Chivichana: red primero, sin cache persistente.
   Existe para cumplir el criterio de instalacion PWA. */
self.addEventListener("install", (event) => {
  self.skipWaiting();
});
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).catch(() => fetch("/")));
    return;
  }
  event.respondWith(fetch(event.request));
});
