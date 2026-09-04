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
  return formatter.format(tanggalTerkoreksi); // formatter sudah otomatis menyertakan "H" di akhir
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
  document.body.dataset.tema = CONFIG.tema || 'signature';

  document.getElementById('elNamaMasjid').textContent = CONFIG.masjid.nama;
  document.getElementById('elAlamat').textContent = CONFIG.masjid.alamat + (CONFIG.masjid.whatsappAdmin ? '  \u00B7  WA Admin: ' + CONFIG.masjid.whatsappAdmin : '');

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

  if(CONFIG.ramadhan && CONFIG.ramadhan.aktif){
    const imsak = new Date(jadwal.subuh);
    imsak.setMinutes(imsak.getMinutes() - (CONFIG.ramadhan.selisihImsakMenit || 10));
    const divImsak = document.createElement('div');
    divImsak.className = 'prayer-item';
    divImsak.innerHTML = '<div class="prayer-name">Imsak</div><div class="prayer-time">'+pad(imsak.getHours())+':'+pad(imsak.getMinutes())+'</div>';
    el.appendChild(divImsak);
  }

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
      if(key === 'isya' && CONFIG.ramadhan && CONFIG.ramadhan.aktif){
        mulaiModeTarawih();
      } else {
        modeAktif = 'normal';
      }
      return;
    }
    render();
  }, 1000);
}

function mulaiModeTarawih(){
  modeAktif = 'tarawih';
  document.getElementById('ovTarawih').classList.add('active');
  clearTimeout(timerHandle);
  timerHandle = setTimeout(()=>{
    document.getElementById('ovTarawih').classList.remove('active');
    modeAktif = 'normal';
  }, (CONFIG.ramadhan.durasiTarawihMenit || 45) * 60 * 1000);
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
// Sinkronisasi dari panel admin (Firebase Firestore, real-time)
// ============================================================

let KONTEN = { mainSlider: [], runningText: [], infoSlide: [], islamicEvent: [], donasi: [], jumbotron: [] };
let dbFirestore = null;

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

  if(remote.masjid_whatsapp !== undefined) CONFIG.masjid.whatsappAdmin = remote.masjid_whatsapp;
  if(remote.tema) CONFIG.tema = remote.tema;

  if(remote.jumbotron_aktif !== undefined) CONFIG.jumbotron.aktif = String(remote.jumbotron_aktif).toLowerCase() === 'true';
  if(remote.jumbotron_menit_sebelum !== undefined) CONFIG.jumbotron.sembunyikanMenitSebelum = parseInt(remote.jumbotron_menit_sebelum) || 10;

  if(remote.ramadhan_aktif !== undefined) CONFIG.ramadhan.aktif = String(remote.ramadhan_aktif).toLowerCase() === 'true';
  if(remote.ramadhan_selisih_imsak_menit !== undefined) CONFIG.ramadhan.selisihImsakMenit = parseInt(remote.ramadhan_selisih_imsak_menit) || 10;
  if(remote.ramadhan_durasi_tarawih_menit !== undefined) CONFIG.ramadhan.durasiTarawihMenit = parseInt(remote.ramadhan_durasi_tarawih_menit) || 45;

  if(remote.murattal_aktif !== undefined) CONFIG.murattal.aktif = String(remote.murattal_aktif).toLowerCase() === 'true';
  if(remote.murattal_menit_sebelum !== undefined) CONFIG.murattal.menitSebelumAzan = parseInt(remote.murattal_menit_sebelum) || 10;
  if(remote.murattal_file !== undefined) CONFIG.murattal.file = remote.murattal_file;

  if(remote.hemat_energi_aktif !== undefined) CONFIG.hematEnergi.aktif = String(remote.hemat_energi_aktif).toLowerCase() === 'true';
  if(remote.hemat_mulai_jam) CONFIG.hematEnergi.mulaiJam = remote.hemat_mulai_jam;
  if(remote.hemat_selesai_jam) CONFIG.hematEnergi.selesaiJam = remote.hemat_selesai_jam;

  // jadwal hari ini perlu dihitung ulang karena lokasi/metode/koreksi bisa berubah
  jadwalHariIni = hitungJadwalHariIni(new Date());
  tanggalTerakhirDihitung = new Date().toDateString();

  renderProfil();
}

