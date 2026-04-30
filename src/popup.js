// Browser API compatibility shim
/* global browser */
const browser = globalThis.browser || globalThis.chrome;

// DOM Elements
const menuItems = document.querySelectorAll('.menu-item');
const contentPanels = document.querySelectorAll('.content-panel');
const statusMessage = document.getElementById('status');

// Menu Bar Navigation
menuItems.forEach((item, index) => {
  const menuBtn = item.querySelector('.menu-btn');
  
  menuBtn.addEventListener('click', () => {
    // Remove active class from all menu items and hide panels
    menuItems.forEach(m => m.classList.remove('active'));
    contentPanels.forEach(p => p.classList.remove('active'));
    
    // Add active class to current menu item
    item.classList.add('active');
    
    // Show corresponding content panel
    const panelName = menuBtn.dataset.menu;
    const contentPanel = document.getElementById(panelName + '-content');
    if (contentPanel) {
      contentPanel.classList.add('active');
    }
  });
});

// Submenu Item Navigation
document.querySelectorAll('.submenu a').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const action = link.dataset.action || link.dataset.tool;
    handleAction(action);
  });
});

// Tool Buttons
document.querySelectorAll('.tool-btn').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const tool = btn.dataset.tool;
    handleToolAction(tool);
  });
});

// Action Buttons
document.getElementById('protectBtn')?.addEventListener('click', encryptPDF);
document.getElementById('decryptBtn')?.addEventListener('click', decryptPDF);
document.getElementById('signBtn')?.addEventListener('click', signPDF);
document.getElementById('stampBtn')?.addEventListener('click', addStamp);
document.getElementById('watermarkBtn')?.addEventListener('click', addWatermark);

// Settings Button
document.getElementById('settingsBtn').addEventListener('click', () => {
  browser.runtime.openOptionsPage();
});

// Helper Functions
function showStatus(message, type = 'info') {
  statusMessage.textContent = message;
  statusMessage.className = `status-message show ${type}`;
  setTimeout(() => {
    statusMessage.classList.remove('show');
  }, 3000);
}

function handleAction(action) {
  console.log('Action:', action);
  
  switch(action) {
    case 'encrypt':
      showSection('encryptSection', 'decryptSection', 'stampSection', 'watermarkSection');
      break;
    case 'decrypt':
      showSection('decryptSection', 'encryptSection', 'stampSection', 'watermarkSection');
      break;
    case 'signature':
      showSection('signatureSection', 'stampSection', 'watermarkSection');
      break;
    case 'stamp':
      showSection('stampSection', 'signatureSection', 'watermarkSection');
      break;
    case 'watermark':
      showSection('watermarkSection', 'signatureSection', 'stampSection');
      break;
    default:
      showStatus(`Action: ${action}`, 'info');
  }
}

function handleToolAction(tool) {
  console.log('Tool:', tool);
  
  // Get current PDF from active tab
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const message = {
      action: 'getTool',
      tool: tool
    };
    
    browser.tabs.sendMessage(tabs[0].id, message, (response) => {
      if (response?.success) {
        showStatus(`${tool} tool activated`, 'success');
      } else {
        showStatus(`Failed to activate ${tool} tool`, 'error');
      }
    });
  });
}

function showSection(...sections) {
  sections.forEach(sectionId => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = section === sections[0] ? 'block' : 'none';
    }
  });
}

// Encryption
async function encryptPDF() {
  const userPassword = document.getElementById('userPassword').value;
  const ownerPassword = document.getElementById('ownerPassword').value;
  const printAllow = document.getElementById('printAllow').checked;
  const copyAllow = document.getElementById('copyAllow').checked;
  const editAllow = document.getElementById('editAllow')?.checked;

  if (!userPassword && !ownerPassword) {
    showStatus('Please enter at least one password', 'error');
    return;
  }

  // Send message to content script
  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      action: 'encryptPDF',
      userPassword,
      ownerPassword,
      permissions: {
        print: printAllow,
        copy: copyAllow,
        edit: editAllow
      }
    }, (response) => {
      if (response?.success) {
        showStatus('PDF encrypted successfully', 'success');
        // Clear inputs
        document.getElementById('userPassword').value = '';
        document.getElementById('ownerPassword').value = '';
      } else {
        showStatus(response?.error || 'Failed to encrypt PDF', 'error');
      }
    });
  });
}

