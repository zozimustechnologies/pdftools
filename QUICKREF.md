# Quick Reference Guide

## User Quick Start

### Accessing Features

1. **Click PDF Tools icon** (toolbar)
2. **Select menu category**:
   - 📦 **Tools** - Compress, extract, merge, rotate, split, convert
   - 🔒 **Security** - Password protection, decryption, permissions
   - ✍️ **Sign & Stamp** - Digital signatures, stamps, watermarks

### Common Tasks

#### Protect a PDF with Password
1. Click "Security" → "Add Password"
2. Enter password (8+ characters recommended)
3. Optional: Set owner password for permissions
4. Click "Encrypt PDF"
5. Download encrypted file

#### Extract Specific Pages
1. Click "Tools" → "Extract Pages"
2. Select which pages (e.g., "1,3,5-7")
3. Click "Extract"
4. Download extracted PDF

#### Add Watermark
1. Click "Sign & Stamp" → "Add Watermark"
2. Enter watermark text (e.g., "CONFIDENTIAL")
3. Adjust opacity (transparency)
4. Click "Add Watermark"
5. Download watermarked PDF

#### Digital Signature
1. Click "Sign & Stamp" → "Add Signature"
2. Enter your name
3. Enter reason (e.g., "Approved")
4. Select page number
5. Click "Sign PDF"
6. Download signed document

---

## Developer Quick Reference

### File Locations

| Purpose | File | Location |
|---------|------|----------|
| Main UI | popup.html | `src/popup.html` |
| Menu navigation | popup.js | `src/popup.js` |
| Menu styling | popup.css | `src/popup.css` |
| Background tasks | background.js | `src/background.js` |
| Web page integration | content.js | `src/content.js` |
| Settings UI | options.html | `src/options.html` |
| Utilities | utils.js | `src/utils.js` |
| Config | manifest.json | `manifest.json` |

### Key Classes & Functions

#### PDFUtils
```javascript
PDFUtils.isPDF(file)                    // Check if file is PDF
PDFUtils.formatFileSize(bytes)          // Format size (e.g., "5.2 MB")
PDFUtils.generateFilename(name, suffix) // Create filename
PDFUtils.getFormattedTimestamp()        // Get current timestamp
```

#### EncryptionUtils
```javascript
EncryptionUtils.getPasswordStrength(pwd)     // Check strength
EncryptionUtils.generateRandomPassword(len)  // Generate password
EncryptionUtils.hashPassword(pwd)            // Hash password
```

#### StorageUtils
```javascript
await StorageUtils.saveToLocal(key, data)    // Local storage
await StorageUtils.getFromLocal(key)         // Retrieve locally
await StorageUtils.saveToSync(key, data)     // Sync storage
await StorageUtils.clearAllStorage()         // Clear all
```

### Message Passing

**Sending a message from popup to content script:**
```javascript
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  chrome.tabs.sendMessage(tabs[0].id, {
    action: 'actionName',
    data: { /* parameters */ }
  }, response => {
    if (response.success) {
      // Handle success
    } else {
      // Handle error
    }
  });
});
```

### Adding New Features

1. **Add UI in popup.html**
2. **Add styling in popup.css**
3. **Add handler in popup.js**
4. **Add message handler in content.js**
5. **Test in Browser**

---

## Keyboard Shortcuts

(Can be customized in your browser's extension shortcuts settings)

| Action | Shortcut |
|--------|----------|
| Open menu | Ctrl+Shift+P |
| Settings | Ctrl+Shift+, |
| Encrypt | Alt+E |
| Sign | Alt+S |
| Watermark | Alt+W |

---

## Debugging

### Enable Console Logging
```javascript
// In any file
console.log('Debug message', data);

// Access console:
// 1. Click extension icon
// 2. Right-click → Inspect
// 3. Go to Console tab
```

### View Extension Logs
```
extensions page 
→ Click "Service Worker" under PDF Tools
→ Console tab shows background.js logs
```

### View Content Script Logs
```
1. Open any page with PDF
2. Right-click → Inspect
3. Console shows content.js logs
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Changes not visible | Reload extension (F5) |
| Old code running | Clear cache (Shift+Ctrl+Delete) |
| Library not found | Verify lib/ files exist |
| Message not sent | Check tab ID and permissions |
| Storage not working | Check storage permissions in manifest |

---

## Testing Checklist

Before submitting changes:

- [ ] No console errors (F12)
- [ ] All menu items clickable
- [ ] Settings save/load correctly
- [ ] Sample PDF works (< 10MB)
- [ ] Large PDF works (> 50MB)
- [ ] Error messages display correctly
- [ ] Notifications appear
- [ ] No memory leaks (DevTools Memory)

---

## Performance Tips

### For Users
- Close other browser tabs for large PDFs
- Use compression before merging many files
- Clear cache monthly in settings
- Restart browser if performance degrades

### For Developers
- Use `requestIdleCallback` for non-urgent tasks
- Implement lazy loading for large files
- Cache frequently used data
- Profile with browser DevTools (F12 → Performance)
- Use Web Workers for heavy processing

---

## Common Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Invalid PDF" | File is corrupted or not PDF | Try different file |
| "File too large" | Exceeds limit (500MB) | Split or compress first |
| "Permission denied" | Browser permission issue | Check permissions in settings |
| "Password incorrect" | Wrong password entered | Verify password carefully |
| "Processing timeout" | Operation too slow | Try smaller file or restart |

---

## Useful Resources

### Documentation
- [README.md](../README.md) - Full documentation
- [API.md](API.md) - Complete API reference
- [SECURITY.md](SECURITY.md) - Security information
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guide

### External Resources
- [WebExtension Docs](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions)
- [PDF-lib Docs](https://pdf-lib.js.org/)
- [Crypto-JS Docs](https://cryptojs.gitbook.io/)
- [PDF.js Docs](https://mozilla.github.io/pdf.js/)

### Community
- GitHub Issues: Report bugs
- GitHub Discussions: Share ideas
- Stack Overflow: Ask questions
- Email: support@pdftools.dev

---

## Version History Quick Reference

### v1.0.0 (Current)
- Core PDF tools
- Password protection
- Digital signatures
- Watermarks & stamps
- Menu bar UI
- Settings panel

### Planned Features
- Batch processing
- Form filling
- OCR support
- Mobile app
- Cloud sync

---

## License

PDF Tools is licensed under the MIT License.
See [LICENSE](../LICENSE) for details.

---

## Support

- **Questions?** Check [FAQ](#faq) below
- **Bug?** Open GitHub issue
- **Suggestion?** Start discussion
- **Email:** support@zozimus.com
- **Website:** zozimus.com

---

## FAQ

**Q: Is my PDF data private?**
A: Yes! All processing happens locally in your browser. No data is sent to servers.

**Q: Can I use this offline?**
A: Yes, the extension works entirely offline.

**Q: What's the file size limit?**
A: Maximum 500MB per file (configurable in settings).

**Q: Can I undo changes?**
A: Original files are never modified. Downloads are new files.

**Q: How do I uninstall?**
A: Go to your browser's extensions page, find PDF Tools, click Remove.

**Q: Can I use this commercially?**
A: Yes, MIT license allows commercial use.

**Q: How do I backup my settings?**
A: Settings are synced via your browser's sync feature by default.

**Q: Can I contribute?**
A: Yes! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

Keep this guide handy! 📖
