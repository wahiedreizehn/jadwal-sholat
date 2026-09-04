# Jadwal Sholat Offline — Lengkap (Firebase, tanpa Spreadsheet)

Aplikasi jadwal 5 waktu sholat + terbit (offline), layar Azan & Iqamah,
Mode Shalat Jumat, panel admin dengan login, media promosi, running text,
info kegiatan, Jumbotron Slider, pilihan tema, Mode Ramadhan, Murattal
terjadwal, dan mode hemat energi — semua data tersimpan di **Firebase
Firestore**, bukan Google Sheets.

## Kenapa pindah dari Google Sheets?

Google Sheets (lewat Apps Script) sering bikin bingung karena tiap ubah
kode harus "Deploy versi baru", dan gampang lupa. Firestore tidak punya
masalah itu sama sekali — begitu disimpan lewat panel admin, **langsung
aktif di layar dalam hitungan detik** (real-time), tanpa perlu deploy
apapun.

## Setup awal (sekali saja)

1. Buka `firebase-config.js`, baca panduan lengkap di komentar atas file
   itu (buat project di Firebase Console, aktifkan Firestore Database,
   aktifkan Authentication dengan Email/Password, buat 1 akun admin).
2. Tempel nilai `firebaseConfig` dari Firebase Console ke `firebase-config.js`.
3. Buka `firestore-rules.txt`, ikuti panduan di situ untuk paste rules-nya
   ke Firebase Console (Firestore Database > tab Rules).
4. Upload semua file ke Netlify/GitHub Pages seperti biasa.
5. Buka `admin.html`, login pakai email+password yang kamu buat di
   langkah 1. Isi semua pengaturan & konten dari sana.

**Tidak perlu setup Google Sheets, Apps Script, atau Web App URL sama
sekali** — semua sudah digantikan Firestore.

## Cara pakai cepat

1. **Edit `config.js`** — isi nilai default (dipakai kalau panel admin
   belum di-setup atau Firestore belum bisa diakses, sebagai fallback).
2. **Upload semua file** ke hosting gratis (GitHub Pages atau Netlify).
3. Buka link hosting itu sekali di perangkat layar, supaya service worker
   menyimpan semua file (termasuk Firebase SDK) ke cache lokal.
4. Matikan WiFi dan reload untuk pastikan mode offline berfungsi —
   perhitungan jadwal sholat tetap jalan offline seperti biasa, dan
   Firestore juga punya cache offline bawaan (data terakhir yang berhasil
   diambil tetap tersimpan di perangkat).
5. Install browser kiosk (mis. Fully Kiosk Browser), arahkan ke link
   hosting, aktifkan fullscreen + auto-start saat boot.

## Mengisi konten (media, running text, kegiatan, dst)

Semua diedit lewat `admin.html` (login dulu):

- **Profil** — nama, alamat, logo, font, WhatsApp Admin, pilihan tema.
- **Lokasi & metode** — koordinat, zona waktu, metode perhitungan.
- **Koreksi & iqamah** — koreksi manual per waktu, durasi iqamah, durasi
  layar Azan.
- **Jumat, Ramadhan & Hijriyah** — Mode Jumat, Mode Ramadhan (Imsak,
  Tarawih), pengaturan Hijriyah.
- **Jumbotron, Murattal & Hemat Energi** — plus list editor media
  Jumbotron.
- **Media Promosi / Running Text / Info Kegiatan / Hari Besar / Donasi**
  — masing-masing punya tombol "+ Tambah" dan "Hapus" per baris.

Klik **"Simpan Perubahan"** setelah edit — semua tersimpan sekaligus
(pengaturan + semua list) ke Firestore, langsung aktif di layar dalam
hitungan detik.

Kolom "Tipe" di Media Promosi/Jumbotron isi salah satu: `gambar`, `video`,
atau `youtube`. Untuk video **offline sungguhan**, download file mp4-nya,
taruh di folder `media/`, isi URL dengan path relatif (mis.
`media/promo.mp4`), dan **tambahkan juga path itu** ke `FILES_TO_CACHE`
di `service-worker.js` supaya ikut ter-cache offline. YouTube butuh
internet untuk streaming (tidak bisa offline, keterbatasan bawaan
YouTube) — otomatis dilewati kalau layar sedang offline.

## Testing Azan & Iqamah tanpa menunggu waktu sholat asli

Tambahkan di belakang link app kamu:
- `?simulasi=azan` — lihat tampilan layar Azan lalu lanjut ke Iqamah
- `?simulasi=jumat` — lihat tampilan Mode Shalat Jumat

## Menyesuaikan jadwal dengan Kemenag

Buka jadwal resmi di bimasislam.kemenag.go.id/jadwalshalat untuk kab/kota
kamu, bandingkan dengan hasil app ini, lalu isi selisihnya (menit) di tab
"Koreksi & Iqamah" pada `admin.html`.

## Soal suara Azan/Murattal

File mp3 mungkin diblokir autoplay oleh browser kalau halaman belum
pernah disentuh sejak dibuka. Solusinya: sentuh/klik layar sekali setelah
halaman pertama kali dimuat, setelah itu autoplay berjalan normal.

## Mode hemat energi — catatan jujur

Fitur ini hanya menggelapkan tampilan di layar (overlay hitam), **bukan
benar-benar mematikan daya TV/Android box**. Untuk mematikan daya
sungguhan, kamu butuh alat tambahan seperti smart plug berjadwal.

## Keamanan

- **Baca (read)** data boleh dilakukan siapa saja tanpa login — supaya
  layar bisa menampilkan jadwal ke publik.
- **Tulis (write)** hanya bisa dilakukan setelah login lewat `admin.html`
  — diatur di Firestore Security Rules (`firestore-rules.txt`).
- Kamu bisa tambah admin lain kapan saja lewat Firebase Console >
  Authentication > Users > Add user, tanpa perlu edit kode sama sekali.
