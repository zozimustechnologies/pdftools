# 📄 PDF Tools - Browser Extension

A comprehensive and powerful browser extension for PDF manipulation with advanced security features, digital signatures, and document management tools.

## ✨ Features

### 🔧 PDF Tools
- **Compress PDF** - Reduce file size while maintaining quality
- **Extract Pages** - Extract specific pages from your PDF
- **Merge PDFs** - Combine multiple PDFs into a single document
- **Rotate Pages** - Rotate pages 90° in any direction
- **Split PDF** - Split PDF into individual pages
- **Convert Format** - Convert PDF to/from other formats

### 🔒 Security Features
- **Password Protection** - Encrypt PDFs with user and owner passwords
- **Permissions Control** - Control printing, copying, and editing permissions
- **Decrypt PDFs** - Remove password protection from encrypted PDFs
- **Digital Signatures** - Add cryptographic signatures to PDFs
- **Timestamp Support** - Add timestamps to signature operations
- **Watermarks** - Add custom watermarks with adjustable opacity
- **Stamps** - Add approval, draft, confidential, and urgent stamps

### 🎨 User Interface
- **Modern Menu Bar** - Clean, intuitive navigation with dropdown menus
- **Dark/Light Theme** - Customizable appearance preferences
- **Real-time Notifications** - Get instant feedback on operations
- **Settings Panel** - Comprehensive configuration options
- **Responsive Design** - Works perfectly on all screen sizes

## 🚀 Installation

### From Source (Development)
1. Clone the repository:
   ```bash
   git clone https://github.com/zozimus-tech/pdftools.git
   cd pdftools
   ```

2. Open your browser and go to the extensions page (e.g., `edge://extensions/` or `about:addons`)

3. Enable "Developer mode" (toggle in the top right)

4. Click "Load unpacked" and select the `pdftools` directory

### From the Extension Store
PDF Tools by Zozimus Technologies is available on the browser extension store.

## 📋 Project Structure

```
pdftools/
├── manifest.json              # Extension configuration
├── LICENSE                    # License file
├── README.md                  # This file
├── src/
│   ├── popup.html            # Main popup UI (menu bar)
│   ├── popup.css             # Popup styling
│   ├── popup.js              # Popup functionality
│   ├── background.js         # Service worker
│   ├── content.js            # Content script
│   ├── options.html          # Settings page
│   ├── options.css           # Settings styling
│   ├── options.js            # Settings functionality
│   └── utils.js              # Utility functions
├── lib/                      # External libraries
│   ├── pdf-lib.min.js       # PDF manipulation library
│   ├── pdf.min.js           # PDF.js viewer
│   ├── pdf.worker.min.js    # PDF.js worker
│   └── crypto-js.min.js     # Cryptography library
├── assets/
│   ├── icons/
│   │   ├── icon-16.png      # Extension icon (16x16)
│   │   ├── icon-48.png      # Extension icon (48x48)
│   │   └── icon-128.png     # Extension icon (128x128)
│   └── screenshots/         # Store listing screenshots
└── docs/                    # Documentation
    ├── API.md               # API documentation
    ├── CONTRIBUTING.md      # Contribution guidelines
    └── SECURITY.md          # Security policy
```

## 🛠️ Development

### Prerequisites
- Any modern browser (Firefox, Edge, Brave, Opera)
- Code editor (VS Code recommended)
- Node.js (for build tools, optional)

### File Descriptions

#### Core Files
- **manifest.json** - Defines extension metadata, permissions, and entry points
- **popup.html/js/css** - Main UI with menu bar navigation
- **background.js** - Service worker for handling background tasks
- **content.js** - Injects functionality into web pages

#### Options & Settings
- **options.html/js/css** - Settings page accessible from extension menu
- **utils.js** - Shared utility functions for PDF operations

