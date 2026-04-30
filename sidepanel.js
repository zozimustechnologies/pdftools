// Browser API compatibility shim
/* global browser */
const browser = globalThis.browser || globalThis.chrome;

// Configure pdf.js worker (only if library is loaded)
if (typeof pdfjsLib !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = 'lib/pdf.worker.min.js';
}

// DOM Elements
const menuBtns = document.querySelectorAll('.menu-btn');
const menuContents = document.querySelectorAll('.menu-content');
const statusMessage = document.getElementById('status');
const downloadBar   = document.getElementById('downloadBar');
const downloadBtn   = document.getElementById('downloadBtn');

// ── Signature Canvas ──────────────────────────────────────────────────
(function initSignatureCanvas() {
  const canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const hint = document.getElementById('sigCanvasHint');

  let captured = false;

  function enterCapture(startPos) {
    if (captured) return;
    captured = true;
    canvas.classList.add('sig-capturing');
    hint?.classList.add('hidden');
    // begin a new path from the click position so the first move connects
    ctx.beginPath();
    ctx.moveTo(startPos.x, startPos.y);
  }

  function exitCapture() {
    captured = false;
    canvas.classList.remove('sig-capturing');
  }

  function resize() {
    const img = canvas.toDataURL();
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = document.getElementById('sigInkColor')?.value || '#1a4a6e';
    ctx.lineWidth   = 2.5;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    const image = new Image();
    image.onload = () => ctx.drawImage(image, 0, 0);
    image.src = img;
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  // Single click enters capture; every subsequent mouse move draws
  canvas.addEventListener('click', e => {
    ctx.strokeStyle = document.getElementById('sigInkColor')?.value || '#1a4a6e';
    enterCapture(getPos(e));
  });

  canvas.addEventListener('mousemove', e => {
    if (!captured) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  });

  // Touch: tap to enter capture, drag to draw
  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    enterCapture(getPos(e));
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!captured) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  }, { passive: false });

  // Escape releases capture mode
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && captured) exitCapture();
  });

  document.getElementById('sigInkColor')?.addEventListener('input', e => {
    ctx.strokeStyle = e.target.value;
  });

  document.getElementById('clearSignature')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Initial size + re-size when panel becomes visible
  new ResizeObserver(resize).observe(canvas);
  resize();
})();

// ── Signature Preview ─────────────────────────────────────────────────
(function initSignaturePreview() {
  const nameEl    = document.getElementById('sigPreviewName');
  const reasonEl  = document.getElementById('sigPreviewReason');
  const tsEl      = document.getElementById('sigPreviewTs');
  const drawingEl = document.getElementById('sigPreviewDrawing');
  const canvas    = document.getElementById('signatureCanvas');
  const tsCheck   = document.getElementById('timestampSign');

  function updatePreview() {
    const name   = document.getElementById('signatureName')?.value.trim() || 'Your Name';
    const reason = document.getElementById('signatureReason')?.value.trim();
    if (nameEl)   nameEl.textContent   = `Signed: ${name}`;
    if (reasonEl) reasonEl.textContent = `Reason: ${reason || '—'}`;
    if (tsEl)     tsEl.textContent     = tsCheck?.checked ? new Date().toLocaleString() : '';
  }

  function updateDrawingPreview() {
    if (!drawingEl || !canvas) return;
    const blank = document.createElement('canvas');
    blank.width = canvas.width; blank.height = canvas.height;
    const isEmpty = canvas.toDataURL() === blank.toDataURL();
    if (isEmpty) {
      drawingEl.innerHTML = '<span class="sig-preview__drawing-empty">Draw signature above</span>';
    } else {
      const img = document.createElement('img');
      img.src = canvas.toDataURL('image/png');
      drawingEl.innerHTML = '';
      drawingEl.appendChild(img);
    }
  }

  document.getElementById('signatureName')   ?.addEventListener('input',  updatePreview);
  document.getElementById('signatureReason') ?.addEventListener('input',  updatePreview);
  document.getElementById('timestampSign')   ?.addEventListener('change', updatePreview);

  // Update drawing preview whenever the canvas is drawn on or cleared
  canvas?.addEventListener('mousemove', updateDrawingPreview);
  canvas?.addEventListener('touchmove', updateDrawingPreview);
  canvas?.addEventListener('mouseup',   updateDrawingPreview);
  canvas?.addEventListener('touchend',  updateDrawingPreview);
  document.getElementById('clearSignature')?.addEventListener('click', () => {
    setTimeout(updateDrawingPreview, 0);
  });

  // ── Live customisation ───────────────────────────────────────────
  const preview = document.getElementById('sigPreview');

  function setVar(name, value) {
    preview?.style.setProperty(name, value);
  }

  document.getElementById('sigBorderColor')?.addEventListener('input', e => {
    setVar('--sig-border', e.target.value);
  });
  document.getElementById('sigDrawBg')?.addEventListener('input', e => {
    setVar('--sig-draw-bg', e.target.value);
  });
  document.getElementById('sigBoxBg')?.addEventListener('input', e => {
    setVar('--sig-box-bg', e.target.value);
  });
  document.getElementById('sigNameColor')?.addEventListener('input', e => {
    setVar('--sig-name-color', e.target.value);
  });
  const radiusInput = document.getElementById('sigRadius');
  const radiusVal   = document.getElementById('sigRadiusVal');
  radiusInput?.addEventListener('input', e => {
    const v = e.target.value + 'px';
    setVar('--sig-radius', v);
    if (radiusVal) radiusVal.textContent = e.target.value;
  });

  updatePreview();
})();