function pasangListenerFirestore(){
  if(!window.firebase || !FIREBASE_CONFIG || FIREBASE_CONFIG.apiKey === 'TEMPEL_DI_SINI'){
    return; // firebase-config.js belum diisi, jalan dengan config.js lokal saja
  }

  firebase.initializeApp(FIREBASE_CONFIG);
  dbFirestore = firebase.firestore();
  try{ dbFirestore.enablePersistence({synchronizeTabs:true}); }catch(e){ /* offline persistence gagal diaktifkan, tidak fatal */ }

  // Dengarkan perubahan pengaturan utama secara real-time
  dbFirestore.collection('pengaturan').doc('utama').onSnapshot((doc)=>{
    if(doc.exists) terapkanRemoteConfig(doc.data());
  }, (err)=>{ console.warn('Gagal dengarkan pengaturan:', err); });

  // Dengarkan tiap koleksi list secara real-time
  const daftarKoleksi = {
    mainSlider: 'mainSlider', runningText: 'runningText', infoSlide: 'infoSlide',
    islamicEvent: 'islamicEvent', donasi: 'donasi', jumbotron: 'jumbotron'
  };
  Object.keys(daftarKoleksi).forEach((namaLokal)=>{
    dbFirestore.collection(daftarKoleksi[namaLokal]).onSnapshot((snap)=>{
      KONTEN[namaLokal] = snap.docs.map(d => d.data());
      if(namaLokal === 'jumbotron'){
        bangunDaftarJumbotron();
      } else {
        bangunDaftarInfoPromosi();
        renderInfoTrack();
      }
    }, (err)=>{ console.warn('Gagal dengarkan '+namaLokal+':', err); });
  });
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
  infoItems = [
    ...KONTEN.infoSlide.map(item => ({ judul: item['Judul'] || 'Info', deskripsi: item['Deskripsi'] || '' })),
    ...KONTEN.donasi.map(item => ({
      judul: 'Donasi \u2014 ' + (item['Nama Rekening/E-wallet'] || ''),
      deskripsi: String(item['Nomor/Keterangan'] || '')
    }))
  ];
  mediaItems = KONTEN.mainSlider.map(item => ({
    tipe: (item['Tipe (gambar/video/youtube)'] || '').toLowerCase().trim(),
    url: item['URL'] || '',
    judul: item['Judul'] || ''
  })).filter(m => m.url);
}

