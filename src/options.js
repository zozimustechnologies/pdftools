// Browser API compatibility shim
/* global browser */
const browser = globalThis.browser || globalThis.chrome;

const DEFAULTS = {
  autoDownload:             true,
  enableNotifications:      true,
  defaultWatermarkText:     '',
  defaultWatermarkColor:    '#3d7ea6',
  defaultWatermarkOpacity:  30,
  defaultSignatureName:     '',
  defaultSignatureReason:   '',
};

const $ = id => document.getElementById(id);

// ── Load ──────────────────────────────────────────────────────────────
function loadSettings() {
  browser.storage.sync.get('pdfToolsSettings', result => {
    const s = Object.assign({}, DEFAULTS, result.pdfToolsSettings || {});
    $('autoDownload').checked            = s.autoDownload;
    $('enableNotifications').checked     = s.enableNotifications;
    $('defaultWatermarkText').value      = s.defaultWatermarkText;
    $('defaultWatermarkColor').value     = s.defaultWatermarkColor;
    $('defaultWatermarkOpacity').value   = s.defaultWatermarkOpacity;
    $('defaultWatermarkOpacityVal').textContent = s.defaultWatermarkOpacity + '%';
    $('defaultSignatureName').value      = s.defaultSignatureName;
    $('defaultSignatureReason').value    = s.defaultSignatureReason;
  });

  // Show version from manifest
  const manifest = browser.runtime.getManifest();
  if ($('aboutVersion')) $('aboutVersion').textContent = manifest.version;
}

// ── Save ──────────────────────────────────────────────────────────────
function saveSettings() {
  const s = {
    autoDownload:             $('autoDownload').checked,
    enableNotifications:      $('enableNotifications').checked,
    defaultWatermarkText:     $('defaultWatermarkText').value.trim(),
    defaultWatermarkColor:    $('defaultWatermarkColor').value,
    defaultWatermarkOpacity:  parseInt($('defaultWatermarkOpacity').value, 10),
    defaultSignatureName:     $('defaultSignatureName').value.trim(),
    defaultSignatureReason:   $('defaultSignatureReason').value.trim(),
  };
  browser.storage.sync.set({ pdfToolsSettings: s }, () => {
    showStatus('Settings saved', 'success');
  });
}

// ── Reset ─────────────────────────────────────────────────────────────
function resetSettings() {
  if (!confirm('Reset all settings to defaults?')) return;
  browser.storage.sync.set({ pdfToolsSettings: DEFAULTS }, () => {
    loadSettings();
    showStatus('Reset to defaults', 'success');
  });
}

// ── Status ────────────────────────────────────────────────────────────
function showStatus(msg, type) {
  const el = $('statusMsg');
  el.textContent = msg;
  el.className = 'status-msg ' + type;
  setTimeout(() => { el.textContent = ''; el.className = 'status-msg'; }, 3000);
}

// ── Init ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  $('saveBtn').addEventListener('click', saveSettings);
  $('resetBtn').addEventListener('click', resetSettings);
  $('defaultWatermarkOpacity').addEventListener('input', e => {
    $('defaultWatermarkOpacityVal').textContent = e.target.value + '%';
  });
});
