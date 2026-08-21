// Konfigurasi Web App URL Google Apps Script Anda
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby0yF--8KcOcSgnyLCXF1po6RLisy54uZQMNcU_aNcwoqq-AZAD23CQUzUB4dZKUL7Ehw/exec";

let allWidyaiswara = [];
let allBahanAjar = [];

// ==========================================
// 1. FUNGSI NAVIGASI TAB UTAMA & SUBFORM
// ==========================================
function switchTab(tabName) {
  // Sembunyikan semua tab content
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  
  // Tampilkan tab yang dipilih
  const targetTab = document.getElementById(`page-${tabName}`);
  if (targetTab) targetTab.classList.remove('hidden');

  // Update status tombol navigasi
  document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active', 'bg-blue-800'));
  const activeNav = document.getElementById(`nav-${tabName}`);
  if (activeNav) activeNav.classList.add('active', 'bg-blue-800');
}

function switchFormTab(formId) {
  // Sembunyikan semua sub-form
  document.querySelectorAll('.subform-content').forEach(el => el.classList.add('hidden'));
  
  // Tampilkan sub-form yang dipilih
  const targetForm = document.getElementById(formId);
  if (targetForm) targetForm.classList.remove('hidden');

  // Update status tombol subnav
  document.querySelectorAll('.subform-btn').forEach(btn => {
    btn.classList.remove('active', 'bg-blue-900', 'text-white');
    btn.classList.add('bg-slate-200', 'text-slate-700');
  });

  const activeSubnav = document.getElementById(`subnav-${formId}`);
  if (activeSubnav) {
    activeSubnav.classList.add('active', 'bg-blue-900', 'text-white');
    activeSubnav.classList.remove('bg-slate-200', 'text-slate-700');
  }
}

