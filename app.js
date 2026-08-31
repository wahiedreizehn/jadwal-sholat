// ============================================================
// LOGIC UTAMA - Fase 1: Jadwal Sholat Offline
// ============================================================

const NAMA_HARI = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
const NAMA_BULAN = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

function pad(n){ return n.toString().padStart(2,'0'); }

// ---- Tanggal Hijriyah, pakai kalender bawaan browser (Intl), 100% offline ----
function hitungTanggalHijriyah(sekarang){
  const koreksi = (CONFIG.hijriyah && CONFIG.hijriyah.koreksiHari) || 0;
  const tanggalTerkoreksi = new Date(sekarang);
  tanggalTerkoreksi.setDate(tanggalTerkoreksi.getDate() + koreksi);

  const formatter = new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
  return formatter.format(tanggalTerkoreksi) + ' H';
}

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

  const elNama = document.getElementById('elNamaMasjid');
  elNama.classList.toggle('font-serif', CONFIG.masjid.fontNama !== 'sans');
  elNama.classList.toggle('font-sans', CONFIG.masjid.fontNama === 'sans');

  const elLogo = document.getElementById('elLogo');
  if(CONFIG.masjid.logo){
    elLogo.src = CONFIG.masjid.logo;
    elLogo.style.display = 'block';
  } else {
    elLogo.style.display = 'none';
  }
}

