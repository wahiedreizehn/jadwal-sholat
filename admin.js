// ============================================================
// LOGIC PANEL ADMIN - Fase 3
// ============================================================

const FIELD_MAP = {
  f_nama: 'masjid_nama', f_alamat: 'masjid_alamat', f_logo: 'masjid_logo', f_font: 'masjid_font',
  f_whatsapp: 'masjid_whatsapp', f_tema: 'tema',
  f_lat: 'lokasi_lat', f_lng: 'lokasi_lng', f_zona: 'lokasi_zona', f_metode: 'metode_perhitungan',
  k_subuh: 'koreksi_subuh', k_terbit: 'koreksi_terbit', k_dzuhur: 'koreksi_dzuhur',
  k_ashar: 'koreksi_ashar', k_maghrib: 'koreksi_maghrib', k_isya: 'koreksi_isya',
  iq_subuh: 'iqamah_subuh', iq_dzuhur: 'iqamah_dzuhur', iq_ashar: 'iqamah_ashar',
  iq_maghrib: 'iqamah_maghrib', iq_isya: 'iqamah_isya',
  f_durasiAzan: 'durasi_azan_detik',
  f_jumatPesan: 'jumat_pesan', f_jumatDurasi: 'jumat_durasi_menit',
  f_hijriKoreksi: 'hijriyah_koreksi',
  f_ramadhanImsak: 'ramadhan_selisih_imsak_menit', f_ramadhanTarawih: 'ramadhan_durasi_tarawih_menit',
  f_jumbotronMenit: 'jumbotron_menit_sebelum',
  f_murattalMenit: 'murattal_menit_sebelum', f_murattalFile: 'murattal_file',
  f_hematMulai: 'hemat_mulai_jam', f_hematSelesai: 'hemat_selesai_jam'
};
const CHECKBOX_MAP = {
  f_jumatAktif: 'jumat_aktif', f_hijriTampil: 'hijriyah_tampil',
  f_ramadhanAktif: 'ramadhan_aktif', f_jumbotronAktif: 'jumbotron_aktif',
  f_murattalAktif: 'murattal_aktif', f_hematAktif: 'hemat_energi_aktif'
};

const LIST_SKEMA = {
  mainSlider: { label: 'Media', kolom: ['Tipe (gambar/video/youtube)', 'URL', 'Judul'] },
  runningText: { label: 'Pesan', kolom: ['Teks'] },
  infoSlide: { label: 'Info', kolom: ['Judul', 'Deskripsi'] },
  islamicEvent: { label: 'Acara', kolom: ['Nama Acara', 'Tanggal (YYYY-MM-DD)'] },
  donasi: { label: 'Rekening', kolom: ['Nama Rekening/E-wallet', 'Nomor/Keterangan', 'URL Gambar QR (opsional)'] },
  jumbotron: { label: 'Media', kolom: ['Tipe (gambar/video/youtube)', 'URL', 'Judul'] }
};
let LIST_DATA = { mainSlider: [], runningText: [], infoSlide: [], islamicEvent: [], donasi: [], jumbotron: [] };

