// GANTI URL DI BAWAH DENGAN URL WEB APP GOOGLE APPS SCRIPT ANDA
const API_URL = "https://script.google.com/macros/s/AKfycby0yF--8KcOcSgnyLCXF1po6RLisy54uZQMNcU_aNcwoqq-AZAD23CQUzUB4dZKUL7Ehw/exec";

let globalData = {
  widyaiswara: [],
  bahanAjar: []
};

// Fungsi Pindah Tab Navigasi
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(el => el.classList.remove('active'));

  const targetPage = document.getElementById(`page-${tabName}`);
  const targetNav = document.getElementById(`nav-${tabName}`);

  if (targetPage) targetPage.classList.remove('hidden');
  if (targetNav) targetNav.classList.add('active');
}

// Mengambil Data dari Apps Script (GET)
async function loadAllData() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    
    globalData.widyaiswara = data.Data_Widyaiswara || [];
    globalData.bahanAjar = data.Bahan_Ajar || [];

    renderDashboard();
    renderDirektori(globalData.widyaiswara);
    renderBahanAjar(globalData.bahanAjar);
  } catch (err) {
    console.error("Gagal mengambil data:", err);
  }
}

// Render Statistik & Grafik Dashboard
function renderDashboard() {
  const wi = globalData.widyaiswara;
  document.getElementById('stat-total-wi').innerText = wi.length;
  document.getElementById('stat-utama-wi').innerText = wi.filter(d => d.Jenjang_Jabatan === 'Ahli Utama').length;
  document.getElementById('stat-pusat-wi').innerText = wi.filter(d => d.Penempatan_Pusat === 'Pusat').length;
  document.getElementById('stat-total-bahan').innerText = globalData.bahanAjar.length;

  // Chart Jabatan
  const jabatanCounts = { 'Ahli Pertama': 0, 'Ahli Muda': 0, 'Ahli Madya': 0, 'Ahli Utama': 0 };
  wi.forEach(d => { if (jabatanCounts[d.Jenjang_Jabatan] !== undefined) jabatanCounts[d.Jenjang_Jabatan]++; });

  const ctxJabatan = document.getElementById('chartJabatan').getContext('2d');
  new Chart(ctxJabatan, {
    type: 'doughnut',
    data: {
      labels: Object.keys(jabatanCounts),
      datasets: [{
        data: Object.values(jabatanCounts),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#1e3a8a']
      }]
    }
  });
}

// Render Cards Direktori Widyaiswara
function renderDirektori(list) {
  const grid = document.getElementById('gridWidyaiswara');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = `<p class="col-span-3 text-center text-slate-500 py-8">Belum ada data Widyaiswara.</p>`;
    return;
  }

  list.forEach(wi => {
    const photo = wi.Link_Foto_Profil || 'https://via.placeholder.com/150';
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between';
    card.innerHTML = `
      <div>
        <div class="flex items-center gap-4 mb-4">
          <img src="${photo}" class="w-16 h-16 rounded-full object-cover border-2 border-blue-900">
          <div>
            <h3 class="font-bold text-slate-800 leading-tight">${wi.Nama_Lengkap}</h3>
            <p class="text-xs text-slate-500 font-mono mt-1">${wi.NIP}</p>
            <span class="inline-block mt-1 bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">${wi.Jenjang_Jabatan}</span>
          </div>
        </div>
        <p class="text-xs text-slate-600 line-clamp-2"><i class="fa-solid fa-briefcase mr-1 text-slate-400"></i>${wi.Fokus_Kompetensi || 'Spesialisasi belum diisi'}</p>
      </div>
      <button onclick="viewDetail('${wi.NIP}')" class="mt-4 w-full bg-slate-100 text-slate-700 hover:bg-blue-900 hover:text-white py-2 rounded text-xs font-semibold transition">
        Lihat Profil Lengkap
      </button>
    `;
    grid.appendChild(card);
  });
}

// Filter Pencarian Widyaiswara
function filterWI() {
  const q = document.getElementById('searchWI').value.toLowerCase();
  const filtered = globalData.widyaiswara.filter(d => 
    (d.Nama_Lengkap && d.Nama_Lengkap.toLowerCase().includes(q)) ||
    (d.NIP && d.NIP.toString().includes(q)) ||
    (d.Fokus_Kompetensi && d.Fokus_Kompetensi.toLowerCase().includes(q))
  );
  renderDirektori(filtered);
}

