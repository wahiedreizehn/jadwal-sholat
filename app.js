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



// ============================================================
// Fase 3 - Sinkronisasi dari panel admin (Google Sheets via Apps Script)
// ============================================================

const REMOTE_CACHE_NAME = 'jadwal-sholat-remote-config';
const REMOTE_CACHE_KEY = 'https://cache.local/pengaturan-terakhir';

let KONTEN = { mainSlider: [], runningText: [], infoSlide: [], islamicEvent: [], donasi: [] };

function terapkanRemoteConfig(remote){
  if(!remote) return;
  if(remote.masjid_nama) CONFIG.masjid.nama = remote.masjid_nama;
  if(remote.masjid_alamat) CONFIG.masjid.alamat = remote.masjid_alamat;
  if(remote.masjid_logo !== undefined) CONFIG.masjid.logo = remote.masjid_logo;
  if(remote.masjid_font) CONFIG.masjid.fontNama = remote.masjid_font;

  if(remote.lokasi_lat) CONFIG.lokasi.latitude = parseFloat(remote.lokasi_lat);
  if(remote.lokasi_lng) CONFIG.lokasi.longitude = parseFloat(remote.lokasi_lng);
  if(remote.lokasi_zona) CONFIG.lokasi.zonaWaktu = remote.lokasi_zona;
  if(remote.metode_perhitungan) CONFIG.metodePerhitungan = remote.metode_perhitungan;

  ['subuh','terbit','dzuhur','ashar','maghrib','isya'].forEach((k)=>{
    if(remote['koreksi_'+k] !== undefined) CONFIG.koreksiMenit[k] = parseInt(remote['koreksi_'+k]) || 0;
  });
  ['subuh','dzuhur','ashar','maghrib','isya'].forEach((k)=>{
    if(remote['iqamah_'+k] !== undefined) CONFIG.durasiIqamahMenit[k] = parseInt(remote['iqamah_'+k]) || 0;
  });

  if(remote.durasi_azan_detik) CONFIG.durasiAzanDetik = parseInt(remote.durasi_azan_detik) || CONFIG.durasiAzanDetik;

  if(remote.jumat_aktif !== undefined) CONFIG.shalatJumat.aktif = String(remote.jumat_aktif).toLowerCase() === 'true';
  if(remote.jumat_pesan) CONFIG.shalatJumat.pesan = remote.jumat_pesan;
  if(remote.jumat_durasi_menit) CONFIG.shalatJumat.durasiMenit = parseInt(remote.jumat_durasi_menit) || CONFIG.shalatJumat.durasiMenit;

  if(remote.hijriyah_tampil !== undefined) CONFIG.hijriyah.tampilkan = String(remote.hijriyah_tampil).toLowerCase() === 'true';
  if(remote.hijriyah_koreksi !== undefined) CONFIG.hijriyah.koreksiHari = parseInt(remote.hijriyah_koreksi) || 0;

  KONTEN = {
    mainSlider: remote._mainSlider || KONTEN.mainSlider,
    runningText: remote._runningText || KONTEN.runningText,
    infoSlide: remote._infoSlide || KONTEN.infoSlide,
    islamicEvent: remote._islamicEvent || KONTEN.islamicEvent,
    donasi: remote._donasi || KONTEN.donasi
  };

  // jadwal hari ini perlu dihitung ulang karena lokasi/metode/koreksi bisa berubah
  jadwalHariIni = hitungJadwalHariIni(new Date());
  tanggalTerakhirDihitung = new Date().toDateString();
}

async function simpanCacheRemote(dataText){
  try{
    const cache = await caches.open(REMOTE_CACHE_NAME);
    await cache.put(REMOTE_CACHE_KEY, new Response(dataText));
  }catch(e){ /* Cache Storage tidak wajib berhasil, tidak fatal */ }
}

async function bacaCacheRemote(){
  try{
    const cache = await caches.open(REMOTE_CACHE_NAME);
    const match = await cache.match(REMOTE_CACHE_KEY);
    if(match) return await match.text();
  }catch(e){ /* tidak ada cache tersimpan */ }
  return null;
}