function renderListEditor(nama){
  const skema = LIST_SKEMA[nama];
  const container = document.getElementById('editor_' + nama);
  container.innerHTML = '';
  LIST_DATA[nama].forEach((row, idx)=>{
    const rowEl = document.createElement('div');
    rowEl.className = 'list-row';
    const fieldsHtml = skema.kolom.map((kolom, ki)=>
      '<input type="text" placeholder="'+kolom+'" data-nama="'+nama+'" data-idx="'+idx+'" data-kolom="'+ki+'" value="'+(row[kolom] !== undefined ? String(row[kolom]).replace(/"/g,'&quot;') : '')+'">'
    ).join('');
    rowEl.innerHTML = '<div class="list-fields">'+fieldsHtml+'</div><button class="btn-hapus" data-hapus="'+nama+'" data-idx="'+idx+'">Hapus</button>';
    container.appendChild(rowEl);
  });
}

function renderSemuaListEditor(){
  Object.keys(LIST_SKEMA).forEach(renderListEditor);
}

document.querySelectorAll('.form-body').forEach((body)=>{
  body.addEventListener('input', (e)=>{
    if(e.target.dataset.nama !== undefined){
      const {nama, idx, kolom} = e.target.dataset;
      const namaKolom = LIST_SKEMA[nama].kolom[parseInt(kolom)];
      LIST_DATA[nama][parseInt(idx)][namaKolom] = e.target.value;
    }
  });
  body.addEventListener('click', (e)=>{
    if(e.target.dataset.tambah){
      const nama = e.target.dataset.tambah;
      const rowKosong = {};
      LIST_SKEMA[nama].kolom.forEach(k => rowKosong[k] = '');
      LIST_DATA[nama].push(rowKosong);
      renderListEditor(nama);
    }
    if(e.target.dataset.hapus){
      const nama = e.target.dataset.hapus;
      LIST_DATA[nama].splice(parseInt(e.target.dataset.idx), 1);
      renderListEditor(nama);
    }
  });
});


function setStatus(teks, tipe){
  const el = document.getElementById('elStatus');
  el.textContent = teks;
  el.className = 'status ' + tipe;
}

function isiForm(data){
  Object.keys(FIELD_MAP).forEach((id)=>{
    const el = document.getElementById(id);
    if(el && data[FIELD_MAP[id]] !== undefined) el.value = data[FIELD_MAP[id]];
  });
  Object.keys(CHECKBOX_MAP).forEach((id)=>{
    const el = document.getElementById(id);
    if(el) el.checked = String(data[CHECKBOX_MAP[id]]).toLowerCase() === 'true';
  });
  updatePreview();
}

function kumpulkanForm(){
  const hasil = { secret: ADMIN_CONFIG.SECRET };
  Object.keys(FIELD_MAP).forEach((id)=>{
    const el = document.getElementById(id);
    if(el) hasil[FIELD_MAP[id]] = el.value;
  });
  Object.keys(CHECKBOX_MAP).forEach((id)=>{
    const el = document.getElementById(id);
    if(el) hasil[CHECKBOX_MAP[id]] = el.checked ? 'true' : 'false';
  });
  return hasil;
}

function updatePreview(){
  document.getElementById('pv_nama').textContent = document.getElementById('f_nama').value || 'Nama Masjid';
  document.getElementById('pv_alamat').textContent = document.getElementById('f_alamat').value || 'Alamat';
  document.getElementById('pv_iqMaghrib').textContent = document.getElementById('iq_maghrib').value || '0';

  const pvNama = document.getElementById('pv_nama');
  const font = document.getElementById('f_font').value;
  pvNama.classList.toggle('font-serif', font !== 'sans');
  pvNama.classList.toggle('font-sans', font === 'sans');
}

async function muatData(){
  setStatus('Memuat data...', 'wait');
  try{
    const doc = await dbFirestore.collection('pengaturan').doc('utama').get();
    const data = doc.exists ? doc.data() : {};
    isiForm(data);

    const namaKoleksi = { mainSlider: 'mainSlider', runningText: 'runningText', infoSlide: 'infoSlide', islamicEvent: 'islamicEvent', donasi: 'donasi', jumbotron: 'jumbotron' };
    for(const nama of Object.keys(namaKoleksi)){
      const snap = await dbFirestore.collection(namaKoleksi[nama]).get();
      LIST_DATA[nama] = snap.docs.map(d => d.data());
    }
    renderSemuaListEditor();
    setStatus('Data termuat', 'ok');
  }catch(err){
    console.error(err);
    setStatus('Gagal memuat (cek koneksi/login)', 'err');
  }
}

async function simpanData(){
  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  setStatus('Menyimpan...', 'wait');
  try{
    const payload = kumpulkanForm();
    await dbFirestore.collection('pengaturan').doc('utama').set(payload, {merge: true});

    const namaKoleksi = { mainSlider: 'mainSlider', runningText: 'runningText', infoSlide: 'infoSlide', islamicEvent: 'islamicEvent', donasi: 'donasi', jumbotron: 'jumbotron' };
    for(const nama of Object.keys(namaKoleksi)){
      const ref = dbFirestore.collection(namaKoleksi[nama]);
      const existing = await ref.get();
      const batch = dbFirestore.batch();
      existing.docs.forEach(d => batch.delete(d.ref));
      LIST_DATA[nama].forEach((row)=>{
        const isiRow = {};
        LIST_SKEMA[nama].kolom.forEach(k => isiRow[k] = row[k] || '');
        batch.set(ref.doc(), isiRow);
      });
      await batch.commit();
    }

    setStatus('Tersimpan \u2713', 'ok');
  }catch(err){
    console.error(err);
    setStatus('Gagal menyimpan (cek koneksi/login)', 'err');
  }
  btn.disabled = false;
}

// ---- Login & inisialisasi Firebase ----
firebase.initializeApp(FIREBASE_CONFIG);
const dbFirestore = firebase.firestore();
const authFirebase = firebase.auth();

authFirebase.onAuthStateChanged((user)=>{
  if(user){
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appContent').style.display = 'grid';
    muatData();
  } else {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appContent').style.display = 'none';
  }
});

document.getElementById('btnLogin').addEventListener('click', async ()=>{
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  document.getElementById('loginError').textContent = '';
  try{
    await authFirebase.signInWithEmailAndPassword(email, password);
  }catch(err){
    document.getElementById('loginError').textContent = 'Email/password salah, atau belum dibuat di Firebase Console > Authentication.';
  }
});

document.getElementById('btnLogout').addEventListener('click', ()=> authFirebase.signOut());

document.querySelectorAll('.tab').forEach((tab)=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c=>c.classList.remove('active'));
    tab.classList.add('active');
    document.querySelector('.tab-content[data-tab="'+tab.dataset.tab+'"]').classList.add('active');
  });
});

document.querySelectorAll('.form-body input, .form-body select').forEach((el)=>{
  el.addEventListener('input', updatePreview);
  el.addEventListener('change', updatePreview);
});

document.getElementById('btnSave').addEventListener('click', simpanData);
document.getElementById('btnReload').addEventListener('click', muatData);