// ==========================================
// 2. LOAD & RENDER DATA (GET REQUEST)
// ==========================================
async function loadAllData() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=getAllData`);
    const result = await res.json();

    if (result.status === 'success') {
      allWidyaiswara = result.data.widyaiswara || [];
      allBahanAjar = result.data.bahanAjar || [];

      updateDashboardStats();
      renderCharts();
      renderDirektori(allWidyaiswara);
      renderBahanAjar(allBahanAjar);
    }
  } catch (err) {
    console.error("Gagal memuat data:", err);
  }
}

function updateDashboardStats() {
  const statTotalWi = document.getElementById('stat-total-wi');
  if (statTotalWi) statTotalWi.innerText = allWidyaiswara.length;
  
  const utamaCount = allWidyaiswara.filter(w => w.Jenjang === 'Ahli Utama' || w.Jenjang_Jabatan === 'Ahli Utama').length;
  const statUtamaWi = document.getElementById('stat-utama-wi');
  if (statUtamaWi) statUtamaWi.innerText = utamaCount;

  const pusatCount = allWidyaiswara.filter(w => w.Penempatan === 'Pusat' || w.Penempatan_Pusat === 'Pusat').length;
  const statPusatWi = document.getElementById('stat-pusat-wi');
  if (statPusatWi) statPusatWi.innerText = pusatCount;

  const statTotalBahan = document.getElementById('stat-total-bahan');
  if (statTotalBahan) statTotalBahan.innerText = allBahanAjar.length;
}

// ==========================================
// 3. GRAFIK (CHART.JS)
// ==========================================
let chartJabatanInstance = null;
let chartPendidikanInstance = null;

function renderCharts() {
  const jabatanCounts = {
    'Ahli Pertama': 0,
    'Ahli Muda': 0,
    'Ahli Madya': 0,
    'Ahli Utama': 0
  };

  allWidyaiswara.forEach(w => {
    const jenjang = w.Jenjang || w.Jenjang_Jabatan;
    if (jabatanCounts[jenjang] !== undefined) {
      jabatanCounts[jenjang]++;
    }
  });

  const elemJabatan = document.getElementById('chartJabatan');
  if (elemJabatan) {
    const ctxJabatan = elemJabatan.getContext('2d');
    if (chartJabatanInstance) chartJabatanInstance.destroy();
    chartJabatanInstance = new Chart(ctxJabatan, {
      type: 'pie',
      data: {
        labels: Object.keys(jabatanCounts),
        datasets: [{
          data: Object.values(jabatanCounts),
          backgroundColor: ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']
        }]
      }
    });
  }

  let countS1 = 0, countS2 = 0, countS3 = 0;
  allWidyaiswara.forEach(w => {
    if (w.Pendidikan_S3) countS3++;
    else if (w.Pendidikan_S2) countS2++;
    else if (w.Pendidikan_S1) countS1++;
  });

  const elemPendidikan = document.getElementById('chartPendidikan');
  if (elemPendidikan) {
    const ctxPendidikan = elemPendidikan.getContext('2d');
    if (chartPendidikanInstance) chartPendidikanInstance.destroy();
    chartPendidikanInstance = new Chart(ctxPendidikan, {
      type: 'bar',
      data: {
        labels: ['S1', 'S2', 'S3'],
        datasets: [{
          label: 'Jumlah Widyaiswara',
          data: [countS1, countS2, countS3],
          backgroundColor: '#f59e0b'
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } }
      }
    });
  }
}

// ==========================================
// 4. DIREKTORI & DETAIL PROFIL
// ==========================================
function renderDirektori(dataList) {
  const container = document.getElementById('gridWidyaiswara');
  if (!container) return;

  if (!dataList || dataList.length === 0) {
    container.innerHTML = `<p class="col-span-3 text-center text-slate-500 py-8">Belum ada data Widyaiswara.</p>`;
    return;
  }

  const cardsHtml = dataList.map(item => {
    const photoUrl = item.Link_Foto_Profil || 'https://via.placeholder.com/150';
    const nama = item.Nama || item.Nama_Lengkap || '-';
    const jenjang = item.Jenjang || item.Jenjang_Jabatan || '-';
    const kompetensi = item.Kompetensi || item.Rumpun_Spesialisasi || '-';

    return `
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition">
        <div class="flex items-center gap-4">
          <img src="${photoUrl}" alt="Foto ${nama}" class="w-16 h-16 rounded-full object-cover border-2 border-blue-900">
          <div>
            <h3 class="font-bold text-slate-800 text-sm line-clamp-1">${nama}</h3>
            <p class="text-xs text-slate-500 font-mono">NIP. ${item.NIP || '-'}</p>
            <span class="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">${jenjang}</span>
          </div>
        </div>
        <div class="mt-4 pt-3 border-t text-xs text-slate-600 space-y-1">
          <p><i class="fa-solid fa-briefcase mr-1.5 text-slate-400"></i> ${item.Unit_Kerja || '-'}</p>
          <p><i class="fa-solid fa-star mr-1.5 text-slate-400"></i> ${kompetensi}</p>
        </div>
        <button onclick="showDetail('${item.NIP}')" class="w-full mt-4 bg-slate-100 text-blue-900 font-semibold py-1.5 rounded text-xs hover:bg-blue-900 hover:text-white transition">
          Lihat Profil Lengkap
        </button>
      </div>
    `;
  }).join('');

  container.innerHTML = cardsHtml;
}

function filterWI() {
  const query = document.getElementById('searchWI').value.toLowerCase();
  const filtered = allWidyaiswara.filter(item => {
    const nama = (item.Nama || item.Nama_Lengkap || '').toLowerCase();
    const nip = String(item.NIP || '');
    const kompetensi = (item.Kompetensi || item.Rumpun_Spesialisasi || '').toLowerCase();
    return nama.includes(query) || nip.includes(query) || kompetensi.includes(query);
  });
  renderDirektori(filtered);
}

function showDetail(nip) {
  const wi = allWidyaiswara.find(w => String(w.NIP) === String(nip));
  if (!wi) return;

  document.getElementById('detail-nama').innerText = wi.Nama || wi.Nama_Lengkap || '-';
  document.getElementById('detail-nip').innerText = `NIP: ${wi.NIP || '-'}`;
  document.getElementById('detail-jenjang').innerText = wi.Jenjang || wi.Jenjang_Jabatan || '-';
  document.getElementById('detail-pangkat').innerText = wi.Pangkat_Golongan || '-';
  document.getElementById('detail-penempatan').innerText = wi.Penempatan || wi.Penempatan_Pusat || '-';
  document.getElementById('detail-unit').innerText = wi.Unit_Kerja || '-';
  document.getElementById('detail-email').innerText = wi.Email || '-';
  document.getElementById('detail-wa').innerText = wi.No_WA || wi.No_Whatsapp || '-';
  document.getElementById('detail-status').innerText = wi.Status_Keaktifan || 'Aktif';
  document.getElementById('detail-kompetensi').innerText = wi.Kompetensi || wi.Fokus_Kompetensi || '-';

  if (wi.Link_Foto_Profil) {
    document.getElementById('detail-foto').src = wi.Link_Foto_Profil;
  }

  switchTab('detail');
}

function renderBahanAjar(dataList) {
  const tbody = document.getElementById('tableBahanAjarBody');
  if (!tbody) return;

  if (!dataList || dataList.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-slate-500">Belum ada bahan ajar.</td></tr>`;
    return;
  }

  const rowsHtml = dataList.map(item => `
    <tr class="hover:bg-slate-50 border-b">
      <td class="p-3 font-semibold text-slate-800">${item.Judul || item.Judul_Bahan || '-'}</td>
      <td class="p-3">${item.Mata_Pelatihan || '-'}</td>
      <td class="p-3"><span class="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs font-semibold">${item.Jenis_Bahan || '-'}</span></td>
      <td class="p-3 text-xs font-mono">${item.NIP || '-'}</td>
      <td class="p-3">
        <a href="${item.Link_File || '#'}" target="_blank" class="bg-blue-800 text-white px-2.5 py-1 rounded text-xs hover:bg-blue-900 inline-flex items-center gap-1">
          <i class="fa-solid fa-download"></i> Unduh
        </a>
      </td>
    </tr>
  `).join('');

  tbody.innerHTML = rowsHtml;
}

// ==========================================
// 5. PENANGANAN FORM SUBMIT (POST REQUEST)
// ==========================================
async function saveFormData(actionType, event) {
  event.preventDefault();
  const formEl = event.target;
  const submitBtn = formEl.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn ? submitBtn.innerText : '';

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerText = 'Menyimpan...';
  }

  // Ekstrak data otomatis dari atribut 'name' setiap field
  const formData = new FormData(formEl);
  const payload = {};
  formData.forEach((value, key) => {
    payload[key] = value;
  });

  const requestBody = {
    action: actionType,
    payload: payload
  };

  try {
    const res = await fetch(SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(requestBody)
    });
    const resData = await res.json();

    if (resData.status === 'success') {
      alert('Data berhasil disimpan ke Google Sheet!');
      formEl.reset();
      loadAllData();
    } else {
      alert('Gagal menyimpan data: ' + (resData.message || 'Terjadi kesalahan di server.'));
    }
  } catch (err) {
    alert('Terjadi kesalahan koneksi saat mengirim data.');
    console.error(err);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerText = originalBtnText;
    }
  }
}

// Global Export agar fungsi saveFormData dipanggil sempurna dari HTML
window.saveFormData = saveFormData;

// ==========================================
// 6. INITIALIZATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadAllData();
});