async function sinkronisasiKonfigurasi(){
  const url = CONFIG.sinkronisasi && CONFIG.sinkronisasi.webAppUrl;
  if(!url) return; // belum setup panel admin, pakai config.js apa adanya

  try{
    const res = await fetch(url);
    const teks = await res.text();
    terapkanRemoteConfig(JSON.parse(teks));
    simpanCacheRemote(teks);
  }catch(err){
    const cached = await bacaCacheRemote();
    if(cached){
      try{ terapkanRemoteConfig(JSON.parse(cached)); }catch(e){}
    }
  }
}

// ---- 3b. Running text, info/promosi rotasi, badge hari besar ----
function renderTicker(){
  const list = KONTEN.runningText.map(item => item['Teks']).filter(Boolean);
  const teks = list.length ? list.join('   \u2022   ') : 'Selamat datang';
  document.getElementById('elTicker').textContent = teks;
}

let infoPromosiItems = [];
let infoPromosiIdx = 0;

function bangunDaftarInfoPromosi(){
  const dariMedia = KONTEN.mainSlider.map(item => ({
    judul: item['Judul'] || 'Info',
    deskripsi: item['Tipe (gambar/video/youtube)'] ? ('Media: ' + item['Tipe (gambar/video/youtube)']) : ''
  }));
  const dariInfo = KONTEN.infoSlide.map(item => ({
    judul: item['Judul'] || 'Info',
    deskripsi: item['Deskripsi'] || ''
  }));
  const dariDonasi = KONTEN.donasi.map(item => ({
    judul: 'Donasi \u2014 ' + (item['Nama Rekening/E-wallet'] || ''),
    deskripsi: item['Nomor/Keterangan'] || ''
  }));
  infoPromosiItems = [...dariInfo, ...dariMedia, ...dariDonasi];
}

function renderInfoPromosiSaatIni(){
  const el = document.getElementById('elInfoPromosi');
  if(!infoPromosiItems.length){
    el.innerHTML = '<div class="ip-label">INFO & PROMOSI</div><div class="ip-title">Belum ada info/promosi</div>';
    return;
  }
  const item = infoPromosiItems[infoPromosiIdx % infoPromosiItems.length];
  el.innerHTML = '<div class="ip-label">INFO & PROMOSI</div><div class="ip-title">'+item.judul+'</div>'+(item.deskripsi ? '<div class="ip-desc">'+item.deskripsi+'</div>' : '');
  infoPromosiIdx++;
}

function renderBadgeHariBesar(sekarang){
  const el = document.getElementById('elEventBadge');
  el.innerHTML = '';
  let terdekat = null, selisihHariTerdekat = Infinity;
  KONTEN.islamicEvent.forEach((ev)=>{
    const tgl = new Date(ev['Tanggal (YYYY-MM-DD)']);
    if(isNaN(tgl)) return;
    const selisih = Math.ceil((tgl - sekarang) / (1000*60*60*24));
    if(selisih >= 0 && selisih <= 14 && selisih < selisihHariTerdekat){
      selisihHariTerdekat = selisih;
      terdekat = ev['Nama Acara'];
    }
  });
  if(terdekat){
    el.innerHTML = '<span class="event-badge">H-'+selisihHariTerdekat+' \u00B7 '+terdekat+'</span>';
  }
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
  renderTicker();
  renderBadgeHariBesar(sekarang);
}

async function mulai(){
  renderProfil();
  await sinkronisasiKonfigurasi();
  renderProfil(); // render ulang kalau ada data baru dari sinkronisasi
  bangunDaftarInfoPromosi();
  renderInfoPromosiSaatIni();
  setInterval(renderInfoPromosiSaatIni, 6000);
  tick();
  setInterval(tick, (CONFIG.intervalUpdateDetik || 1) * 1000);

  const menitSync = (CONFIG.sinkronisasi && CONFIG.sinkronisasi.intervalMenit) || 10;
  setInterval(async ()=>{
    await sinkronisasiKonfigurasi();
    renderProfil();
    bangunDaftarInfoPromosi();
  }, menitSync * 60 * 1000);

  // Mode simulasi untuk testing: buka index.html?simulasi=azan atau
  // index.html?simulasi=jumat untuk lihat tampilannya tanpa perlu menunggu
  // waktu sholat sungguhan.
  const params = new URLSearchParams(window.location.search);
  const simulasi = params.get('simulasi');
  if(simulasi === 'azan') setTimeout(()=> mulaiAzan('maghrib'), 800);
  if(simulasi === 'jumat') setTimeout(()=> mulaiModeJumat(), 800);
}

document.addEventListener('DOMContentLoaded', mulai);