#### Assets
- **icons/** - Extension icons (must be PNG format)
- **screenshots/** - Extension store listing images

### Key Technologies
- **Manifest V3** - Latest browser extension specification
- **PDF-lib** - JavaScript PDF manipulation
- **PDF.js** - PDF rendering and parsing
- **Crypto-JS** - Encryption and password handling
- **WebExtension APIs** - Storage, tabs, messaging

## 📖 Usage

### Basic Operations

#### 1. Password Protection
1. Click "Security" → "Add Password"
2. Enter user password (required to open)
3. Optionally set owner password (for permissions)
4. Choose permissions (printing, copying, editing)
5. Click "Encrypt PDF"

#### 2. Digital Signature
1. Click "Sign & Stamp" → "Add Signature"
2. Enter your name and reason
3. Select page number
4. Optionally add timestamp
5. Click "Sign PDF"

#### 3. Watermark
1. Click "Sign & Stamp" → "Add Watermark"
2. Enter watermark text
3. Adjust opacity
4. Click "Add Watermark"

## ⚙️ Settings

Access settings via the gear icon in the extension popup:

### Compression
- **Default Level** - Low/Medium/High
- Controls file size reduction quality

### Security
- **Encryption Method** - AES-256, AES-128, or RC4
- **Remember Passwords** - Convenience vs. security trade-off
- **Password Storage** - Local/Sync options

### Download & Storage
- **Auto-download** - Automatically save processed PDFs
- **Storage Limit** - Maximum cache size in MB

### Appearance
- **Theme** - Light/Dark/Auto
- **Notifications** - Enable/disable notifications

### Privacy
- **Analytics** - Help improve extension
- **Crash Reports** - Send error information

## 🔐 Security Considerations

### Important Notes
1. **Password Storage** - Passwords are NOT stored unless explicitly enabled in settings
2. **Local Processing** - All PDF operations occur locally; files are not sent to servers
3. **Encryption** - Uses industry-standard AES-256 encryption by default
4. **No Tracking** - Analytics can be disabled in settings

### Best Practices
- Use strong passwords (12+ characters, mix of types)
- Don't share encrypted PDF passwords
- Regularly clear cached data
- Keep the extension updated
- Review permissions periodically

## 🐛 Troubleshooting

### Common Issues

**Extension doesn't appear after installation?**
- Check if extension is enabled in your browser's extensions page
- Try refreshing the page (Ctrl+Shift+R)

**PDF files not being processed?**
- Ensure the PDF is a valid PDF file
- Check browser console for error messages
- Try a different PDF file

**Encryption not working?**
- Verify password is not empty
- Check browser storage permissions
- Clear extension cache and retry

**Performance issues with large PDFs?**
- Try using a lower compression level
- Split large PDFs into smaller files
- Close other browser tabs to free memory

## 📚 Documentation

- [API Reference](docs/API.md) - Detailed API documentation
- [Security Policy](docs/SECURITY.md) - Security information and vulnerability reporting
- [Contributing Guide](docs/CONTRIBUTING.md) - How to contribute to the project

## 🤝 Contributing

Zozimus Technologies welcomes contributions from the community! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Submit a Pull Request with your improvements

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [PDF-lib](https://pdf-lib.js.org/) - PDF manipulation library
- [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering engine
- [Crypto-JS](https://cryptojs.gitbook.io/) - Cryptography library
- WebExtension documentation and community

## 📞 Support

- **Report Issues** - [GitHub Issues](https://github.com/zozimus-tech/pdftools/issues)
- **Feature Requests** - [GitHub Discussions](https://github.com/zozimus-tech/pdftools/discussions)
- **Email Support** - support@zozimus.com

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Core PDF tools (compress, extract, merge, rotate, split)
- Security features (encryption, decryption, signatures)
- Advanced features (watermarks, stamps, timestamps)
- Settings panel with customization options
- Modern menu bar UI

---

**Developed by [Zozimus Technologies](https://zozimus.com)**
*Enterprise-grade PDF solutions for modern businesses*