const downloadLabel = document.getElementById('downloadLabel');

// Loaded PDF state (set by any file loader in any tab)
let loadedPdfBytes        = null;
let loadedPdfName         = 'document.pdf';
let cachedPassword        = null; // set when an encrypted PDF is loaded; re-applied on download
let loadedPdfPermissions  = null; // parsed /P bit flags from encrypted PDF; null = not encrypted

// ── Password modal ────────────────────────────────────────────────
function promptPassword(errorMsg) {
  return new Promise((resolve, reject) => {
    const modal    = document.getElementById('passwordModal');
    const input    = document.getElementById('passwordModalInput');
    const errEl    = document.getElementById('passwordModalErr');
    const okBtn    = document.getElementById('passwordModalOk');
    const cancelBtn = document.getElementById('passwordModalCancel');

    input.value = '';
    errEl.textContent = errorMsg || '';
    modal.style.display = 'flex';
    setTimeout(() => input.focus(), 60);

    function close() {
      modal.style.display = 'none';
      okBtn.onclick = null; cancelBtn.onclick = null; input.onkeydown = null;
    }
    function submit() {
      const pw = input.value;
      if (!pw) { errEl.textContent = 'Password required'; return; }
      close(); resolve(pw);
    }
    okBtn.onclick     = submit;
    cancelBtn.onclick = () => { close(); reject(); };
    input.onkeydown   = (e) => { if (e.key === 'Enter') submit(); if (e.key === 'Escape') { close(); reject(); } };
  });
}

// ── Process raw bytes: detect encryption, prompt, decrypt, cache pw ─────────
async function processLoadedBytes(bytes, name) {
  // Try loading to detect encryption (no ignoreEncryption so it throws for locked files)
  let encrypted = false;
  try {
    await PDFLib.PDFDocument.load(bytes);
  } catch (e) {
    if (/password|encrypt|needs/i.test(e.message)) {
      encrypted = true;
    } else {
      showStatus('Could not read PDF: ' + e.message, 'error');
      return false;
    }
  }

  let finalBytes = bytes;
  if (encrypted) {
    let pw, errorMsg = '';
    // Retry loop — re-prompts on wrong password
    while (true) {
      try { pw = await promptPassword(errorMsg); }
      catch { showStatus('Load cancelled', 'info'); return false; }
      try {
        const pdfDoc = await PDFLib.PDFDocument.load(bytes, { password: pw });
        finalBytes = await pdfDoc.save(); // save as decrypted working copy
        // Parse /P permission flags from original encrypted bytes
        // (/P in Encrypt dict is always a negative signed 32-bit int for 128-bit+ PDFs)
        const rawForP = new TextDecoder('latin1').decode(bytes);
        const pMatch  = rawForP.match(/\/P\s+(-\d+)/);
        if (pMatch) {
          const P = parseInt(pMatch[1]) >>> 0; // to unsigned 32-bit
          loadedPdfPermissions = {
            print:         !!(P & 0x4),
            hiResPrint:    !!(P & 0x800),
            modify:        !!(P & 0x8),
            copy:          !!(P & 0x10),
            annotate:      !!(P & 0x20),
            fillForms:     !!(P & 0x100),
            accessibility: !!(P & 0x200),
            assembly:      !!(P & 0x400),
            ownerAccess:   false,
          };
          // Detect if pw is the owner password:
          // If loading with an empty password succeeds, the user password is empty,
          // meaning any non-empty pw that opened the file must be the owner password.
          try {
            await PDFLib.PDFDocument.load(bytes, { password: '' });
            if (pw) loadedPdfPermissions.ownerAccess = true;
          } catch { /* user password is non-empty; can't distinguish without crypto */ }
        } else {
          loadedPdfPermissions = null;
        }
        break;
      } catch (e) {
        if (/password|encrypt|needs/i.test(e.message)) {
          errorMsg = 'Wrong password — try again';
        } else {
          showStatus('Decryption failed: ' + e.message, 'error');
          return false;
        }
      }
    }
    cachedPassword = pw;
  } else {
    cachedPassword       = null;
    loadedPdfPermissions = null;
  }

  loadedPdfBytes = finalBytes;
  loadedPdfName  = name;

  const icon  = document.getElementById('fileLoaderIcon');
  const text   = document.getElementById('fileLoaderText');
  const label  = document.querySelector('.pdf-loader-bar__file');
  const encWarn = document.getElementById('encWarning');
  if (icon)  icon.textContent  = encrypted ? '🔐' : '📄';
  if (text)  text.textContent  = name;
  if (label) label.classList.toggle('is-encrypted', encrypted);
  if (encWarn) encWarn.style.display = encrypted ? 'flex' : 'none';

  showStatus(
    encrypted ? `Loaded: ${name} · 🔐 Will re-encrypt on download` : `Loaded: ${name}`,
    'success'
  );
  refreshInfoTab();
  return true;
}

// ── Load settings from storage ────────────────────────────────────────
(function applyStoredSettings() {
  const DEFAULTS = {
    autoDownload:            true,
    enableNotifications:     true,
    defaultWatermarkText:    '',
    defaultWatermarkColor:   '#3d7ea6',
    defaultWatermarkOpacity: 30,
    defaultSignatureName:    '',
    defaultSignatureReason:  '',
  };
  try {
    browser.storage.sync.get('pdfToolsSettings', result => {
      const s = Object.assign({}, DEFAULTS, result?.pdfToolsSettings || {});
      const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val; };
      const setChk = (id, val) => { const el = document.getElementById(id); if (el) el.checked = val; };
      setChk('autoDownload',         s.autoDownload);
      setChk('enableNotifications',  s.enableNotifications);
      set('watermarkText',           s.defaultWatermarkText);
      set('watermarkColor',          s.defaultWatermarkColor);
      set('watermarkOpacity',        s.defaultWatermarkOpacity);
      set('signatureName',           s.defaultSignatureName);
      set('signatureReason',         s.defaultSignatureReason);
    });
  } catch (e) { /* storage unavailable in some contexts */ }
})();

