// ============================================================
// LOGIC PANEL ADMIN - Fase 3
// ============================================================

const FIELD_MAP = {
  f_nama: 'masjid_nama', f_alamat: 'masjid_alamat', f_logo: 'masjid_logo', f_font: 'masjid_font',
  f_lat: 'lokasi_lat', f_lng: 'lokasi_lng', f_zona: 'lokasi_zona', f_metode: 'metode_perhitungan',
  k_subuh: 'koreksi_subuh', k_terbit: 'koreksi_terbit', k_dzuhur: 'koreksi_dzuhur',
  k_ashar: 'koreksi_ashar', k_maghrib: 'koreksi_maghrib', k_isya: 'koreksi_isya',
  iq_subuh: 'iqamah_subuh', iq_dzuhur: 'iqamah_dzuhur', iq_ashar: 'iqamah_ashar',
  iq_maghrib: 'iqamah_maghrib', iq_isya: 'iqamah_isya',
  f_durasiAzan: 'durasi_azan_detik',
  f_jumatPesan: 'jumat_pesan', f_jumatDurasi: 'jumat_durasi_menit',
  f_hijriKoreksi: 'hijriyah_koreksi'
};
const CHECKBOX_MAP = { f_jumatAktif: 'jumat_aktif', f_hijriTampil: 'hijriyah_tampil' };

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
    const res = await fetch(ADMIN_CONFIG.WEB_APP_URL);
    const data = await res.json();
    isiForm(data);
    setStatus('Data termuat', 'ok');
  }catch(err){
    setStatus('Gagal memuat (cek Web App URL & koneksi)', 'err');
  }
}

async function simpanData(){
  const btn = document.getElementById('btnSave');
  btn.disabled = true;
  setStatus('Menyimpan...', 'wait');
  try{
    const payload = kumpulkanForm();
    const res = await fetch(ADMIN_CONFIG.WEB_APP_URL, {
      method: 'POST',
      body: JSON.stringify(payload) // sengaja tanpa header content-type JSON eksplisit, supaya browser tidak kirim preflight OPTIONS yang tidak didukung Apps Script
    });
    const hasil = await res.json();
    if(hasil.sukses){
      setStatus('Tersimpan \u2713', 'ok');
    } else {
      setStatus(hasil.pesan || 'Gagal disimpan', 'err');
    }
  }catch(err){
    setStatus('Gagal menyimpan (cek koneksi)', 'err');
  }
  btn.disabled = false;
}

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

muatData();
