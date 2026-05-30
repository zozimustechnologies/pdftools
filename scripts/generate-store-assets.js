/**
 * Generates Edge Add-on Store assets using Puppeteer.
 * Run: node scripts/generate-store-assets.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = path.join(__dirname, '..', 'storeassets');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// Embed logo.svg as a base64 data URI so Puppeteer can render it without a server
const logoSvgPath = path.join(__dirname, '..', 'logo.svg');
const logoDataURI = 'data:image/svg+xml;base64,' + fs.readFileSync(logoSvgPath).toString('base64');

// Brand colours
const GRAD = 'linear-gradient(135deg, #3d7ea6 0%, #1a4a6e 100%)';
const BLUE1 = '#3d7ea6';
const BLUE2 = '#1a4a6e';
const RED   = '#e53935';
const WHITE = '#ffffff';
const LIGHT = '#f0f6fa';

// ── HTML templates ────────────────────────────────────────────────────────────

function logoHTML() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:300px;height:300px;overflow:hidden;background:${GRAD}}
    .wrap{
      width:300px;height:300px;
      display:flex;flex-direction:column;
      align-items:center;justify-content:center;gap:0;
    }
    .logo{width:300px;height:300px;object-fit:contain;display:block}
  </style>
</head><body>
  <div class="wrap">
    <img class="logo" src="${logoDataURI}" alt="PDF Tools logo">
  </div>
</body></html>`;
}

function smallTileHTML() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:440px;height:280px;overflow:hidden}
    .wrap{
      width:440px;height:280px;
      background:${GRAD};
      display:flex;align-items:center;justify-content:space-between;
      padding:32px 36px;
    }
    .left{display:flex;flex-direction:column;gap:10px}
    .logo-row{display:flex;align-items:center;gap:12px}
    .icon{font-size:44px;line-height:1}
    .title{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:30px;font-weight:700;color:${WHITE};
    }
    .tagline{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:13px;color:rgba(255,255,255,0.80);
      line-height:1.5;max-width:240px;
    }
    .badge{
      display:inline-block;background:${RED};
      color:${WHITE};font-size:11px;font-weight:700;
      padding:4px 12px;border-radius:20px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      text-transform:uppercase;letter-spacing:1px;margin-top:6px;width:fit-content;
    }
    .features{
      display:flex;flex-direction:column;gap:8px;align-items:flex-end;
    }
    .feat{
      background:rgba(255,255,255,0.15);
      color:${WHITE};
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:12px;font-weight:500;
      padding:5px 14px;border-radius:20px;
      backdrop-filter:blur(4px);white-space:nowrap;
    }
  </style>
</head><body>
  <div class="wrap">
    <div class="left">
      <div class="logo-row">
        <img src="${logoDataURI}" style="width:52px;height:52px;object-fit:contain;flex-shrink:0" alt="logo">
        <div class="title">PDF Tools</div>
      </div>
      <div class="tagline">Complete PDF toolkit — secure, sign, and manage your documents locally.</div>
      <div class="badge">Free · No uploads</div>
    </div>
    <div class="features">
      <div class="feat">🔐 Password Protect</div>
      <div class="feat">✍️ Digital Signatures</div>
      <div class="feat">💧 Watermarks</div>
      <div class="feat">✂️ Extract Pages</div>
      <div class="feat">🔀 Merge &amp; Split</div>
    </div>
  </div>
</body></html>`;
}

function largeTileHTML() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{width:1400px;height:560px;overflow:hidden}
    .wrap{
      width:1400px;height:560px;
      background:${GRAD};
      display:flex;align-items:center;justify-content:space-between;
      padding:60px 100px;
    }
    .left{display:flex;flex-direction:column;gap:18px;max-width:560px}
    .logo-row{display:flex;align-items:center;gap:20px}
    .icon{font-size:80px;line-height:1}
    .title{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:64px;font-weight:700;color:${WHITE};line-height:1;
    }
    .sub{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:20px;color:rgba(255,255,255,0.75);
      letter-spacing:2px;text-transform:uppercase;
    }
    .tagline{
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:20px;color:rgba(255,255,255,0.90);line-height:1.6;
    }
    .badges{display:flex;gap:12px;flex-wrap:wrap;margin-top:4px}
    .badge{
      background:rgba(255,255,255,0.18);
      color:${WHITE};
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      font-size:14px;font-weight:600;
      padding:7px 18px;border-radius:20px;
    }
    .badge.red{background:${RED}}
    .right{
      display:grid;grid-template-columns:1fr 1fr;gap:16px;
    }
    .card{
      background:rgba(255,255,255,0.13);
      border:1px solid rgba(255,255,255,0.25);
      border-radius:14px;padding:20px 22px;
      font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
      color:${WHITE};
      backdrop-filter:blur(4px);
      min-width:200px;
    }
    .card-icon{font-size:28px;margin-bottom:8px}
    .card-title{font-size:16px;font-weight:700;margin-bottom:4px}
    .card-desc{font-size:12px;opacity:0.75;line-height:1.4}
  </style>
</head><body>
  <div class="wrap">
    <div class="left">
      <div class="logo-row">
        <img src="${logoDataURI}" style="width:90px;height:90px;object-fit:contain;flex-shrink:0" alt="logo">
        <div>
          <div class="title">PDF Tools</div>
          <div class="sub">by Zozimus Technologies</div>
        </div>
      </div>
      <div class="tagline">The complete PDF toolkit for Microsoft Edge.<br>Process documents locally — nothing leaves your device.</div>
      <div class="badges">
        <div class="badge red">Free</div>
        <div class="badge">🔒 100% Local</div>
        <div class="badge">📴 No Uploads</div>
        <div class="badge">⚡ Fast</div>
      </div>
    </div>
    <div class="right">
      <div class="card"><div class="card-icon">🔐</div><div class="card-title">Password Protect</div><div class="card-desc">AES-256 encryption with full permission control</div></div>
      <div class="card"><div class="card-icon">✍️</div><div class="card-title">Digital Signatures</div><div class="card-desc">Draw and embed signatures with timestamps</div></div>
      <div class="card"><div class="card-icon">💧</div><div class="card-title">Watermarks</div><div class="card-desc">Custom text watermarks with opacity control</div></div>
      <div class="card"><div class="card-icon">✂️</div><div class="card-title">Extract &amp; Split</div><div class="card-desc">Extract specific pages or split into files</div></div>
      <div class="card"><div class="card-icon">🔀</div><div class="card-title">Merge PDFs</div><div class="card-desc">Combine multiple PDFs into one document</div></div>
      <div class="card"><div class="card-icon">↩️</div><div class="card-title">Rotate Pages</div><div class="card-desc">Rotate individual or all pages instantly</div></div>
    </div>
  </div>
</body></html>`;
}

function screenshotHTML() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    html,body{background:#e8edf2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
    .scene{
      display:flex;align-items:center;justify-content:center;
      height:100vh;gap:40px;padding:40px;
    }
    /* Browser chrome mockup */
    .browser{
      background:#fff;border-radius:10px;
      box-shadow:0 20px 60px rgba(0,0,0,0.18);
      overflow:hidden;flex:1;max-width:760px;
    }
    .browser-bar{
      background:#f1f3f4;padding:10px 14px;
      display:flex;align-items:center;gap:10px;
      border-bottom:1px solid #ddd;
    }
    .dots{display:flex;gap:6px}
    .dot{width:12px;height:12px;border-radius:50%}
    .dot1{background:#ff5f57}.dot2{background:#febc2e}.dot3{background:#28c840}
    .url-bar{
      flex:1;background:#fff;border:1px solid #ddd;border-radius:20px;
      padding:4px 14px;font-size:12px;color:#666;
    }
    .browser-content{
      background:#f5f5f5;padding:20px;min-height:400px;
      display:flex;gap:16px;
    }
    .page-area{
      flex:1;background:#fff;border-radius:8px;
      padding:20px;box-shadow:0 2px 8px rgba(0,0,0,0.06);
    }
    .page-title{font-size:18px;font-weight:600;color:#333;margin-bottom:8px}
    .page-body{font-size:12px;color:#888;line-height:1.8}
    .page-lines{display:flex;flex-direction:column;gap:6px;margin-top:12px}
    .line{height:10px;background:#eee;border-radius:4px}
    .line.w80{width:80%}.line.w60{width:60%}.line.w90{width:90%}.line.w70{width:70%}

    /* Side panel */
    .sidepanel{
      width:340px;flex-shrink:0;
      background:#fff;border-radius:10px;
      box-shadow:0 20px 60px rgba(0,0,0,0.18);
      overflow:hidden;display:flex;flex-direction:column;
    }
    .sp-header{
      background:${GRAD};
      padding:10px 14px;display:flex;align-items:center;gap:10px;
    }
    .sp-icon{font-size:22px}
    .sp-title{color:#fff;font-size:16px;font-weight:700;flex:1}
    .sp-donate{
      background:${RED};color:#fff;
      font-size:11px;font-weight:700;
      padding:4px 10px;border-radius:12px;
    }
    .sp-tabs{
      display:flex;border-bottom:2px solid #e0e0e0;
    }
    .sp-tab{
      flex:1;padding:10px 4px;font-size:12px;font-weight:500;
      text-align:center;color:#888;border-bottom:3px solid transparent;
    }
    .sp-tab.active{color:${BLUE1};border-bottom-color:${BLUE1};background:#f0f6fa}
    .sp-loader{
      margin:8px;padding:8px 10px;
      background:#f0f6fa;border:1.5px dashed ${BLUE1};border-radius:8px;
      font-size:11px;color:${BLUE1};font-weight:500;
    }
    .sp-grid{
      display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;padding:8px;
    }
    .sp-card{
      background:#fff;border:2px solid #e0e0e0;border-radius:8px;
      padding:8px 6px;text-align:center;
    }
    .sp-card-icon{font-size:18px}
    .sp-card-name{font-size:10px;font-weight:600;color:#333;margin:4px 0 2px}
    .sp-card-desc{font-size:9px;color:#888;margin-bottom:6px}
    .sp-card-btn{
      background:${GRAD};color:#fff;
      border:none;padding:3px 10px;border-radius:10px;
      font-size:9px;font-weight:700;cursor:pointer;
    }
    .sp-footer{
      padding:6px;text-align:center;font-size:10px;color:#aaa;
      border-top:1px solid #eee;margin-top:auto;
    }
    .sp-footer a{color:${BLUE1};text-decoration:none}

    /* Right panel - info */
    .info-panel{
      width:260px;flex-shrink:0;display:flex;flex-direction:column;gap:16px;
    }
    .info-card{
      background:#fff;border-radius:10px;
      box-shadow:0 4px 16px rgba(0,0,0,0.08);
      padding:18px;
    }
    .info-card-title{
      font-size:13px;font-weight:700;color:${BLUE2};margin-bottom:10px;
      text-transform:uppercase;letter-spacing:0.5px;
    }
    .feature-list{display:flex;flex-direction:column;gap:8px}
    .feature-item{display:flex;align-items:center;gap:8px;font-size:12px;color:#444}
    .feature-icon{font-size:16px;flex-shrink:0}
    .local-badge{
      background:#e8f5e9;color:#2e7d32;
      border-radius:8px;padding:10px 12px;
      font-size:12px;font-weight:600;text-align:center;
    }
  </style>
</head><body>
  <div class="scene">
    <div class="browser">
      <div class="browser-bar">
        <div class="dots"><div class="dot dot1"></div><div class="dot dot2"></div><div class="dot dot3"></div></div>
        <div class="url-bar">https://example.com/document.pdf</div>
      </div>
      <div class="browser-content">
        <div class="page-area">
          <div class="page-title">Annual Report 2026.pdf</div>
          <div class="page-body">Page 1 of 12</div>
          <div class="page-lines">
            <div class="line w90"></div><div class="line w80"></div>
            <div class="line w60"></div><div class="line w90"></div>
            <div class="line w70"></div><div class="line w80"></div>
            <div class="line w60"></div><div class="line w90"></div>
            <div class="line w80"></div><div class="line w70"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="sidepanel">
      <div class="sp-header">
        <div class="sp-icon"><img src="${logoDataURI}" style="width:26px;height:26px;object-fit:contain;display:block" alt="logo"></div>
        <div class="sp-title">PDF Tools</div>
        <div class="sp-donate">❤ Donate</div>
      </div>
      <div class="sp-tabs">
        <div class="sp-tab active">Tools</div>
        <div class="sp-tab">Protect</div>
        <div class="sp-tab">Sign</div>
        <div class="sp-tab">Info</div>
      </div>
      <div class="sp-loader">📂 Annual Report 2026.pdf</div>
      <div class="sp-grid">
        <div class="sp-card"><div class="sp-card-icon">✂️</div><div class="sp-card-name">Extract</div><div class="sp-card-desc">Specific pages</div><button class="sp-card-btn">Start</button></div>
        <div class="sp-card"><div class="sp-card-icon">🔀</div><div class="sp-card-name">Merge</div><div class="sp-card-desc">Combine PDFs</div><button class="sp-card-btn">Start</button></div>
        <div class="sp-card"><div class="sp-card-icon">↩️</div><div class="sp-card-name">Rotate</div><div class="sp-card-desc">Rotate pages</div><button class="sp-card-btn">Start</button></div>
        <div class="sp-card"><div class="sp-card-icon">📑</div><div class="sp-card-name">Split</div><div class="sp-card-desc">Split into pages</div><button class="sp-card-btn">Start</button></div>
        <div class="sp-card"><div class="sp-card-icon">📝</div><div class="sp-card-name">Metadata</div><div class="sp-card-desc">Edit file info</div><button class="sp-card-btn">Start</button></div>
      </div>
      <div class="sp-footer">&copy; <a href="#">Zozimus Technologies</a>. All rights reserved.</div>
    </div>

    <div class="info-panel">
      <div class="info-card">
        <div class="info-card-title">✨ Key Features</div>
        <div class="feature-list">
          <div class="feature-item"><div class="feature-icon">🔐</div>AES-256 Password Protection</div>
          <div class="feature-item"><div class="feature-icon">✍️</div>Digital Signatures</div>
          <div class="feature-item"><div class="feature-icon">💧</div>Custom Watermarks</div>
          <div class="feature-item"><div class="feature-icon">✂️</div>Extract &amp; Split Pages</div>
          <div class="feature-item"><div class="feature-icon">🔀</div>Merge Multiple PDFs</div>
          <div class="feature-item"><div class="feature-icon">↩️</div>Rotate Pages</div>
        </div>
      </div>
      <div class="info-card">
        <div class="local-badge">🔒 100% Local Processing<br><span style="font-weight:400;font-size:11px">Your files never leave your device</span></div>
      </div>
    </div>
  </div>
</body></html>`;
}

// ── Generate assets ───────────────────────────────────────────────────────────

async function generate() {
  console.log('Launching Puppeteer…');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });

  const assets = [
    { name: 'extensionlogo-300x300.png',         w: 300,  h: 300,  html: logoHTML() },
    { name: 'smallpromotionaltile-440x280.png',  w: 440,  h: 280,  html: smallTileHTML() },
    { name: 'largepromotionaltile-1400x560.png', w: 1400, h: 560,  html: largeTileHTML() },
    { name: 'screenshot-1280x800.png',           w: 1280, h: 800,  html: screenshotHTML() },
    { name: 'screenshot-640x400.png',            w: 640,  h: 400,  html: screenshotHTML() },
  ];

  for (const asset of assets) {
    const page = await browser.newPage();
    await page.setViewport({ width: asset.w, height: asset.h, deviceScaleFactor: 2 });
    await page.setContent(asset.html, { waitUntil: 'networkidle0' });
    const outPath = path.join(OUT_DIR, asset.name);
    await page.screenshot({ path: outPath, type: 'png', clip: { x: 0, y: 0, width: asset.w, height: asset.h } });
    await page.close();
    console.log(`  ✓ ${asset.name}`);
  }

  await browser.close();
  console.log('\nAll store assets saved to storeassets/');
}

generate().catch(err => { console.error(err); process.exit(1); });
