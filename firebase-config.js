// ============================================================
// KONFIGURASI FIREBASE
// Dipakai bersama oleh index.html (layar) dan admin.html (panel admin).
//
// CARA DAPAT NILAI-NILAI DI BAWAH INI:
// 1. Buka https://console.firebase.google.com, login pakai akun Google.
// 2. Klik "Add project" / "Tambahkan project", beri nama bebas
//    (misal "jadwal-sholat-masjid"), lanjutkan sampai selesai
//    (boleh matikan Google Analytics, tidak perlu).
// 3. Di dashboard project, klik ikon "</>" (Web) untuk daftarkan aplikasi
//    web baru. Beri nama bebas, klik "Register app".
// 4. Firebase akan menampilkan blok kode berisi "firebaseConfig" —
//    copy semua nilai di dalamnya ke bawah ini.
// 5. Di menu kiri, buka "Build > Firestore Database" > "Create database"
//    > pilih lokasi server (pilih yang dekat, mis. asia-southeast) >
//    mode "Start in production mode" (nanti kita atur rules-nya sendiri,
//    lihat firestore-rules.txt).
// 6. Di menu kiri, buka "Build > Authentication" > "Get started" >
//    aktifkan provider "Email/Password" > klik tab "Users" > "Add user",
//    buat 1 akun admin (email + password bebas, ini yang dipakai login
//    ke admin.html nanti).
// ============================================================

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyAOz5hnni3uFsaIZdZFPxxKOEMgXGau0jE",
  authDomain: "jadwalsholat-195a2.firebaseapp.com",
  projectId: "jadwalsholat-195a2",
  storageBucket: "jadwalsholat-195a2.firebasestorage.app",
  messagingSenderId: "865953625563",
  appId: "1:865953625563:web:497015983a28d648a563fe",
  measurementId: "G-L8FCY0ND63"
};


