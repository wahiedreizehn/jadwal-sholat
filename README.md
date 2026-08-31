# Jadwal Sholat Offline — Fase 1 (MVP)

Aplikasi jadwal 5 waktu sholat + terbit, dihitung offline langsung di perangkat
(tidak butuh API/internet untuk menghitung waktu sholat).

## Cara pakai cepat

1. **Edit `config.js`** — isi nama masjid, koordinat lokasi (lat/lon dari Google
   Maps), metode perhitungan, dan koreksi manual per waktu sholat. Semua
   penjelasan sudah ada sebagai komentar di dalam file itu.
2. **Upload semua file** (index.html, config.js, app.js, manifest.json,
   service-worker.js, folder vendor/, folder icons/) ke hosting gratis:
   - GitHub Pages, atau
   - Netlify (tinggal drag-and-drop folder ini)
3. **Buka link hasil hosting** itu sekali di perangkat yang akan dipasang di
   layar LCD (Android box/Smart TV), supaya service worker menyimpan semua
   file ke cache lokal.
4. Setelah itu, **matikan WiFi dan reload halaman** — pastikan tetap tampil
   normal. Kalau iya, berarti mode offline sudah berfungsi.
5. Install browser kiosk (mis. **Fully Kiosk Browser**) di Android box, arahkan
   ke link hosting tadi, aktifkan fullscreen + auto-start saat boot.

## Menyesuaikan jadwal dengan Kemenag

Karena Adhan.js tidak punya preset resmi "Kemenag RI", cara paling akurat:
1. Buka jadwal resmi di bimasislam.kemenag.go.id/jadwalshalat untuk kab/kota
   kamu.
2. Bandingkan dengan hasil di app ini untuk beberapa hari.
3. Isi selisihnya (dalam menit) ke bagian `koreksiMenit` di `config.js`.

## Yang belum ada di Fase 1 ini (menyusul di fase berikutnya)

- Popup Azan & Iqamah (Fase 2)
- Panel admin dengan preview (Fase 3)
- Media promosi, running text, info kegiatan (Fase 4)
- Mode Ramadhan, hemat energi, pilihan tema (Fase 5)
