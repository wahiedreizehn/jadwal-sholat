// ============================================================
// KONFIGURASI APLIKASI JADWAL SHOLAT
// Edit file ini sekali saat instalasi pertama di lokasi masjid.
// Di Fase 3 nanti, sebagian besar isi file ini akan bisa diatur
// lewat panel admin (tanpa perlu edit file langsung).
// ============================================================

const CONFIG = {

  masjid: {
    nama: "Masjid Ibnu Khaldun",
    alamat: "Balikpapan, Kalimantan Timur",

    // Kosongkan jadi "" kalau belum punya logo.
    // Taruh file logo di folder icons/, format PNG dengan latar transparan
    // paling bagus. Contoh: "icons/logo-masjid.png"
    logo: "",

    // Pilihan font untuk nama masjid: "serif" (elegan, gaya kaligrafi Arab)
    // atau "sans" (modern, tegas). Dua-duanya sudah dibundel di app ini.
    fontNama: "serif"
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
  intervalUpdateDetik: 1,

  // Durasi tampilan layar "Azan" (dalam detik) sebelum otomatis pindah
  // ke layar countdown menuju iqamah.
  durasiAzanDetik: 90,

  // Kosongkan "" kalau belum ada file suara. Taruh file mp3 di folder
  // sounds/, contoh: "sounds/adzan.mp3"
  suaraAzan: "",

  // Pesan yang berganti-ganti (running text) saat layar countdown iqamah.
  pesanIqamah: [
    "Luruskan dan rapatkan shaf",
    "Matikan atau silent-kan HP Anda",
    "Sempurnakan wudhu sebelum sholat"
  ],

  shalatJumat: {
    aktif: true,
    // Pesan yang tampil menggantikan countdown iqamah saat Dzuhur hari Jumat.
    pesan: "Sedang berlangsung Shalat Jumat",
    // Perkiraan total durasi khutbah + sholat Jumat (menit), untuk kembali
    // otomatis ke tampilan normal setelahnya.
    durasiMenit: 45
  },

  hijriyah: {
    tampilkan: true,
    // Tanggal Hijriyah dihitung otomatis oleh browser (kalender Umm al-Qura),
    // kadang bisa selisih 1 hari dari hasil rukyat/sidang isbat Kemenag di
    // Indonesia. Isi angka di sini untuk koreksi manual jika perlu, misal
    // -1 kalau browser tampil kemarin dulu, atau 1 kalau kurang sehari.
    koreksiHari: 0
  }

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
