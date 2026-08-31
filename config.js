// ============================================================
// KONFIGURASI APLIKASI JADWAL SHOLAT
// Edit file ini sekali saat instalasi pertama di lokasi masjid.
// Di Fase 3 nanti, sebagian besar isi file ini akan bisa diatur
// lewat panel admin (tanpa perlu edit file langsung).
// ============================================================

const CONFIG = {

  masjid: {
    nama: "Masjid Al-Ikhlas",
    alamat: "Balikpapan, Kalimantan Timur"
  },

  // Koordinat lokasi masjid. Cara dapatkan:
  // buka Google Maps -> klik kanan di lokasi masjid -> koordinat muncul di atas.
  lokasi: {
    latitude: -1.2379,
    longitude: 116.8529,
    zonaWaktu: "Asia/Makassar" // WITA. Gunakan "Asia/Jakarta" untuk WIB, "Asia/Jayapura" untuk WIT
  },

  // Metode perhitungan waktu sholat.
  // Pilihan umum untuk Indonesia: "MoonsightingCommittee" atau "Singapore" (paling dekat Kemenag).
  // Daftar lengkap metode ada di komentar bawah file ini.
  metodePerhitungan: "Singapore",

  // Koreksi manual (dalam menit) untuk tiap waktu sholat.
  // Isi angka positif untuk menambah, negatif untuk mengurangi.
  // Berguna untuk menyamakan dengan jadwal resmi Kemenag setempat jika ada selisih.
  koreksiMenit: {
    subuh: 2,
    terbit: 0,
    dzuhur: 2,
    ashar: 1,
    maghrib: 2,
    isya: 1
  },

  // Durasi iqamah per waktu sholat (dalam menit).
  // Ini yang dipakai saat layar masuk ke mode "countdown menuju iqamah".
  durasiIqamahMenit: {
    subuh: 15,
    dzuhur: 10,
    ashar: 10,
    maghrib: 5,
    isya: 10
  },

  // Setiap berapa detik jam & status di layar diperbarui.
  intervalUpdateDetik: 1

};

/*
  Daftar metode perhitungan yang didukung Adhan.js:
  MuslimWorldLeague, Egyptian, Karachi, UmmAlQura, Dubai, MoonsightingCommittee,
  NorthAmerica (ISNA), Kuwait, Qatar, Singapore, Turkey, Tehran, Other

  Catatan: Adhan.js belum punya preset resmi "Kemenag RI" secara eksplisit.
  Pendekatan yang paling dekat adalah menggunakan "Singapore" atau
  "MoonsightingCommittee" sebagai basis, lalu memakai koreksiMenit di atas
  untuk menyesuaikan dengan jadwal resmi Kemenag di lokasi masing-masing.
  Cara mengecek selisihnya: bandingkan hasil app ini dengan jadwal resmi
  Kemenag (bimasislam.kemenag.go.id/jadwalshalat) untuk kab/kota kamu,
  lalu isi selisihnya di koreksiMenit.
*/
