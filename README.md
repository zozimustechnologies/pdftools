# 📄 PDF Tools — Browser Extension by Zozimus Technologies

A privacy-first, full-featured PDF toolkit built into the Microsoft Edge side panel. Password protect, sign, watermark, merge, split, rotate, and extract PDF pages — all processed **100% locally** with no uploads.

## ✨ Features

### 🔧 PDF Tools
- **Extract Pages** — Extract specific pages by number or range
- **Merge PDFs** — Combine multiple PDFs into a single document
- **Rotate Pages** — Rotate pages 90°, 180°, or 270°
- **Split PDF** — Separate every page into its own file
- **Edit Metadata** — Update title, author, subject, keywords, and more

### 🔒 Security & Protection
- **Password Protection** — AES-256 encryption with separate user and owner passwords
- **Granular Permissions** — Control printing, copying, editing, annotations, and form filling
- **Decrypt PDFs** — Remove password protection from PDFs you own
- **Watermarks** — Custom text, opacity, placement, font size, and colour with live preview

### ✍️ Digital Signatures
- **Draw Your Signature** — Sign directly in the panel using mouse or touch
- **Signature Metadata** — Attach your name, reason, and page number
- **Timestamp Support** — Add an authoritative timestamp to every signature
- **Full Customisation** — Ink colour, border, background, and roundness

### 📋 Document Information
- **File Info** — Page count, PDF version, file size, and encryption status
- **Permission Summary** — See exactly what operations the PDF allows

### 🎨 User Interface
- **Side Panel UI** — Works alongside any webpage without leaving your tab
- **Brand Theme** — Clean blue gradient design by Zozimus Technologies
- **Real-time Notifications** — Instant feedback on every operation
- **Settings Panel** — Auto-download, notifications, and language preferences

## 🚀 Installation

PDF Tools is available on the **Microsoft Edge Add-on Store**.

1. Open Microsoft Edge and visit the [Edge Add-on Store](https://microsoftedge.microsoft.com/addons/)
2. Search for **"PDF Tools by Zozimus Technologies"**
3. Click **"Get"** and confirm the installation
4. The PDF Tools icon will appear in your browser toolbar — click it to open the side panel

**🌐 Website:** [zozimustechnologies.github.io/pdftools](https://zozimustechnologies.github.io/pdftools/)

## 🔒 Privacy

- **Zero uploads** — All processing runs in your browser using [PDF-lib](https://pdf-lib.js.org/) and [PDF.js](https://mozilla.github.io/pdf.js/)
- **No accounts** — No sign-in, no tracking, no analytics
- **No external servers** — Documents never leave your device

## 📋 Project Structure

```
pdftools/
├── manifest.json              # Extension configuration (Manifest V3)
├── background.js              # Service worker (side panel launcher)
├── content.js                 # Content script
├── sidepanel.html/css/js      # Main side panel UI
├── src/
│   ├── popup.html/css/js      # Popup UI
│   ├── background.js          # Service worker source
│   ├── content.js             # Content script source
│   ├── options.html/css/js    # Settings page
│   └── utils.js               # Shared utility functions
├── lib/                       # Bundled open-source libraries
│   ├── pdf-lib.min.js        # PDF manipulation
│   ├── pdf.min.js            # PDF.js viewer
│   ├── pdf.worker.min.js     # PDF.js worker
│   └── crypto-js.min.js      # AES-256 encryption
├── icons/                     # Extension icons (PNG)
├── storeassets/               # Edge Add-on Store submission assets
│   ├── extensionlogo-300x300.png
│   ├── smallpromotionaltile-440x280.png
│   ├── largepromotionaltile-1400x560.png
│   ├── screenshot-1280x800.png
│   ├── screenshot-640x400.png
│   └── description.md        # Store listing copy
├── scripts/
│   └── generate-store-assets.js  # Puppeteer asset generator
└── docs/
    ├── API.md                 # API documentation
    └── SECURITY.md            # Security policy
```

### Key Technologies
- **Manifest V3** — Latest browser extension specification
- **PDF-lib** — JavaScript PDF manipulation
- **PDF.js** — PDF rendering and parsing
- **Crypto-JS** — AES-256 encryption and password handling
- **WebExtension APIs** — Storage, tabs, messaging, side panel
- **Puppeteer** — Store asset generation (dev only)

## 📖 Usage

### Protect a PDF with a Password
1. Load a PDF using the file picker or "Use Current Tab"
2. Click the **Protect** tab → **Encrypt with Password**
3. Enter a user password (required to open) and optionally an owner password
4. Set granular permissions (print, copy, edit, annotate, etc.)
5. Click **Encrypt PDF** — the file downloads automatically

### Add a Digital Signature
1. Load a PDF and click the **Sign** tab
2. Enter your name, reason, and target page number
3. Draw your signature in the canvas
4. Customise ink colour, border, and roundness
5. Click **Sign PDF**

### Merge PDFs
1. Load the first PDF via the file picker
2. Click the **Tools** tab → **Merge** → **Start**
3. Select additional PDF files to append
4. Click **Merge & Download**

### Add a Watermark
1. Load a PDF and click **Protect** → **Add Watermark**
2. Enter your watermark text and choose placement, opacity, and colour
3. Preview updates live — click **Add Watermark** when ready

## 🐛 Troubleshooting

**Extension doesn't appear after installation?**
- Check if the extension is enabled in your browser's extension settings
- Try restarting Microsoft Edge

**PDF not loading?**
- Ensure the file is a valid PDF
- Try a different PDF to rule out file corruption

**Encryption not working?**
- Verify the password field is not empty
- Clear extension storage in settings and retry

**Performance issues with large PDFs?**
- Split large PDFs into smaller files first
- Close unused browser tabs to free memory

## 📚 Documentation

- [API Reference](docs/API.md)
- [Security Policy](docs/SECURITY.md)
- [Store Listing Copy](storeassets/description.md)

## 📝 License

MIT License — see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- [PDF-lib](https://pdf-lib.js.org/) — PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) — PDF rendering engine
- [Crypto-JS](https://cryptojs.gitbook.io/) — Cryptography library

## 📞 Support

Visit the [Zozimus Technologies website](https://zozimustechnologies.github.io/) or [report an issue on GitHub](https://github.com/zozimustechnologies/pdftools/issues/).

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Side panel UI with brand blue gradient theme
- Extract, merge, rotate, split, and metadata editing
- AES-256 password protection with granular permissions
- Digital signatures with draw canvas and full customisation
- Watermarks with live preview
- Document info tab
- Settings: auto-download, notifications, language
- Store assets generated via Puppeteer
- 100% local processing — no uploads

---

**Developed by [Zozimus Technologies](https://zozimustechnologies.github.io/)**
*Privacy-first PDF solutions for Microsoft Edge*