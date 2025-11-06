self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (event) => {
  const data = event.data?.json?.() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || "Listing opened!", {
      body: data.body || "Your watched dates now have availability.",
      icon: "/vite.svg",
      badge: "/vite.svg",
    })
  );
});