function idYoutubeDari(url){
  const m = url.match(/(?:youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/);
  return m ? m[1] : null;
}

// ---- Blok INFO: scroll vertikal berkelanjutan, header tetap di atas ----
let infoItems = [];

function renderInfoTrack(){
  const track = document.getElementById('elInfoTrack');
  if(!infoItems.length){
    track.style.animation = 'none';
    track.innerHTML = '<div class="info-item"><div class="ip-title">Belum ada info</div></div>';
    return;
  }
  // list digandakan 2x supaya animasi scroll bisa looping mulus tanpa "patah"
  const htmlSatuSet = infoItems.map(item =>
    '<div class="info-item"><div class="ip-title">'+item.judul+'</div>'+(item.deskripsi ? '<div class="ip-desc">'+item.deskripsi+'</div>' : '')+'</div>'
  ).join('');
  track.innerHTML = htmlSatuSet + htmlSatuSet;

  // durasi scroll menyesuaikan jumlah item, supaya kecepatan bacanya konsisten
  const durasiDetik = Math.max(infoItems.length * 6, 10);
  track.style.animation = 'scroll-up '+durasiDetik+'s linear infinite';
}

// ---- Blok MEDIA: rotasi gambar/video/YouTube, video ditunggu sampai
// selesai diputar dulu baru pindah item berikutnya ----
let mediaItems = [];
let mediaIdx = 0;
let mediaTimerHandle = null;

function jadwalkanMediaBerikutnya(delayMs){
  clearTimeout(mediaTimerHandle);
  mediaTimerHandle = setTimeout(renderMediaSaatIni, delayMs);
}

function renderMediaSaatIni(){
  const el = document.getElementById('elMediaBlock');
  if(!mediaItems.length){
    el.innerHTML = '<div class="ip-empty">Belum ada media promosi</div>';
    return;
  }

  let item = mediaItems[mediaIdx % mediaItems.length];
  if(item.tipe === 'youtube' && !navigator.onLine && mediaItems.length > 1){
    mediaIdx++;
    item = mediaItems[mediaIdx % mediaItems.length];
  }
  mediaIdx++;

  if(item.tipe === 'gambar'){
    el.innerHTML = '<img src="'+item.url+'" alt="'+(item.judul||'')+'" class="ip-media" onerror="this.replaceWith(document.createTextNode(\'Gagal memuat gambar\'))">';
    jadwalkanMediaBerikutnya(10000); // gambar tampil 10 detik
  } else if(item.tipe === 'video'){
    el.innerHTML = '<video src="'+item.url+'" class="ip-media" autoplay muted playsinline></video>';
    const videoEl = el.querySelector('video');
    videoEl.addEventListener('ended', ()=> renderMediaSaatIni());
    videoEl.addEventListener('error', ()=> jadwalkanMediaBerikutnya(3000)); // gagal load, coba item berikutnya
  } else if(item.tipe === 'youtube'){
    const id = idYoutubeDari(item.url);
    if(id){
      el.innerHTML = '<iframe class="ip-media" src="https://www.youtube.com/embed/'+id+'?autoplay=1&mute=1&controls=0" allow="autoplay" frameborder="0"></iframe>';
      jadwalkanMediaBerikutnya(30000); // YouTube: kita tidak bisa deteksi "selesai" dengan mudah, kasih durasi tetap 30 detik
    } else {
      jadwalkanMediaBerikutnya(1000);
    }
  } else {
    jadwalkanMediaBerikutnya(1000);
  }
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

// ---- Jumbotron: fullscreen media, sembunyi otomatis dekat waktu sholat ----
let jumbotronItems = [];
let jumbotronIdx = 0;
let jumbotronTimerHandle = null;
let jumbotronSedangTampil = false;

function bangunDaftarJumbotron(){
  jumbotronItems = KONTEN.jumbotron.map(item => ({
    tipe: (item['Tipe (gambar/video/youtube)'] || '').toLowerCase().trim(),
    url: item['URL'] || ''
  })).filter(m => m.url);
}

function menitKeSholatBerikutnya(jadwal, sekarang){
  let terdekat = Infinity;
  WAKTU_SHOLAT_KEYS.forEach((key)=>{
    const selisihMs = jadwal[key] - sekarang;
    if(selisihMs > 0) terdekat = Math.min(terdekat, selisihMs / 60000);
  });
  return terdekat;
}

function renderJumbotronSaatIni(){
  const el = document.getElementById('ovJumbotron');
  if(!jumbotronItems.length) return;
  let item = jumbotronItems[jumbotronIdx % jumbotronItems.length];
  if(item.tipe === 'youtube' && !navigator.onLine && jumbotronItems.length > 1){
    jumbotronIdx++;
    item = jumbotronItems[jumbotronIdx % jumbotronItems.length];
  }
  jumbotronIdx++;

  clearTimeout(jumbotronTimerHandle);
  if(item.tipe === 'gambar'){
    el.innerHTML = '<img src="'+item.url+'" class="jb-media">';
    jumbotronTimerHandle = setTimeout(renderJumbotronSaatIni, 12000);
  } else if(item.tipe === 'video'){
    el.innerHTML = '<video src="'+item.url+'" class="jb-media" autoplay muted playsinline></video>';
    el.querySelector('video').addEventListener('ended', renderJumbotronSaatIni);
  } else if(item.tipe === 'youtube'){
    const id = idYoutubeDari(item.url);
    if(id){
      el.innerHTML = '<iframe class="jb-media" src="https://www.youtube.com/embed/'+id+'?autoplay=1&mute=1&controls=0" allow="autoplay" frameborder="0"></iframe>';
      jumbotronTimerHandle = setTimeout(renderJumbotronSaatIni, 30000);
    } else {
      jumbotronTimerHandle = setTimeout(renderJumbotronSaatIni, 1000);
    }
  }
}

function cekJumbotron(jadwal, sekarang){
  if(!CONFIG.jumbotron || !CONFIG.jumbotron.aktif || !jumbotronItems.length) return;

  const bolehTampil = modeAktif === 'normal' &&
    menitKeSholatBerikutnya(jadwal, sekarang) > (CONFIG.jumbotron.sembunyikanMenitSebelum || 10);

  if(bolehTampil && !jumbotronSedangTampil){
    jumbotronSedangTampil = true;
    document.getElementById('layarUtama').classList.add('tersembunyi');
    document.getElementById('ovJumbotron').classList.add('active');
    renderJumbotronSaatIni();
  } else if(!bolehTampil && jumbotronSedangTampil){
    jumbotronSedangTampil = false;
    clearTimeout(jumbotronTimerHandle);
    document.getElementById('layarUtama').classList.remove('tersembunyi');
    document.getElementById('ovJumbotron').classList.remove('active');
  }
}

// ---- Murattal terjadwal: putar audio X menit sebelum waktu sholat ----
let murattalTriggerHariIni = new Set();

function cekMurattal(jadwal, sekarang){
  if(!CONFIG.murattal || !CONFIG.murattal.aktif || !CONFIG.murattal.file) return;
  WAKTU_SHOLAT_KEYS.forEach((key)=>{
    const waktuPutar = new Date(jadwal[key]);
    waktuPutar.setMinutes(waktuPutar.getMinutes() - (CONFIG.murattal.menitSebelumAzan || 10));
    const cocokMenit = sekarang.getHours() === waktuPutar.getHours() && sekarang.getMinutes() === waktuPutar.getMinutes();
    const idHariIni = 'murattal-' + key + '-' + sekarang.toDateString();
    if(cocokMenit && !murattalTriggerHariIni.has(idHariIni)){
      murattalTriggerHariIni.add(idHariIni);
      const audio = document.getElementById('audioMurattal');
      audio.src = CONFIG.murattal.file;
      audio.play().catch(()=>{});
    }
  });
}

// ---- Mode hemat energi: layar gelap total di luar jam aktif ----
function dalamRentangJam(sekarang, mulaiStr, selesaiStr){
  const [jm, mm] = mulaiStr.split(':').map(Number);
  const [js, ms] = selesaiStr.split(':').map(Number);
  const menitSekarang = sekarang.getHours()*60 + sekarang.getMinutes();
  const menitMulai = jm*60 + mm;
  const menitSelesai = js*60 + ms;
  if(menitMulai <= menitSelesai) return menitSekarang >= menitMulai && menitSekarang < menitSelesai;
  return menitSekarang >= menitMulai || menitSekarang < menitSelesai; // rentang melewati tengah malam
}

function cekHematEnergi(sekarang){
  const el = document.getElementById('ovHematEnergi');
  if(!CONFIG.hematEnergi || !CONFIG.hematEnergi.aktif){ el.classList.remove('active'); return; }

  const gelap = dalamRentangJam(sekarang, CONFIG.hematEnergi.mulaiJam, CONFIG.hematEnergi.selesaiJam) && modeAktif === 'normal';
  el.classList.toggle('active', gelap);
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
    murattalTriggerHariIni.clear();
  }

  renderJamTanggal(sekarang);
  renderJadwal(jadwalHariIni, sekarang);
  cekTriggerAzan(jadwalHariIni, sekarang);
  renderTicker();
  renderBadgeHariBesar(sekarang);
  cekJumbotron(jadwalHariIni, sekarang);
  cekMurattal(jadwalHariIni, sekarang);
  cekHematEnergi(sekarang);
}

async function mulai(){
  renderProfil();
  pasangListenerFirestore(); // real-time: begitu ada perubahan di panel admin, layar auto-update
  bangunDaftarInfoPromosi();
  renderInfoTrack();
  renderMediaSaatIni();
  bangunDaftarJumbotron();
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
