// Service worker: simpan semua file app ke cache lokal perangkat,
// supaya layar tetap jalan walau internet mati/putus.

const CACHE_NAME = 'jadwal-sholat-v10'; // <- naikkan angka ini SETIAP kali kamu upload perubahan file
// Kalau kamu tambah file video/gambar lokal di folder media/, tambahkan juga
// path-nya di sini, contoh: './media/promo-donasi.mp4'
const FILES_TO_CACHE = [
  './',
  './index.html',
  './config.js',
  './firebase-config.js',
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

// Domain yang boleh di-cache (file app + CDN statis). Firestore/Firebase
// Auth SENGAJA tidak masuk sini karena request-nya bersifat koneksi
// real-time/streaming, bukan file statis — kalau ikut di-cache malah bisa
// merusak koneksinya.
const DOMAIN_BOLEH_CACHE = ['www.gstatic.com', 'fonts.googleapis.com', 'fonts.gstatic.com'];

self.addEventListener('fetch', (event) => {
  if(event.request.method !== 'GET') return; // jangan cache request non-GET

  const url = new URL(event.request.url);
  const bolehCache = url.origin === self.location.origin || DOMAIN_BOLEH_CACHE.includes(url.hostname);
  if(!bolehCache) return; // biarkan request lain (Firestore, dsb) jalan alami, tidak dicegat

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if(cached) return cached;
      return fetch(event.request).then((response) => {
        if(response && response.status === 200){
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
