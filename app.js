// ============================================================
// LOGIC UTAMA - Fase 1: Jadwal Sholat Offline
// ============================================================

const NAMA_HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function pad(n){ return n.toString().padStart(2,'0'); }

// ---- 1. Hitung waktu sholat hari ini pakai Adhan.js (100% offline) ----
function hitungJadwalHariIni(tanggal){
  const koordinat = new adhan.Coordinates(CONFIG.lokasi.latitude, CONFIG.lokasi.longitude);

  let params;
  switch(CONFIG.metodePerhitungan){
    case 'MuslimWorldLeague': params = adhan.CalculationMethod.MuslimWorldLeague(); break;
    case 'Egyptian': params = adhan.CalculationMethod.Egyptian(); break;
    case 'Karachi': params = adhan.CalculationMethod.Karachi(); break;
    case 'UmmAlQura': params = adhan.CalculationMethod.UmmAlQura(); break;
    case 'Dubai': params = adhan.CalculationMethod.Dubai(); break;
    case 'MoonsightingCommittee': params = adhan.CalculationMethod.MoonsightingCommittee(); break;
    case 'NorthAmerica': params = adhan.CalculationMethod.NorthAmerica(); break;
    case 'Kuwait': params = adhan.CalculationMethod.Kuwait(); break;
    case 'Qatar': params = adhan.CalculationMethod.Qatar(); break;
    case 'Singapore': params = adhan.CalculationMethod.Singapore(); break;
    case 'Turkey': params = adhan.CalculationMethod.Turkey(); break;
    case 'Tehran': params = adhan.CalculationMethod.Tehran(); break;
    default: params = adhan.CalculationMethod.Singapore();
  }

  const waktu = new adhan.PrayerTimes(koordinat, tanggal, params);

  // terapkan koreksi manual (dalam menit)
  function koreksi(date, menit){
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + (menit || 0));
    return d;
  }

  return {
    subuh:   koreksi(waktu.fajr, CONFIG.koreksiMenit.subuh),
    terbit:  koreksi(waktu.sunrise, CONFIG.koreksiMenit.terbit),
    dzuhur:  koreksi(waktu.dhuhr, CONFIG.koreksiMenit.dzuhur),
    ashar:   koreksi(waktu.asr, CONFIG.koreksiMenit.ashar),
    maghrib: koreksi(waktu.maghrib, CONFIG.koreksiMenit.maghrib),
    isya:    koreksi(waktu.isha, CONFIG.koreksiMenit.isya)
  };
}

// ---- 2. Cari waktu sholat berikutnya + yang sedang aktif ----
function cariStatusWaktu(jadwal, sekarang){
  const urutan = [
    {key:'subuh', label:'Subuh'},
    {key:'terbit', label:'Terbit'},
    {key:'dzuhur', label:'Dzuhur'},
    {key:'ashar', label:'Ashar'},
    {key:'maghrib', label:'Maghrib'},
    {key:'isya', label:'Isya'}
  ];

  let aktifIdx = -1;
  for(let i=0;i<urutan.length;i++){
    if(sekarang >= jadwal[urutan[i].key]) aktifIdx = i;
  }
  // lewati "terbit" sebagai status "aktif" karena bukan waktu sholat
  const aktifSholatIdx = aktifIdx >= 0 && urutan[aktifIdx].key === 'terbit' ? 0 : aktifIdx;

  return { urutan, aktifIdx: aktifSholatIdx < 0 ? urutan.length - 1 : aktifSholatIdx };
}

// ---- 3. Render ke DOM ----
function renderProfil(){
  document.getElementById('elNamaMasjid').textContent = CONFIG.masjid.nama;
  document.getElementById('elAlamat').textContent = CONFIG.masjid.alamat;
}

function renderJamTanggal(sekarang){
  document.getElementById('elJam').textContent =
    pad(sekarang.getHours())+':'+pad(sekarang.getMinutes())+':'+pad(sekarang.getSeconds());
  document.getElementById('elTanggal').textContent =
    NAMA_HARI[sekarang.getDay()]+', '+sekarang.getDate()+' '+NAMA_BULAN[sekarang.getMonth()]+' '+sekarang.getFullYear();
}

function renderJadwal(jadwal, sekarang){
  const el = document.getElementById('elJadwal');
  el.innerHTML = '';
  const {urutan, aktifIdx} = cariStatusWaktu(jadwal, sekarang);

  urutan.forEach((item, idx)=>{
    const div = document.createElement('div');
    div.className = 'prayer-item' + (idx === aktifIdx ? ' active' : '');
    const jam = jadwal[item.key];
    div.innerHTML = '<div class="prayer-name">'+item.label+'</div><div class="prayer-time">'+pad(jam.getHours())+':'+pad(jam.getMinutes())+'</div>';
    el.appendChild(div);
  });
}

// ---- 4. Loop utama ----
let jadwalHariIni = null;
let tanggalTerakhirDihitung = null;

function tick(){
  const sekarang = new Date();

  // hitung ulang jadwal kalau gonta hari (mis. lewat tengah malam)
  const tanggalHariIni = sekarang.toDateString();
  if(tanggalHariIni !== tanggalTerakhirDihitung){
    jadwalHariIni = hitungJadwalHariIni(sekarang);
    tanggalTerakhirDihitung = tanggalHariIni;
  }

  renderJamTanggal(sekarang);
  renderJadwal(jadwalHariIni, sekarang);
}

function mulai(){
  renderProfil();
  tick();
  setInterval(tick, (CONFIG.intervalUpdateDetik || 1) * 1000);
}

document.addEventListener('DOMContentLoaded', mulai);