// Decryption
async function decryptPDF() {
  const password = document.getElementById('decryptPassword').value;

  if (!password) {
    showStatus('Please enter the PDF password', 'error');
    return;
  }

  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      action: 'decryptPDF',
      password
    }, (response) => {
      if (response?.success) {
        showStatus('PDF decrypted successfully', 'success');
        document.getElementById('decryptPassword').value = '';
      } else {
        showStatus(response?.error || 'Failed to decrypt PDF', 'error');
      }
    });
  });
}

// Digital Signature
async function signPDF() {
  const signatureName = document.getElementById('signatureName').value;
  const signatureReason = document.getElementById('signatureReason').value;
  const signaturePage = document.getElementById('signaturePage').value;
  const addTimestamp = document.getElementById('timestampSign').checked;

  if (!signatureName) {
    showStatus('Please enter your name', 'error');
    return;
  }

  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      action: 'signPDF',
      name: signatureName,
      reason: signatureReason,
      page: parseInt(signaturePage),
      timestamp: addTimestamp,
      date: new Date().toISOString()
    }, (response) => {
      if (response?.success) {
        showStatus('PDF signed successfully', 'success');
      } else {
        showStatus(response?.error || 'Failed to sign PDF', 'error');
      }
    });
  });
}

// Add Stamp
async function addStamp() {
  const stampType = document.getElementById('stampType').value;
  const stampPage = document.getElementById('stampPage').value;

  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      action: 'addStamp',
      type: stampType,
      page: parseInt(stampPage)
    }, (response) => {
      if (response?.success) {
        showStatus('Stamp added successfully', 'success');
      } else {
        showStatus(response?.error || 'Failed to add stamp', 'error');
      }
    });
  });
}

// Add Watermark
async function addWatermark() {
  const watermarkText = document.getElementById('watermarkText').value;
  const watermarkOpacity = document.getElementById('watermarkOpacity').value;

  if (!watermarkText) {
    showStatus('Please enter watermark text', 'error');
    return;
  }

  browser.tabs.query({active: true, currentWindow: true}, (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      action: 'addWatermark',
      text: watermarkText,
      opacity: parseInt(watermarkOpacity) / 100
    }, (response) => {
      if (response?.success) {
        showStatus('Watermark added successfully', 'success');
      } else {
        showStatus(response?.error || 'Failed to add watermark', 'error');
      }
    });
  });
}

// ── Signature Canvas ────────────────────────────────────────────────
(function initSignatureCanvas() {
  const canvas = document.getElementById('signatureCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let captured = false;
  let penDown  = false;

  function enterCapture() {
    if (captured) return;
    captured = true;
    canvas.classList.add('sig-capturing');
    canvas.title = 'Press Esc to release cursor';
  }

  function exitCapture() {
    captured = false;
    penDown  = false;
    canvas.classList.remove('sig-capturing');
    canvas.title = 'Click to start signing';
  }

  function setup() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.strokeStyle = '#1a1a1a';
    ctx.lineWidth   = 2;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const src  = e.touches ? e.touches[0] : e;
    return { x: src.clientX - rect.left, y: src.clientY - rect.top };
  }

  canvas.addEventListener('mousedown', e => {
    enterCapture();
    penDown = true;
    ctx.beginPath();
    const p = getPos(e);
    ctx.moveTo(p.x, p.y);
  });

  canvas.addEventListener('mousemove', e => {
    if (!captured || !penDown) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  });

  canvas.addEventListener('mouseup', () => { penDown = false; });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    enterCapture();
    penDown = true;
    ctx.beginPath();
    const p = getPos(e);
    ctx.moveTo(p.x, p.y);
  }, { passive: false });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!penDown) return;
    const p = getPos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
  }, { passive: false });

  canvas.addEventListener('touchend', () => { penDown = false; });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && captured) exitCapture();
  });

  document.getElementById('clearSignature')?.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  canvas.title = 'Click to start signing';
  new ResizeObserver(setup).observe(canvas);
  setup();
})();

// Initialize: Show first menu item active
if (menuItems.length > 0) {
  menuItems[0].classList.add('active');
  if (contentPanels.length > 0) {
    contentPanels[0].classList.add('active');
  }
}
