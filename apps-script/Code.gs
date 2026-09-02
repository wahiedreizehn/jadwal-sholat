/**
 * ============================================================
 * APPS SCRIPT - Jembatan antara Panel Admin dan Google Sheets
 * ============================================================
 * CARA PASANG (dilakukan 1x di awal saja):
 *
 * 1. Buat Google Sheet baru, beri nama misalnya "Data Masjid".
 * 2. Di menu atas, klik Extensions/Ekstensi > Apps Script.
 * 3. Hapus semua kode default yang ada, ganti dengan SELURUH isi
 *    file ini (copy-paste semua).
 * 4. Ganti nilai SECRET_KEY di bawah dengan kata sandi bebas
 *    pilihan kamu sendiri (anggap seperti password panel admin).
 * 5. Klik ikon Save (gambar disket).
 * 6. Klik dropdown fungsi di toolbar atas, pilih "setupSheetAwal",
 *    lalu klik tombol Run/Jalankan (ikon segitiga play).
 *    - Akan muncul minta izin akses, klik "Advanced/Lanjutan" >
 *      "Go to [nama project] (unsafe)" > Allow/Izinkan.
 *      (Ini normal, karena scriptnya punya kamu sendiri.)
 * 7. Setelah berhasil jalan, cek Google Sheet kamu — akan otomatis
 *    terisi sheet "Pengaturan" dengan data contoh.
 * 8. Klik tombol "Deploy" (kanan atas) > "New deployment".
 * 9. Klik ikon gerigi di sebelah "Select type", pilih "Web app".
 * 10. Isi "Execute as": Me (akun kamu).
 *     Isi "Who has access": Anyone.
 * 11. Klik "Deploy", lalu copy "Web app URL" yang muncul.
 * 12. Tempel URL itu ke file admin-config.js dan config.js
 *     (variabel WEB_APP_URL) di project aplikasi jadwal sholat.
 *
 * Setiap kali kamu edit script ini lagi di kemudian hari, ingat
 * untuk Deploy > Manage deployments > edit (ikon pensil) > Deploy
 * ulang, supaya perubahannya aktif.
 * ============================================================
 */

const SHEET_NAME = 'Pengaturan';
const SECRET_KEY = 'ganti-dengan-password-kamu-sendiri'; // <-- WAJIB DIGANTI

const NILAI_AWAL = {
  masjid_nama: 'Masjid Al-Ikhlas',
  masjid_alamat: 'Balikpapan, Kalimantan Timur',
  masjid_logo: '',
  masjid_font: 'serif',
  lokasi_lat: '-1.2379',
  lokasi_lng: '116.8529',
  lokasi_zona: 'Asia/Makassar',
  metode_perhitungan: 'Singapore',
  koreksi_subuh: '2', koreksi_terbit: '0', koreksi_dzuhur: '2',
  koreksi_ashar: '1', koreksi_maghrib: '2', koreksi_isya: '1',
  iqamah_subuh: '15', iqamah_dzuhur: '10', iqamah_ashar: '10',
  iqamah_maghrib: '5', iqamah_isya: '10',
  durasi_azan_detik: '90',
  hijriyah_tampil: 'true', hijriyah_koreksi: '0',
  jumat_aktif: 'true', jumat_pesan: 'Sedang berlangsung Shalat Jumat', jumat_durasi_menit: '45'
};

function setupSheetAwal(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if(!sheet){ sheet = ss.insertSheet(SHEET_NAME); }
  sheet.clear();
  sheet.appendRow(['Key', 'Value']);
  Object.keys(NILAI_AWAL).forEach((key)=>{
    sheet.appendRow([key, NILAI_AWAL[key]]);
  });
  sheet.setFrozenRows(1);
}

function bacaSemuaPengaturan(){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const hasil = {};
  for(let i=1;i<data.length;i++){
    const key = data[i][0];
    const value = data[i][1];
    if(key) hasil[key] = value;
  }
  return hasil;
}

function tulisPengaturan(dataBaru){
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  const keyKeRow = {};
  for(let i=1;i<data.length;i++){ keyKeRow[data[i][0]] = i+1; }

  Object.keys(dataBaru).forEach((key)=>{
    if(key === 'secret') return;
    if(keyKeRow[key]){
      sheet.getRange(keyKeRow[key], 2).setValue(dataBaru[key]);
    } else {
      sheet.appendRow([key, dataBaru[key]]);
    }
  });
}

function doGet(e){
  const hasil = bacaSemuaPengaturan();
  return ContentService.createTextOutput(JSON.stringify(hasil))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e){
  const body = JSON.parse(e.postData.contents);

  if(body.secret !== SECRET_KEY){
    return ContentService.createTextOutput(JSON.stringify({sukses:false, pesan:'Password salah'}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  tulisPengaturan(body);
  return ContentService.createTextOutput(JSON.stringify({sukses:true}))
    .setMimeType(ContentService.MimeType.JSON);
}
