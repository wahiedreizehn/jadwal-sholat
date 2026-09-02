// Service worker: simpan semua file app ke cache lokal perangkat,
// supaya layar tetap jalan walau internet mati/putus.

const CACHE_NAME = 'jadwal-sholat-v3'; // <- naikkan angka ini SETIAP kali kamu upload perubahan file
const FILES_TO_CACHE = [
  './',
  './index.html',
  './config.js',
  './app.js',
  './manifest.json',
  './vendor/adhan.min.js',
  './icons/icon-192.png',
  './icons/icon-512.png'
  // Kalau kamu isi CONFIG.masjid.logo dengan file baru di folder icons/,
  // tambahkan juga path-nya di sini, contoh: './icons/logo-masjid.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Strategi: cache-first. Coba ambil dari cache dulu (instan, offline-safe),
// kalau tidak ada baru coba ke jaringan.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});
