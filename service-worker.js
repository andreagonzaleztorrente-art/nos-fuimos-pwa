// Service worker de "¡Nos Fuimos!"
// Solo cachea el "shell" (esta página, el manifest y los íconos).
// El contenido real de la app (Google Sheets/Apps Script) siempre se pide
// en vivo, nunca se cachea, para que los datos de aportes y viajes
// se vean siempre actualizados.

const CACHE_NAME = "nos-fuimos-shell-v1";
const SHELL_FILES = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Solo intervenir en pedidos al propio shell (mismo origen).
  // Todo lo que vaya hacia script.google.com / googleusercontent.com
  // (o sea, la app real) pasa directo a la red, sin cachear.
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).catch(() => caches.match("./index.html"))
      );
    })
  );
});
