const API_BASE = 'http://localhost:8080';

const dropZone      = document.getElementById('dropZone');
const fileInput     = document.getElementById('fileInput');
const filePreview   = document.getElementById('filePreview');
const previewImg    = document.getElementById('previewImg');
const fileName      = document.getElementById('fileName');
const clearFileBtn  = document.getElementById('clearFile');
const sourceFormat  = document.getElementById('sourceFormat');
const targetFormat  = document.getElementById('targetFormat');
const errorMsg      = document.getElementById('errorMsg');
const convertBtn    = document.getElementById('convertBtn');
const resultSection = document.getElementById('resultSection');
const statusBadge   = document.getElementById('statusBadge');
const progressWrap  = document.getElementById('progressWrap');
const progressBar   = document.getElementById('progressBar');
const downloadBtn   = document.getElementById('downloadBtn');

let selectedFile   = null;
let conversionId   = null;
let targetFmt      = null;
let pollInterval   = null;

function loadFile(file) {
  if (!file) return;

  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (!allowed.includes(file.type)) {
    showError('Only PNG, JPEG and WEBP images are supported.');
    return;
  }

  selectedFile = file;
  fileName.textContent = file.name;

  const reader = new FileReader();
  reader.onload = e => { previewImg.src = e.target.result; };
  reader.readAsDataURL(file);

  filePreview.classList.remove('hidden');
  dropZone.classList.add('has-file');
  clearError();

  const mime2fmt = { 'image/png': 'PNG', 'image/jpeg': 'JPEG', 'image/webp': 'WEBP' };
  const detected = mime2fmt[file.type];
  if (detected) sourceFormat.value = detected;
}

function clearFile() {
  selectedFile = null;
  fileInput.value = '';
  previewImg.src = '';
  fileName.textContent = '';
  filePreview.classList.add('hidden');
  dropZone.classList.remove('has-file');
}

dropZone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', () => {
  if (fileInput.files.length) loadFile(fileInput.files[0]);
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('drag-over');
});
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file) loadFile(file);
});

clearFileBtn.addEventListener('click', e => {
  e.stopPropagation();
  clearFile();
});


convertBtn.addEventListener('click', async () => {
  clearError();

  if (!selectedFile)          return showError('Please select an image file.');
  if (!sourceFormat.value)    return showError('Please select the source format.');
  if (!targetFormat.value)    return showError('Please select the target format.');
  if (sourceFormat.value === targetFormat.value)
    return showError('Source and target formats must be different.');

  setConverting(true);
  resetResult();

  const formData = new FormData();
  formData.append('imageFile',    selectedFile);
  formData.append('sourceFormat', sourceFormat.value);
  formData.append('targetFormat', targetFormat.value);

  try {
    const res = await fetch(`${API_BASE}/`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `HTTP ${res.status}`);
    }

    const data = await res.json();
    conversionId = data.id;
    targetFmt    = targetFormat.value;

    showResult();
    updateStatus('PROCESSING');
    startPolling();
  } catch (err) {
    showError('Conversion failed: ' + err.message);
    setConverting(false);
  }
});

function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(pollStatus, 2000);
}

async function pollStatus() {
  try {
    const res = await fetch(`${API_BASE}/${conversionId}/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data  = await res.json();
    const status = data.status;

    updateStatus(status);

    if (status === 'COMPLETED') {
      clearInterval(pollInterval);
      pollInterval = null;
      setConverting(false);
      progressBar.classList.add('done');
      downloadBtn.classList.remove('hidden');
    } else if (status === 'FAILED') {
      clearInterval(pollInterval);
      pollInterval = null;
      setConverting(false);
      progressWrap.classList.add('hidden');
      showError('The conversion failed on the server.');
    }
  } catch (err) {
    clearInterval(pollInterval);
    pollInterval = null;
    setConverting(false);
    showError('Could not retrieve status: ' + err.message);
  }
}

downloadBtn.addEventListener('click', () => {
  const params = new URLSearchParams({
    id:           conversionId,
    format:       targetFmt,
    originalName: selectedFile ? selectedFile.name : 'image',
  });
  window.location.href = `${API_BASE}/?${params.toString()}`;
});


function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}
function clearError() {
  errorMsg.textContent = '';
  errorMsg.classList.add('hidden');
}

function setConverting(active) {
  convertBtn.disabled = active;
  convertBtn.textContent = active ? 'Converting…' : 'Convert Image';
}

function showResult() {
  resultSection.classList.remove('hidden');
  progressWrap.classList.remove('hidden');
  downloadBtn.classList.add('hidden');
  progressBar.classList.remove('done');
}

function resetResult() {
  resultSection.classList.add('hidden');
  progressWrap.classList.add('hidden');
  downloadBtn.classList.add('hidden');
  statusBadge.textContent = '—';
  statusBadge.className   = 'status-badge';
}

function updateStatus(status) {
  statusBadge.textContent = status;
  statusBadge.className   = 'status-badge ' + status.toLowerCase();
}