// ── Info Tab ──────────────────────────────────────────────────────────
async function refreshInfoTab() {
  const noFile  = document.getElementById('infoNoFile');
  const table   = document.getElementById('infoTable');
  if (!loadedPdfBytes) {
    if (noFile) noFile.style.display = '';
    if (table)  table.style.display  = 'none';
    return;
  }
  if (noFile) noFile.style.display = 'none';
  if (table)  table.style.display  = '';

  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
  const badge = (id, yes) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = yes
      ? '<span class="info-badge info-badge--yes">Yes</span>'
      : '<span class="info-badge info-badge--no">No</span>';
  };
  const fmt = (d) => d ? d.toLocaleString() : '—';
  const fmtSize = (n) => n >= 1048576
    ? (n / 1048576).toFixed(2) + ' MB'
    : (n / 1024).toFixed(1) + ' KB';

  // PDF version from raw header bytes
  const header = new TextDecoder().decode(loadedPdfBytes.slice(0, 10));
  const verMatch = header.match(/%PDF-(\d+\.\d+)/);
  set('iVersion', verMatch ? verMatch[1] : '—');
  set('iName',    loadedPdfName);
  set('iSize',    fmtSize(loadedPdfBytes.byteLength));

  // Try loading without password to detect encryption and read metadata
  let encrypted = false;
  try {
    const pdfDoc = await PDFLib.PDFDocument.load(loadedPdfBytes, { ignoreEncryption: true });
    set('iPages',    pdfDoc.getPageCount());
    set('iTitle',    pdfDoc.getTitle()   || '—');
    set('iAuthor',   pdfDoc.getAuthor()  || '—');
    set('iSubject',  pdfDoc.getSubject() || '—');
    set('iCreator',  pdfDoc.getCreator() || '—');
  } catch (e) {
    if (/encrypt|password/i.test(e.message)) encrypted = true;
    set('iPages', '—'); set('iTitle', '—'); set('iAuthor', '—');
    set('iSubject', '—'); set('iCreator', '—');
  }

  // Check if encrypted via header byte for /Encrypt entry
  if (!encrypted) {
    const raw = new TextDecoder('latin1').decode(loadedPdfBytes.slice(0, 2048));
    encrypted = /\/Encrypt\b/.test(raw);
  }
  // cachedPassword is set whenever the original loaded file was encrypted
  if (!encrypted && cachedPassword) encrypted = true;

  badge('iEncrypted', encrypted);

  // Permissions section
  const permsSection = document.getElementById('infoPermsSection');
  if (permsSection) {
    if (!loadedPdfPermissions) {
      permsSection.style.display = 'none';
    } else {
      permsSection.style.display = '';
      const p = loadedPdfPermissions;
      const isOwner = p.ownerAccess === true;

      // Access level row
      const accessEl = document.getElementById('iAccessLevel');
      if (accessEl) {
        accessEl.innerHTML = isOwner
          ? '<span class="info-badge info-badge--ok">Owner — full access</span>'
          : '<span class="info-badge info-badge--neutral">User</span>';
      }

      const permBadge = (id, allowed) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = (isOwner || allowed)
          ? '<span class="info-badge info-badge--ok">Allowed</span>'
          : '<span class="info-badge info-badge--denied">Denied</span>';
      };
      const printEl = document.getElementById('iPrint');
      if (printEl) {
        if      (isOwner || p.hiResPrint) printEl.innerHTML = '<span class="info-badge info-badge--ok">High res</span>';
        else if (p.print)                printEl.innerHTML = '<span class="info-badge info-badge--ok">Low res</span>';
        else                             printEl.innerHTML = '<span class="info-badge info-badge--denied">Denied</span>';
      }
      permBadge('iModify',        p.modify);
      permBadge('iCopy',          p.copy);
      permBadge('iAccessibility', p.accessibility);
      permBadge('iAnnotate',      p.annotate);
      permBadge('iFillForms',     p.fillForms);
      permBadge('iAssembly',      p.assembly);
    }
  }
}

// Show download bar with result bytes
function storeResult(bytes, filename) {
  if (!bytes) return;
  if (downloadLabel) downloadLabel.textContent = filename;
  if (downloadBar)   downloadBar.style.display = 'flex';
  downloadBar._bytes = bytes;
  downloadBar._name  = filename;
}

downloadBtn?.addEventListener('click', () => {
  if (downloadBar._bytes) downloadBytes(downloadBar._bytes, downloadBar._name);
});

