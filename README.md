# Jadwal Sholat Offline — Fase 1, 2 & 3

Aplikasi jadwal 5 waktu sholat + terbit (offline), layar Azan & Iqamah,
Mode Shalat Jumat, plus **panel admin** untuk mengubah pengaturan tanpa
edit kode, tersimpan di Google Sheets.

## Setup panel admin (sekali di awal)

1. Buka file `apps-script/Code.gs`, ikuti panduan lengkap yang ada di
   komentar paling atas file itu (buat Google Sheet baru, paste script,
   deploy sebagai Web App). Di akhir kamu akan dapat 1 URL ("Web app URL").
2. Buka `admin-config.js`, tempel URL itu ke `WEB_APP_URL`, dan pastikan
   `SECRET` sama persis dengan `SECRET_KEY` di `Code.gs`.
3. Buka `config.js`, tempel URL yang sama ke `sinkronisasi.webAppUrl`.
4. Upload ulang semua file ke Netlify/GitHub Pages seperti biasa.
5. Buka `admin.html` (contoh: `https://nama-app-kamu.netlify.app/admin.html`)
   untuk mulai atur pengaturan lewat form + preview.

Catatan: `admin.html` ini **tidak punya sistem login** selain password
sederhana yang sudah ketanam di `admin-config.js` — jangan sebarkan link
`admin.html` ke publik, cukup dipakai sendiri oleh admin masjid.

## Cara pakai cepat

1. **Edit `config.js`** — isi nilai default (dipakai kalau panel admin
   belum di-setup, atau sebagai fallback). Semua penjelasan ada sebagai
   komentar di file itu.
2. **Upload semua file** ke hosting gratis (GitHub Pages atau Netlify).
3. Buka link hosting itu sekali di perangkat layar, supaya service worker
   menyimpan semua file ke cache lokal.
4. Matikan WiFi dan reload untuk pastikan mode offline berfungsi.
5. Install browser kiosk (mis. Fully Kiosk Browser), arahkan ke link
   hosting, aktifkan fullscreen + auto-start saat boot.

## Bagaimana sinkronisasi bekerja

- Layar akan mengambil data dari Google Sheets (lewat Apps Script) setiap
  10 menit sekali (bisa diubah di `config.js` > `sinkronisasi.intervalMenit`).
- Data terakhir yang berhasil diambil disimpan di Cache Storage perangkat,
  jadi kalau internet putus, layar tetap pakai data terakhir yang valid.
- Kalau `sinkronisasi.webAppUrl` dikosongkan, app akan berjalan seperti
  Fase 1-2 (semua dari `config.js` lokal saja, panel admin tidak dipakai).

## Testing Azan & Iqamah tanpa menunggu waktu sholat asli

Tambahkan di belakang link app kamu:
- `?simulasi=azan` — lihat tampilan layar Azan lalu lanjut ke Iqamah
- `?simulasi=jumat` — lihat tampilan Mode Shalat Jumat

## Menyesuaikan jadwal dengan Kemenag

1. Buka jadwal resmi di bimasislam.kemenag.go.id/jadwalshalat untuk kab/kota
   kamu, bandingkan dengan hasil app ini.
2. Isi selisihnya (menit) ke pengaturan koreksi — lewat panel admin (kalau
   sudah setup) atau `koreksiMenit` di `config.js`.

## Soal suara Azan

Kalau kamu isi `suaraAzan` di config dengan file mp3, browser mungkin
memblokir autoplay kalau halaman belum pernah disentuh sejak dibuka.
Solusinya: sentuh/klik layar sekali setelah halaman pertama kali dimuat,
setelah itu autoplay berjalan normal untuk seterusnya.

## Yang belum ada (menyusul di fase berikutnya)

- Media promosi, running text, info kegiatan, donasi (Fase 4)
- Mode Ramadhan, hemat energi, pilihan tema (Fase 5)