// Tampilkan Detail Per Orang
function viewDetail(nip) {
  const wi = globalData.widyaiswara.find(d => String(d.NIP) === String(nip));
  if (!wi) return;

  document.getElementById('detail-nama').innerText = wi.Nama_Lengkap;
  document.getElementById('detail-nip').innerText = 'NIP: ' + wi.NIP;
  document.getElementById('detail-jenjang').innerText = wi.Jenjang_Jabatan;
  document.getElementById('detail-pangkat').innerText = wi.Pangkat_Golongan || '-';
  document.getElementById('detail-penempatan').innerText = wi.Penempatan_Pusat || '-';
  document.getElementById('detail-unit').innerText = wi.Unit_Kerja || '-';
  document.getElementById('detail-email').innerText = wi.Email || '-';
  document.getElementById('detail-wa').innerText = wi.No_Whatsapp || '-';
  document.getElementById('detail-status').innerText = wi.Status_Keaktifan || 'Aktif';
  document.getElementById('detail-s1').innerText = wi.Pendidikan_S1 || '-';
  document.getElementById('detail-s2').innerText = wi.Pendidikan_S2 || '-';
  document.getElementById('detail-s3').innerText = wi.Pendidikan_S3 || '-';
  document.getElementById('detail-kompetensi').innerText = wi.Fokus_Kompetensi || '-';
  document.getElementById('detail-foto').src = wi.Link_Foto_Profil || 'https://via.placeholder.com/150';

  switchTab('detail');
}

// Render Tabel Bahan Ajar
function renderBahanAjar(list) {
  const body = document.getElementById('tableBahanAjarBody');
  body.innerHTML = '';

  if (list.length === 0) {
    body.innerHTML = `<tr><td colspan="5" class="p-4 text-center text-slate-400">Belum ada bahan ajar.</td></tr>`;
    return;
  }

  list.forEach(b => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="p-3 font-semibold text-slate-800">${b.Judul_Materi}</td>
      <td class="p-3">${b.Mata_Pelatihan || '-'}</td>
      <td class="p-3"><span class="bg-slate-100 text-slate-800 text-xs px-2 py-0.5 rounded">${b.Jenis_Bahan || 'Modul'}</span></td>
      <td class="p-3 font-mono text-xs">${b.NIP_Widyaiswara || '-'}</td>
      <td class="p-3">
        <a href="${b.Link_File_Drive}" target="_blank" class="text-blue-700 hover:underline text-xs font-semibold">
          <i class="fa-solid fa-download mr-1"></i> Buka File
        </a>
      </td>
    `;
    body.appendChild(row);
  });
}

// Kirim Data dari Form (POST)
document.getElementById('formWidyaiswara').addEventListener('submit', async function(e) {
  e.preventDefault();
  const btn = document.getElementById('btnSubmitData');
  btn.disabled = true;
  btn.innerText = 'Menyimpan...';

  const formData = {
    targetTable: "Data_Widyaiswara",
    data: {
      NIP: document.getElementById('inp_NIP').value,
      Nama_Lengkap: document.getElementById('inp_Nama_Lengkap').value,
      Jenis_Kelamin: document.getElementById('inp_Jenis_Kelamin').value,
      Jenjang_Jabatan: document.getElementById('inp_Jenjang_Jabatan').value,
      Pangkat_Golongan: document.getElementById('inp_Pangkat_Golongan').value,
      Penempatan_Pusat: document.getElementById('inp_Penempatan_Pusat').value,
      Unit_Kerja: document.getElementById('inp_Unit_Kerja').value,
      Email: document.getElementById('inp_Email').value,
      No_Whatsapp: document.getElementById('inp_No_Whatsapp').value,
      Rumpun_Spesialisasi: document.getElementById('inp_Rumpun_Spesialisasi').value,
      Fokus_Kompetensi: document.getElementById('inp_Fokus_Kompetensi').value,
      Pendidikan_S1: document.getElementById('inp_Pendidikan_S1').value,
      Pendidikan_S2: document.getElementById('inp_Pendidikan_S2').value,
      Pendidikan_S3: document.getElementById('inp_Pendidikan_S3').value,
      Link_Foto_Profil: document.getElementById('inp_Link_Foto_Profil').value,
      Status_Keaktifan: document.getElementById('inp_Status_Keaktifan').value
    }
  };

  try {
    await fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify(formData)
    });
    alert('Data Widyaiswara Berhasil Disimpan!');
    this.reset();
    loadAllData();
    switchTab('direktori');
  } catch (err) {
    alert('Gagal menyimpan data.');
    console.error(err);
  } finally {
    btn.disabled = false;
    btn.innerText = 'Simpan Data Widyaiswara';
  }
});

// Load awal
loadAllData();