// ── Helpers ───────────────────────────────────────────────────────────
function showStatus(message, type = 'info') {
  if (!statusMessage) return;
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type}`;
  setTimeout(() => statusMessage?.classList.remove('show'), 3000);
}

function downloadBytes(bytes, filename) {
  if (cachedPassword) {
    // Re-encrypt asynchronously before downloading
    (async () => {
      try {
        const pdfDoc = await PDFLib.PDFDocument.load(bytes);
        pdfDoc.encrypt({
          userPassword:  cachedPassword,
          ownerPassword: cachedPassword,
          permissions: {
            printing: 'highResolution', modifying: false, copying: false,
            annotating: true, fillingForms: true, contentAccessibility: true, documentAssembly: false,
          },
        });
        const encrypted = await pdfDoc.save();
        _triggerDownload(encrypted, filename);
      } catch (e) {
        console.warn('Re-encryption failed, downloading unencrypted:', e);
        _triggerDownload(bytes, filename);
      }
    })();
    return;
  }
  _triggerDownload(bytes, filename);
}

function _triggerDownload(bytes, filename) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

function parsePageRange(str, total) {
  const pages = new Set();
  str.split(',').forEach(part => {
    part = part.trim();
    if (part.includes('-')) {
      const [s, e] = part.split('-').map(n => parseInt(n.trim(), 10) - 1);
      for (let i = s; i <= Math.min(e, total - 1); i++) if (i >= 0) pages.add(i);
    } else {
      const n = parseInt(part, 10) - 1;
      if (n >= 0 && n < total) pages.add(n);
    }
  });
  return [...pages].sort((a, b) => a - b);
}

// ── File loader (single shared input in persistent bar) ───────────────
const pdfFileInput = document.getElementById('pdfFileInput');

async function loadPdfFile(file) {
  if (!file || (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf'))) {
    showStatus('Please drop a PDF file', 'error');
    return;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  await processLoadedBytes(bytes, file.name);
}

pdfFileInput?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  await loadPdfFile(file);
});

// ── Drag & drop onto the loader bar ──────────────────────────────────
const loaderBar = document.querySelector('.pdf-loader-bar');

loaderBar?.addEventListener('dragover', (e) => {
  e.preventDefault();
  loaderBar.classList.add('drag-over');
});

loaderBar?.addEventListener('dragleave', (e) => {
  if (!loaderBar.contains(e.relatedTarget)) {
    loaderBar.classList.remove('drag-over');
  }
});

loaderBar?.addEventListener('drop', async (e) => {
  e.preventDefault();
  loaderBar.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  await loadPdfFile(file);
});

// ── Use Current Tab PDF ───────────────────────────────────────────────
async function loadCurrentTabPDF() {
  let tab;
  try {
    const [activeTab] = await browser.tabs.query({ active: true, currentWindow: true });
    tab = activeTab;
  } catch (e) {
    showStatus('Cannot access current tab', 'error');
    return;
  }

  const url = tab?.url || '';
  const isPdf = /\.pdf(\?.*)?$/i.test(url) || tab?.title?.toLowerCase().endsWith('.pdf');

  if (!isPdf) {
    showStatus('Current tab does not appear to be a PDF', 'error');
    return;
  }

  showStatus('Fetching PDF from tab…', 'info');
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = await response.arrayBuffer();
    const bytes   = new Uint8Array(buffer);
    const filename = decodeURIComponent(url.split('/').pop().split('?')[0] || 'tab.pdf');
    await processLoadedBytes(bytes, filename);
  } catch (e) {
    showStatus('Failed to fetch PDF: ' + e.message, 'error');
  }
}

document.getElementById('useTabBtn')?.addEventListener('click', loadCurrentTabPDF);

// ── Menu Bar Navigation ───────────────────────────────────────────────
menuBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    menuBtns.forEach(b => b.classList.remove('active'));
    menuContents.forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    const menuName = btn.dataset.menu;
    const menuContent = document.getElementById(menuName);
    if (menuContent) {
      menuContent.classList.add('active');
    }
    if (menuName === 'info') refreshInfoTab();
  });
});

// List Item Navigation
document.querySelectorAll('.list-item').forEach(item => {
  item.addEventListener('click', () => {
    const action = item.dataset.action;
    showForm(action);
  });
});

// Back Button Navigation
document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const menuContent = btn.closest('.menu-content');
    if (menuContent) {
      const menuList = menuContent.querySelector('.menu-list');
      const forms = menuContent.querySelectorAll('.form-container');
      if (menuList) menuList.style.display = '';
      forms.forEach(f => f.style.display = 'none');
    }
  });
});

function showForm(formName) {
  const menuContent = document.getElementById('protect');
  const menuList = menuContent.querySelector('.menu-list');
  const forms = menuContent.querySelectorAll('.form-container');
  menuList.style.display = 'none';
  forms.forEach(f => f.style.display = 'none');
  const formId = formName + 'Form';
  const form = document.getElementById(formId);
  if (form) form.style.display = 'block';
}

// ── Tool panel navigation ─────────────────────────────────────────────
function showToolPanel(tool) {
  const grid = document.querySelector('#tools .tools-grid');
  if (grid) grid.style.display = 'none';
  document.querySelectorAll('.tool-panel').forEach(p => (p.style.display = 'none'));
  const panel = document.getElementById(`panel-${tool}`);
  if (panel) panel.style.display = 'block';
}

function hideToolPanels() {
  const grid = document.querySelector('#tools .tools-grid');
  if (grid) grid.style.display = 'grid';
  document.querySelectorAll('.tool-panel').forEach(p => (p.style.display = 'none'));
}

document.querySelectorAll('.tool-panel__back').forEach(btn => {
  btn.addEventListener('click', hideToolPanels);
});

// Tool Buttons — show config panel (no sendMessage)
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', async () => {
    if (!loadedPdfBytes) { showStatus('Load a PDF file first', 'error'); return; }
    if (btn.dataset.tool === 'metadata') {
      // Pre-populate fields from the loaded PDF before showing panel
      try {
        const pdfDoc = await PDFLib.PDFDocument.load(loadedPdfBytes, { ignoreEncryption: true });
        const val = (fn) => { try { return fn() || ''; } catch { return ''; } };
        document.getElementById('metaTitle').value    = val(() => pdfDoc.getTitle());
        document.getElementById('metaAuthor').value   = val(() => pdfDoc.getAuthor());
        document.getElementById('metaSubject').value  = val(() => pdfDoc.getSubject());
        document.getElementById('metaKeywords').value = val(() => pdfDoc.getKeywords());
        document.getElementById('metaCreator').value  = val(() => pdfDoc.getCreator());
        document.getElementById('metaProducer').value = val(() => pdfDoc.getProducer());
      } catch { /* leave blank if unreadable */ }
      showToolPanel('metadata');
      return;
    }
    showToolPanel(btn.dataset.tool);
  });
});

// ── Tool implementations (direct PDFLib) ──────────────────────────────
document.getElementById('runExtract')?.addEventListener('click', async () => {
  if (!loadedPdfBytes) return;
  const rangeStr = document.getElementById('extractRange')?.value.trim();
  if (!rangeStr) { showStatus('Enter a page range', 'error'); return; }
  showStatus('Extracting…', 'info');
  try {
    const src     = await PDFLib.PDFDocument.load(loadedPdfBytes);
    const dest    = await PDFLib.PDFDocument.create();
    const indices = parsePageRange(rangeStr, src.getPageCount());
    if (!indices.length) { showStatus('No valid pages in range', 'error'); return; }
    const pages = await dest.copyPages(src, indices);
    pages.forEach(p => dest.addPage(p));
    const saved = await dest.save();
    const name  = `extracted_${loadedPdfName}`;
    storeResult(saved, name); downloadBytes(saved, name);
    showStatus('Pages extracted', 'success'); hideToolPanels();
  } catch (e) { showStatus('Extract failed: ' + e.message, 'error'); }
});

document.getElementById('runMerge')?.addEventListener('click', async () => {
  if (!loadedPdfBytes) return;
  const fileInput = document.getElementById('mergeFiles');
  if (!fileInput?.files?.length) { showStatus('Select additional PDFs', 'error'); return; }
  showStatus('Merging…', 'info');
  try {
    const merged = await PDFLib.PDFDocument.create();
    const base   = await PDFLib.PDFDocument.load(loadedPdfBytes);
    const bp     = await merged.copyPages(base, base.getPageIndices());
    bp.forEach(p => merged.addPage(p));
    for (const file of fileInput.files) {
      const buf = await file.arrayBuffer();
      const pdf = await PDFLib.PDFDocument.load(new Uint8Array(buf));
      const pp  = await merged.copyPages(pdf, pdf.getPageIndices());
      pp.forEach(p => merged.addPage(p));
    }
    const saved = await merged.save();
    const name  = `merged_${loadedPdfName.replace(/\.pdf$/i, '')}.pdf`;
    storeResult(saved, name); downloadBytes(saved, name);
    showStatus('PDFs merged', 'success'); hideToolPanels();
  } catch (e) { showStatus('Merge failed: ' + e.message, 'error'); }
});

document.getElementById('runRotate')?.addEventListener('click', async () => {
  if (!loadedPdfBytes) return;
  const deg = parseInt(document.getElementById('rotateDeg')?.value || '90', 10);
  showStatus('Rotating…', 'info');
  try {
    const pdfDoc = await PDFLib.PDFDocument.load(loadedPdfBytes);
    pdfDoc.getPages().forEach(page => {
      const cur = page.getRotation().angle;
      page.setRotation(PDFLib.degrees((cur + deg) % 360));
    });
    const saved = await pdfDoc.save();
    const name  = `rotated_${loadedPdfName}`;
    storeResult(saved, name); downloadBytes(saved, name);
    showStatus('Pages rotated', 'success'); hideToolPanels();
  } catch (e) { showStatus('Rotate failed: ' + e.message, 'error'); }
});

document.getElementById('runSplit')?.addEventListener('click', async () => {
  if (!loadedPdfBytes) return;
  showStatus('Splitting…', 'info');
  try {
    const src   = await PDFLib.PDFDocument.load(loadedPdfBytes);
    const count = src.getPageCount();
    const base  = loadedPdfName.replace(/\.pdf$/i, '');
    for (let i = 0; i < count; i++) {
      const dest = await PDFLib.PDFDocument.create();
      const [p]  = await dest.copyPages(src, [i]);
      dest.addPage(p);
      downloadBytes(await dest.save(), `${base}_page${i + 1}.pdf`);
      if (i < count - 1) await new Promise(r => setTimeout(r, 350));
    }
    showStatus(`Split into ${count} pages`, 'success'); hideToolPanels();
  } catch (e) { showStatus('Split failed: ' + e.message, 'error'); }
});

// Action Buttons
document.getElementById('protectBtn')?.addEventListener('click', encryptPDF);
document.getElementById('decryptBtn')?.addEventListener('click', decryptPDF);
document.getElementById('signBtn')?.addEventListener('click', signPDF);
document.getElementById('watermarkBtn')?.addEventListener('click', addWatermark);

// ── Protect / Sign implementations (direct PDFLib) ────────────────────

async function encryptPDF() {
  if (!loadedPdfBytes) { showStatus('Load a PDF first', 'error'); return; }
  const userPw  = document.getElementById('userPassword')?.value;
  const ownerPw = document.getElementById('ownerPassword')?.value || userPw;
  if (!userPw) { showStatus('Enter a user password', 'error'); return; }
  const chk = id => document.getElementById(id)?.checked ?? false;
  showStatus('Encrypting…', 'info');
  try {
    const pdfDoc = await PDFLib.PDFDocument.load(loadedPdfBytes);
    pdfDoc.encrypt({
      userPassword:  userPw,
      ownerPassword: ownerPw,
      permissions: {
        printing:             chk('encPrint') ? 'highResolution' : false,
        modifying:            chk('encModify'),
        copying:              chk('encCopy'),
        contentAccessibility: chk('encAccessibility'),
        annotating:           chk('encAnnotate'),
        fillingForms:         chk('encForms'),
        documentAssembly:     chk('encAssembly'),
      },
    });
    const saved = await pdfDoc.save();
    const name = `encrypted_${loadedPdfName}`;
    downloadBytes(saved, name);
    showStatus('PDF encrypted & downloaded', 'success');
    document.getElementById('userPassword').value  = '';
    document.getElementById('ownerPassword').value = '';
  } catch (e) { showStatus('Encryption failed: ' + e.message, 'error'); }
}

async function decryptPDF() {
  if (!loadedPdfBytes) { showStatus('Load an encrypted PDF first', 'error'); return; }
  const pw = document.getElementById('decryptPassword')?.value;
  if (!pw) { showStatus('Enter the password', 'error'); return; }
  showStatus('Decrypting…', 'info');
  try {
    const pdfDoc = await PDFLib.PDFDocument.load(loadedPdfBytes, { password: pw });
    const saved  = await pdfDoc.save();
    const name   = `decrypted_${loadedPdfName}`;
    storeResult(saved, name);
    cachedPassword = null; // clear so downloadBytes doesn't re-encrypt
    _triggerDownload(saved, name);
    showStatus('PDF decrypted', 'success');
    document.getElementById('decryptPassword').value = '';
  } catch (e) { showStatus('Decryption failed — check password', 'error'); }
}

// ── Watermark Preview ─────────────────────────────────────────────────
(function initWatermarkPreview() {
  function hexToRgb(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return { r, g, b };
  }

  function drawPreview() {
    const canvas    = document.getElementById('watermarkPreview');
    if (!canvas) return;
    // Sync canvas resolution to its CSS size
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) { canvas.width = rect.width; canvas.height = rect.height || 150; }
    const ctx       = canvas.getContext('2d');
    const text      = document.getElementById('watermarkText')?.value.trim() || 'WATERMARK';
    const opacity   = parseInt(document.getElementById('watermarkOpacity')?.value || '30', 10) / 100;
    const colorHex  = document.getElementById('watermarkColor')?.value || '#3d7ea6';
    const placement = document.getElementById('watermarkPlacement')?.value || 'center';
    const sizeOpt   = document.getElementById('watermarkFontSize')?.value || 'auto';

    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Page background
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, W, H);
    // Faint lines to look like a page
    ctx.strokeStyle = '#e8eaed';
    ctx.lineWidth = 0.5;
    for (let y = 18; y < H; y += 14) { ctx.beginPath(); ctx.moveTo(12, y); ctx.lineTo(W - 12, y); ctx.stroke(); }

    const { r, g, b } = hexToRgb(colorHex);
    ctx.fillStyle = `rgba(${Math.round(r*255)},${Math.round(g*255)},${Math.round(b*255)},${opacity})`;

    const isDiagonal  = placement === 'center' || placement === 'tile';
    const autoSize    = sizeOpt === '0' || sizeOpt === 'auto'
      ? (isDiagonal ? Math.min(W, H) * 0.14 : Math.min(W, H) * 0.1)
      : parseInt(sizeOpt, 10) * (W / 300); // scale to canvas
    ctx.font = `bold ${autoSize}px sans-serif`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    if (placement === 'center') {
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate(-Math.PI / 4);
      ctx.fillText(text, 0, 0);
      ctx.restore();
    } else if (placement === 'tile') {
      const textW = ctx.measureText(text).width;
      const stepX = textW + 24, stepY = autoSize + 28;
      ctx.save();
      ctx.rotate(-Math.PI / 4);
      for (let tx = -W; tx < W * 2; tx += stepX) {
        for (let ty = -H; ty < H * 2; ty += stepY) {
          ctx.fillText(text, tx, ty);
        }
      }
      ctx.restore();
    } else {
      ctx.textAlign    = 'left';
      ctx.textBaseline = 'top';
      const pad   = 12;
      const textW = ctx.measureText(text).width;
      let x, y;
      if      (placement === 'top-left')      { x = pad;              y = pad; }
      else if (placement === 'top-center')    { x = (W - textW) / 2;  y = pad; }
      else if (placement === 'top-right')     { x = W - textW - pad;  y = pad; }
      else if (placement === 'bottom-left')   { x = pad;              y = H - autoSize - pad; }
      else if (placement === 'bottom-center') { x = (W - textW) / 2;  y = H - autoSize - pad; }
      else                                    { x = W - textW - pad;  y = H - autoSize - pad; }
      ctx.fillText(text, x, y);
    }

    // Page border
    ctx.strokeStyle = '#d0d0d0';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, W, H);
  }

  // Wire up live update
  ['watermarkText','watermarkOpacity','watermarkColor','watermarkPlacement','watermarkFontSize'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', drawPreview);
    document.getElementById(id)?.addEventListener('change', drawPreview);
  });

  // Opacity label
  document.getElementById('watermarkOpacity')?.addEventListener('input', e => {
    const el = document.getElementById('watermarkOpacityVal');
    if (el) el.textContent = e.target.value + '%';
  });

  // Font size label
  document.getElementById('watermarkFontSize')?.addEventListener('input', e => {
    const el = document.getElementById('watermarkFontSizeVal');
    if (el) el.textContent = e.target.value === '0' ? 'Auto' : e.target.value + 'pt';
  });

  // Draw when the watermark form becomes visible (list-item click)
  document.querySelectorAll('.list-item[data-action="watermark"]').forEach(el => {
    el.addEventListener('click', () => setTimeout(drawPreview, 50));
  });

  drawPreview();
})();

async function addWatermark() {
  if (!loadedPdfBytes) { showStatus('Load a PDF first', 'error'); return; }
  const text      = document.getElementById('watermarkText')?.value.trim();
  const opacity   = parseInt(document.getElementById('watermarkOpacity')?.value || '30', 10) / 100;
  const colorHex  = document.getElementById('watermarkColor')?.value || '#3d7ea6';
  const placement = document.getElementById('watermarkPlacement')?.value || 'center';
  const sizeOpt   = document.getElementById('watermarkFontSize')?.value || 'auto';
  if (!text) { showStatus('Enter watermark text', 'error'); return; }

  function hexToRgbLib(hex) {
    return PDFLib.rgb(
      parseInt(hex.slice(1,3),16)/255,
      parseInt(hex.slice(3,5),16)/255,
      parseInt(hex.slice(5,7),16)/255,
    );
  }

  showStatus('Adding watermark…', 'info');
  try {
    const { PDFDocument, degrees, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.load(loadedPdfBytes);
    const font   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const color  = hexToRgbLib(colorHex);
    const isDiagonal = placement === 'center' || placement === 'tile';

    pdfDoc.getPages().forEach(page => {
      const { width, height } = page.getSize();
      const fontSize = sizeOpt === '0' || sizeOpt === 'auto'
        ? (isDiagonal ? Math.min(width, height) * 0.12 : Math.min(width, height) * 0.08)
        : parseInt(sizeOpt, 10);
      const textWidth = font.widthOfTextAtSize(text, fontSize);
      const pad = 20;

      if (placement === 'center') {
        page.drawText(text, {
          x: (width - textWidth) / 2, y: height / 2,
          size: fontSize, font, color, opacity,
          rotate: degrees(45),
        });
      } else if (placement === 'tile') {
        const stepX = textWidth + 60, stepY = fontSize + 80;
        for (let x = -width; x < width * 2; x += stepX) {
          for (let y = -height; y < height * 2; y += stepY) {
            page.drawText(text, { x, y, size: fontSize, font, color, opacity, rotate: degrees(45) });
          }
        }
      } else {
        let x, y;
        if      (placement === 'top-left')      { x = pad;                      y = height - fontSize - pad; }
        else if (placement === 'top-center')    { x = (width - textWidth) / 2;  y = height - fontSize - pad; }
        else if (placement === 'top-right')     { x = width - textWidth - pad;  y = height - fontSize - pad; }
        else if (placement === 'bottom-left')   { x = pad;                      y = pad; }
        else if (placement === 'bottom-center') { x = (width - textWidth) / 2;  y = pad; }
        else                                    { x = width - textWidth - pad;  y = pad; }
        page.drawText(text, { x, y, size: fontSize, font, color, opacity });
      }
    });
    const saved = await pdfDoc.save();
    const name  = `watermarked_${loadedPdfName}`;
    storeResult(saved, name); downloadBytes(saved, name);
    showStatus('Watermark added', 'success');
  } catch (e) { showStatus('Watermark failed: ' + e.message, 'error'); }
}

async function signPDF() {
  if (!loadedPdfBytes) { showStatus('Load a PDF first', 'error'); return; }
  const sigName  = document.getElementById('signatureName')?.value.trim();
  const reason   = document.getElementById('signatureReason')?.value.trim() || 'Signed';
  const pageNo   = parseInt(document.getElementById('signaturePage')?.value || '1', 10) - 1;
  const addTs    = document.getElementById('timestampSign')?.checked;
  if (!sigName) { showStatus('Enter your name', 'error'); return; }

  function hexToRgb(hex) {
    const n = parseInt(hex.replace('#', ''), 16);
    return PDFLib.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
  }
  const borderColor = hexToRgb(document.getElementById('sigBorderColor')?.value || '#3d7ea6');
  const drawBg      = hexToRgb(document.getElementById('sigDrawBg')?.value       || '#f7fbfd');
  const boxBg       = hexToRgb(document.getElementById('sigBoxBg')?.value        || '#eef6fb');
  const nameColor   = hexToRgb(document.getElementById('sigNameColor')?.value    || '#1a4a6e');
  const radiusPx    = parseInt(document.getElementById('sigRadius')?.value       || '16', 10);

  showStatus('Signing…', 'info');
  try {
    const { PDFDocument, rgb, StandardFonts } = PDFLib;
    const pdfDoc = await PDFDocument.load(loadedPdfBytes);
    const pages  = pdfDoc.getPages();
    const page   = pages[Math.min(pageNo, pages.length - 1)];
    const font   = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldF  = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const { width } = page.getSize();
    const bw = 230, bh = 62, drawH = 48, margin = 18;
    const totalH = bh + drawH;
    const bx = width - bw - margin, by = margin;
    const cr = Math.min(radiusPx, bw / 2, totalH / 2);

    // Cubic-bezier rounded-rect paths (Q is not reliably supported in pdf-lib;
    // C is a native PDF operation). k = kappa constant for quarter-circle approximation.
    function rrAll(w, h, r) {
      if (r <= 0) return `M 0 0 H ${w} V ${h} H 0 Z`;
      const k = +(0.5523 * r).toFixed(3);
      return `M ${r} 0 H ${w-r} C ${w-r+k} 0 ${w} ${r-k} ${w} ${r} V ${h-r} C ${w} ${h-r+k} ${w-r+k} ${h} ${w-r} ${h} H ${r} C ${r-k} ${h} 0 ${h-r+k} 0 ${h-r} V ${r} C 0 ${r-k} ${r-k} 0 ${r} 0 Z`;
    }
    // Rounded bottom corners only (for the info box overlay — top edge is flush)
    function rrBottom(w, h, r) {
      if (r <= 0) return `M 0 0 H ${w} V ${h} H 0 Z`;
      const k = +(0.5523 * r).toFixed(3);
      return `M 0 0 H ${w} V ${h-r} C ${w} ${h-r+k} ${w-r+k} ${h} ${w-r} ${h} H ${r} C ${r-k} ${h} 0 ${h-r+k} 0 ${h-r} V 0 Z`;
    }

    // 1. Full block filled with drawBg (rounded all corners)
    page.drawSvgPath(rrAll(bw, totalH, cr), {
      x: bx, y: by + totalH, color: drawBg
    });

    // 2. Info box filled with boxBg (rounded bottom corners only)
    page.drawSvgPath(rrBottom(bw, bh, cr), {
      x: bx, y: by + bh, color: boxBg
    });

    // 3. Embed drawn signature image if canvas has content
    const canvas = document.getElementById('signatureCanvas');
    const blank  = document.createElement('canvas');
    blank.width  = canvas.width; blank.height = canvas.height;
    if (canvas.toDataURL() !== blank.toDataURL()) {
      const dataUrl  = canvas.toDataURL('image/png');
      const imgBytes = Uint8Array.from(atob(dataUrl.split(',')[1]), c => c.charCodeAt(0));
      const pngImg   = await pdfDoc.embedPng(imgBytes);
      page.drawImage(pngImg, { x: bx + 8, y: by + bh + 4, width: bw - 16, height: 40 });
    }

    // 4. Divider line between drawing area and info box
    page.drawLine({
      start: { x: bx, y: by + bh }, end: { x: bx + bw, y: by + bh },
      thickness: 0.75, color: borderColor
    });

    // 5. Outer border stroke — rounded, no fill
    page.drawSvgPath(rrAll(bw, totalH, cr), {
      x: bx, y: by + totalH, borderColor, borderWidth: 1.5
    });

    // 6. Text
    page.drawText(`Signed: ${sigName}`, { x: bx+8, y: by+40, size: 11, font: boldF, color: nameColor });
    page.drawText(`Reason: ${reason}`,  { x: bx+8, y: by+25, size: 9,  font,        color: rgb(0.3, 0.3, 0.3) });
    if (addTs)
      page.drawText(new Date().toLocaleString(), { x: bx+8, y: by+11, size: 8, font, color: rgb(0.5, 0.5, 0.5) });

    const saved = await pdfDoc.save();
    const name  = `signed_${loadedPdfName}`;
    storeResult(saved, name); downloadBytes(saved, name);
    showStatus('PDF signed', 'success');
  } catch (e) { showStatus('Sign failed: ' + e.message, 'error'); }
}

// ── Edit Metadata save ────────────────────────────────────────────────
document.getElementById('runMetadata')?.addEventListener('click', async () => {
  if (!loadedPdfBytes) { showStatus('Load a PDF first', 'error'); return; }
  showStatus('Saving metadata…', 'info');
  try {
    const pdfDoc = await PDFLib.PDFDocument.load(loadedPdfBytes);
    const g = id => document.getElementById(id)?.value.trim() || undefined;
    if (g('metaTitle'))    pdfDoc.setTitle(g('metaTitle'));
    if (g('metaAuthor'))   pdfDoc.setAuthor(g('metaAuthor'));
    if (g('metaSubject'))  pdfDoc.setSubject(g('metaSubject'));
    if (g('metaKeywords') && typeof pdfDoc.setKeywords === 'function')
      pdfDoc.setKeywords(g('metaKeywords').split(',').map(k => k.trim()).filter(Boolean));
    if (g('metaCreator') && typeof pdfDoc.setCreator === 'function')  pdfDoc.setCreator(g('metaCreator'));
    if (g('metaProducer') && typeof pdfDoc.setProducer === 'function') pdfDoc.setProducer(g('metaProducer'));
    if (typeof pdfDoc.setModificationDate === 'function') pdfDoc.setModificationDate(new Date());
    const saved = await pdfDoc.save();
    storeResult(saved, loadedPdfName); downloadBytes(saved, loadedPdfName);
    showStatus('Metadata saved', 'success');
    hideToolPanels();
  } catch (e) { showStatus('Failed: ' + e.message, 'error'); }
});

// ── Settings buttons ──────────────────────────────────────────────────
document.getElementById('openOptionsBtn')?.addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});

document.getElementById('encWarningDismiss')?.addEventListener('click', () => {
  const w = document.getElementById('encWarning');
  if (w) w.style.display = 'none';
});

document.getElementById('aboutBtn')?.addEventListener('click', () => {
  const manifest = browser.runtime.getManifest();
  alert(`PDF Tools\nVersion ${manifest.version}\n\nBuilt by Zozimus Technologies\nhttps://zozimustechnologies.github.io/`);
});

document.getElementById('helpBtn')?.addEventListener('click', () => {
  browser.tabs.create({ url: 'https://zozimustechnologies.github.io/' });
});