function renderJamTanggal(sekarang){
  document.getElementById('elJam').textContent =
    pad(sekarang.getHours())+':'+pad(sekarang.getMinutes())+':'+pad(sekarang.getSeconds());

  let teksTanggal = NAMA_HARI[sekarang.getDay()]+', '+sekarang.getDate()+' '+NAMA_BULAN[sekarang.getMonth()]+' '+sekarang.getFullYear();
  if(CONFIG.hijriyah && CONFIG.hijriyah.tampilkan){
    teksTanggal += '  \u00B7  ' + hitungTanggalHijriyah(sekarang);
  }
  document.getElementById('elTanggal').textContent = teksTanggal;
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

// ============================================================
// Fase 2 - Azan Screen, Iqamah Screen, Mode Shalat Jumat
// ============================================================

const WAKTU_SHOLAT_KEYS = ['subuh','dzuhur','ashar','maghrib','isya'];
const NAMA_TAMPIL = {subuh:'Subuh', dzuhur:'Dzuhur', ashar:'Ashar', maghrib:'Maghrib', isya:'Isya'};

let modeAktif = 'normal'; // normal | azan | iqamah | jumat
let waktuTriggerHariIni = new Set(); // supaya tiap waktu sholat cuma trigger 1x per hari
let pesanIqamahIdx = 0;
let timerHandle = null;

function isHariJumat(d){ return d.getDay() === 5; }

function mulaiAzan(key){
  modeAktif = 'azan';
  document.getElementById('ovAzanNama').textContent = NAMA_TAMPIL[key];
  document.getElementById('ovAzan').classList.add('active');

  if(CONFIG.suaraAzan){
    const audio = document.getElementById('audioAzan');
    audio.src = CONFIG.suaraAzan;
    audio.play().catch(()=>{ /* browser mungkin blokir autoplay, tidak fatal */ });
  }

  clearTimeout(timerHandle);
  timerHandle = setTimeout(()=>{
    document.getElementById('ovAzan').classList.remove('active');
    if(key === 'dzuhur' && isHariJumat(new Date()) && CONFIG.shalatJumat && CONFIG.shalatJumat.aktif){
      mulaiModeJumat();
    } else {
      mulaiIqamah(key);
    }
  }, (CONFIG.durasiAzanDetik || 60) * 1000);
}

function mulaiIqamah(key){
  modeAktif = 'iqamah';
  const menit = (CONFIG.durasiIqamahMenit && CONFIG.durasiIqamahMenit[key]) || 10;
  let sisaDetik = menit * 60;

  document.getElementById('ovIqamahNama').textContent = 'MENUJU IQAMAH \u00B7 ' + NAMA_TAMPIL[key];
  document.getElementById('ovIqamah').classList.add('active');

  const pesanList = CONFIG.pesanIqamah && CONFIG.pesanIqamah.length ? CONFIG.pesanIqamah : ['Luruskan dan rapatkan shaf'];
  function tampilkanPesanBerikutnya(){
    document.getElementById('ovIqamahPesan').textContent = pesanList[pesanIqamahIdx % pesanList.length];
    pesanIqamahIdx++;
  }
  tampilkanPesanBerikutnya();
  const pesanInterval = setInterval(tampilkanPesanBerikutnya, 5000);

  function render(){
    const m = Math.floor(sisaDetik/60), s = sisaDetik%60;
    document.getElementById('ovIqamahCountdown').textContent = pad(m)+':'+pad(s);
  }
  render();
  clearTimeout(timerHandle);
  timerHandle = setInterval(()=>{
    sisaDetik--;
    if(sisaDetik < 0){
      clearInterval(timerHandle);
      clearInterval(pesanInterval);
      document.getElementById('ovIqamah').classList.remove('active');
      modeAktif = 'normal';
      return;
    }
    render();
  }, 1000);
}

function mulaiModeJumat(){
  modeAktif = 'jumat';
  document.getElementById('ovJumatPesan').textContent = CONFIG.shalatJumat.pesan || 'Sedang berlangsung Shalat Jumat';
  document.getElementById('ovJumat').classList.add('active');

  clearTimeout(timerHandle);
  timerHandle = setTimeout(()=>{
    document.getElementById('ovJumat').classList.remove('active');
    modeAktif = 'normal';
  }, (CONFIG.shalatJumat.durasiMenit || 45) * 60 * 1000);
}

// Cek tiap detik apakah waktu sekarang pas mengenai salah satu waktu sholat
function cekTriggerAzan(jadwal, sekarang){
  if(modeAktif !== 'normal') return; // sedang dalam mode azan/iqamah/jumat, jangan trigger lagi

  WAKTU_SHOLAT_KEYS.forEach((key)=>{
    const waktu = jadwal[key];
    const cocokMenit = sekarang.getHours() === waktu.getHours() && sekarang.getMinutes() === waktu.getMinutes();
    const idHariIni = key + '-' + sekarang.toDateString();
    if(cocokMenit && !waktuTriggerHariIni.has(idHariIni)){
      waktuTriggerHariIni.add(idHariIni);
      mulaiAzan(key);
    }
  });
}


let jadwalHariIni = null;
let tanggalTerakhirDihitung = null;

function tick(){
  const sekarang = new Date();

  // hitung ulang jadwal kalau gonta hari (mis. lewat tengah malam)
  const tanggalHariIni = sekarang.toDateString();
  if(tanggalHariIni !== tanggalTerakhirDihitung){
    jadwalHariIni = hitungJadwalHariIni(sekarang);
    tanggalTerakhirDihitung = tanggalHariIni;
    waktuTriggerHariIni.clear();
  }

  renderJamTanggal(sekarang);
  renderJadwal(jadwalHariIni, sekarang);
  cekTriggerAzan(jadwalHariIni, sekarang);
}

function mulai(){
  renderProfil();
  tick();
  setInterval(tick, (CONFIG.intervalUpdateDetik || 1) * 1000);

  // Mode simulasi untuk testing: buka index.html?simulasi=azan atau
  // index.html?simulasi=jumat untuk lihat tampilannya tanpa perlu menunggu
  // waktu sholat sungguhan.
  const params = new URLSearchParams(window.location.search);
  const simulasi = params.get('simulasi');
  if(simulasi === 'azan') setTimeout(()=> mulaiAzan('maghrib'), 800);
  if(simulasi === 'jumat') setTimeout(()=> mulaiModeJumat(), 800);
}

document.addEventListener('DOMContentLoaded', mulai);
