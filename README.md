# Jadwal Sholat Offline — Fase 1 & 2

Aplikasi jadwal 5 waktu sholat + terbit (dihitung offline), plus layar Azan,
Iqamah dengan countdown & pesan custom, dan Mode Shalat Jumat.

## Cara pakai cepat

1. **Edit `config.js`** — isi nama masjid, koordinat lokasi, metode
   perhitungan, koreksi manual, durasi azan/iqamah, dan pesan iqamah. Semua
   penjelasan sudah ada sebagai komentar di dalam file itu.
2. **Upload semua file** ke hosting gratis (GitHub Pages atau Netlify).
3. Buka link hosting itu sekali di perangkat layar, supaya service worker
   menyimpan semua file ke cache lokal.
4. Matikan WiFi dan reload untuk pastikan mode offline berfungsi.
5. Install browser kiosk (mis. Fully Kiosk Browser), arahkan ke link
   hosting, aktifkan fullscreen + auto-start saat boot.

## Testing Azan & Iqamah tanpa menunggu waktu sholat asli

Buka link app kamu dengan tambahan di belakangnya:
- `?simulasi=azan` — untuk lihat tampilan layar Azan lalu lanjut ke Iqamah
- `?simulasi=jumat` — untuk lihat tampilan Mode Shalat Jumat

Contoh: `https://nama-app-kamu.netlify.app/?simulasi=azan`

## Menyesuaikan jadwal dengan Kemenag

1. Buka jadwal resmi di bimasislam.kemenag.go.id/jadwalshalat untuk kab/kota
   kamu, bandingkan dengan hasil app ini.
2. Isi selisihnya (menit) ke `koreksiMenit` di `config.js`.

## Soal suara Azan

Kalau kamu isi `suaraAzan` di config dengan file mp3, browser **mungkin
memblokir autoplay** kalau halaman belum pernah disentuh sama sekali sejak
dibuka (kebijakan keamanan browser, bukan bug). Solusinya: sentuh/klik layar
sekali setelah halaman pertama kali dimuat (misalnya lewat Fully Kiosk
Browser yang punya opsi "auto klik" saat startup), setelah itu autoplay akan
berjalan normal untuk seterusnya.

## Yang belum ada (menyusul di fase berikutnya)

- Panel admin dengan preview (Fase 3)
- Media promosi, running text, info kegiatan (Fase 4)
- Mode Ramadhan, hemat energi, pilihan tema (Fase 5)

