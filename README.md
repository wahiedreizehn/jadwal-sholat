# Jadwal Sholat Offline — Fase 1, 2, 3 & 4

Aplikasi jadwal 5 waktu sholat + terbit (offline), layar Azan & Iqamah,
Mode Shalat Jumat, panel admin tersambung Google Sheets, plus blok media
promosi, running text, info kegiatan, notifikasi hari besar, dan donasi.

## Mengisi konten Fase 4 (media, running text, kegiatan, dst)

Konten jenis ini diedit **langsung di tab Google Sheets kamu** (bukan lewat
`admin.html`), setelah setup Apps Script (lihat bagian "Setup panel admin"
di bawah). Ada 5 tab yang otomatis dibuat:

- **MainSlider** — media promosi. Kolom "Tipe" isi salah satu:
  `gambar`, `video`, atau `youtube`. Kolom "URL" isi link file/YouTube.
- **RunningText** — 1 baris = 1 pesan yang akan bergantian tampil di teks
  berjalan bawah layar.
- **InfoSlide** — Judul + Deskripsi, untuk kegiatan rutin/insidental.
- **IslamicEvent** — Nama Acara + Tanggal (format YYYY-MM-DD). Kalau
  tanggalnya 14 hari lagi atau kurang, otomatis muncul badge "H-7" dst
  di layar.
- **Donasi** — info rekening/e-wallet untuk ditampilkan bergantian.

Tinggal tambah/hapus/edit baris seperti Excel biasa — layar akan otomatis
mengambil perubahan ini di sinkronisasi berikutnya (default tiap 10 menit).

Blok "Info & Promosi" di layar akan **bergantian menampilkan** isi dari
InfoSlide, MainSlider, dan Donasi setiap 6 detik.

**Catatan jujur:** blok media (gambar/video/YouTube) di versi ini baru
menampilkan **judul & keterangan tipenya** dalam bentuk teks (belum
me-render gambar/video/YouTube sungguhan di layar) — itu penyempurnaan
tampilan yang bisa menyusul. **Jumbotron Slider** (mode fullscreen yang
otomatis sembunyi dekat waktu sholat) juga belum ada di fase ini,
ditunda ke fase berikutnya.

## Cara isi media di tab MainSlider (gambar/video/YouTube)

Kolom "Tipe" isi salah satu dari 3 pilihan ini, sesuai kebutuhan:

- **`gambar`** — Kolom URL isi link gambar. Kalau dari Google Drive:
  klik kanan file > Share > ubah jadi "Anyone with the link", lalu pakai
  format URL `https://drive.google.com/uc?id=ID_FILE_KAMU` (ambil ID_FILE
  dari link share Google Drive).
- **`video`** (untuk **offline sungguhan**, direkomendasikan) — download
  file video kamu (mp4), taruh di folder `media/` di project ini (buat
  folder itu kalau belum ada), lalu isi URL dengan path relatif, contoh:
  `media/promo-donasi.mp4`. **Wajib tambahkan juga path itu** ke daftar
  `FILES_TO_CACHE` di `service-worker.js` (ada contoh formatnya di situ),
  supaya video ikut ter-cache dan tetap tampil walau internet mati.
- **`youtube`** — tempel link video YouTube apa adanya. **Catatan
  penting: ini BUTUH internet untuk streaming**, tidak bisa offline sama
  sekali (ini keterbatasan bawaan YouTube, bukan aplikasi ini). Kalau
  layar sedang offline, item YouTube otomatis dilewati dan lanjut ke
  item berikutnya supaya tidak menampilkan kotak kosong.

**Kesimpulan soal offline:** kalau kamu mau video benar-benar tampil
walau internet mati, **pakai tipe `video` dengan file lokal**, bukan
`youtube`.



1. Buka file `apps-script/Code.gs`, ikuti panduan lengkap yang ada di
   komentar paling atas file itu (buat Google Sheet baru, paste script,
   deploy sebagai Web App). Di akhir kamu akan dapat 1 URL ("Web app URL").
2. Buka `admin-config.js`, tempel URL itu ke `WEB_APP_URL`, dan pastikan
   `SECRET` sama persis dengan `SECRET_KEY` di `Code.gs`.
3. Buka `config.js`, tempel URL yang sama ke `sinkronisasi.webAppUrl`.
4. Upload ulang semua file ke Netlify/GitHub Pages seperti biasa.
5. Buka `admin.html` untuk atur pengaturan tunggal (profil, lokasi, koreksi,
   durasi iqamah, dst) lewat form + preview.
6. Buka Google Sheets-nya langsung untuk isi konten list (Fase 4 di atas).

Catatan: `admin.html` tidak punya sistem login selain password sederhana
di `admin-config.js` — jangan sebarkan link itu ke publik.

## Cara pakai cepat

1. **Edit `config.js`** — isi nilai default (dipakai kalau panel admin
   belum di-setup, atau sebagai fallback).
2. **Upload semua file** ke hosting gratis (GitHub Pages atau Netlify).
3. Buka link hosting itu sekali di perangkat layar, supaya service worker
   menyimpan semua file ke cache lokal.
4. Matikan WiFi dan reload untuk pastikan mode offline berfungsi.
5. Install browser kiosk (mis. Fully Kiosk Browser), arahkan ke link
   hosting, aktifkan fullscreen + auto-start saat boot.

## Testing Azan & Iqamah tanpa menunggu waktu sholat asli

Tambahkan di belakang link app kamu:
- `?simulasi=azan` — lihat tampilan layar Azan lalu lanjut ke Iqamah
- `?simulasi=jumat` — lihat tampilan Mode Shalat Jumat

## Menyesuaikan jadwal dengan Kemenag

1. Buka jadwal resmi di bimasislam.kemenag.go.id/jadwalshalat untuk kab/kota
   kamu, bandingkan dengan hasil app ini.
2. Isi selisihnya (menit) lewat panel admin atau `koreksiMenit` di `config.js`.

## Soal suara Azan

Kalau kamu isi `suaraAzan` di config dengan file mp3, browser mungkin
memblokir autoplay kalau halaman belum pernah disentuh sejak dibuka.
Solusinya: sentuh/klik layar sekali setelah halaman pertama kali dimuat.

## Yang belum ada (menyusul di fase berikutnya)

- Jumbotron Slider fullscreen otomatis, render gambar/video/YouTube
  sungguhan di blok media (Fase 5 lanjutan)
- Mode Ramadhan, hemat energi, pilihan tema (Fase 5)



