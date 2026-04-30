# PDF Tools - API Documentation

## Overview

PDF Tools uses WebExtension APIs and custom message passing to handle PDF operations. This document describes the available APIs and how to use them.

## Architecture

```
┌─────────────────┐
│  Web Page       │
└────────┬────────┘
         │ chrome.runtime.sendMessage()
┌────────▼────────┐
│ Content Script  │
└────────┬────────┘
         │ Message routing
┌────────▼────────┐
│ Background      │
│ Service Worker  │
└────────┬────────┘
         │ Processing
┌────────▼────────┘
│ PDF Library     │
└─────────────────┘
```

## Message Format

### Standard Request
```javascript
{
  action: 'actionName',
  data: {
    // Optional parameters
  }
}
```

### Standard Response
```javascript
{
  success: true/false,
  data: {
    // Optional response data
  },
  error: 'Error message' // Only if success: false
}
```

## Available Actions

### PDF Operations

#### 1. Compress PDF
**Action:** `compressPDF`

Reduces PDF file size while maintaining quality.

```javascript
chrome.runtime.sendMessage({
  action: 'compressPDF',
  data: {
    file: File,              // PDF file
    level: 'low'|'medium'|'high'
  }
}, response => {
  if (response.success) {
    console.log('Compressed:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    originalSize: 5242880,    // bytes
    compressedSize: 2621440,  // bytes
    ratio: 0.5                // compression ratio
  }
}
```

#### 2. Extract Pages
**Action:** `extractPages`

Extract specific pages from a PDF.

```javascript
chrome.runtime.sendMessage({
  action: 'extractPages',
  data: {
    file: File,
    pages: [1, 3, 5],       // Array of page numbers (1-indexed)
    format: 'single'|'merged'
  }
}, response => {
  if (response.success) {
    console.log('Extracted:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    files: [Blob],          // Array of Blobs for each page or single merged
    pageCount: 3,
    format: 'single'|'merged'
  }
}
```

#### 3. Merge PDFs
**Action:** `mergePDFs`

Combine multiple PDFs into one.

```javascript
chrome.runtime.sendMessage({
  action: 'mergePDFs',
  data: {
    files: [File, File, File],  // Array of PDF files
    order: [0, 1, 2]            // Optional: reorder files
  }
}, response => {
  if (response.success) {
    console.log('Merged:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    pageCount: 45,
    fileSize: 5242880,      // bytes
    sourceCount: 3
  }
}
```

#### 4. Rotate Pages
**Action:** `rotatePages`

Rotate PDF pages.

```javascript
chrome.runtime.sendMessage({
  action: 'rotatePages',
  data: {
    file: File,
    pages: [1, 2],              // Pages to rotate (all if omitted)
    angle: 90|180|270|-90,      // Rotation angle
    allPages: false             // Rotate all pages if true
  }
}, response => {
  if (response.success) {
    console.log('Rotated:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    pageCount: 10,
    rotatedPages: 2,
    angle: 90
  }
}
```

#### 5. Split PDF
**Action:** `splitPDF`

Split PDF into individual pages.

```javascript
chrome.runtime.sendMessage({
  action: 'splitPDF',
  data: {
    file: File,
    saveAs: 'zip'|'separate'    // Download format
  }
}, response => {
  if (response.success) {
    console.log('Split:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    files: [Blob],              // Array of page Blobs
    pageCount: 50,
    totalSize: 2621440,         // bytes
    format: 'separate'|'zip'
  }
}
```

### Security Operations

#### 6. Encrypt PDF
**Action:** `encryptPDF`

Add password protection to a PDF.

```javascript
chrome.runtime.sendMessage({
  action: 'encryptPDF',
  data: {
    file: File,
    userPassword: 'password123',        // Required: open password
    ownerPassword: 'owner123',          // Optional: permission password
    permissions: {
      print: true,                      // Allow printing
      copy: true,                       // Allow copying
      edit: false                       // Allow editing
    },
    algorithm: 'AES-256'|'AES-128'|'RC4'
  }
}, response => {
  if (response.success) {
    console.log('Encrypted:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    algorithm: 'AES-256',
    encrypted: true,
    userPasswordSet: true,
    ownerPasswordSet: true,
    permissions: {
      print: true,
      copy: true,
      edit: false
    }
  }
}
```

#### 7. Decrypt PDF
**Action:** `decryptPDF`

Remove password protection from a PDF.

```javascript
chrome.runtime.sendMessage({
  action: 'decryptPDF',
  data: {
    file: File,
    password: 'password123'     // User or owner password
  }
}, response => {
  if (response.success) {
    console.log('Decrypted:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    wasEncrypted: true,
    decrypted: true,
    pageCount: 10
  }
}
```

#### 8. Sign PDF
**Action:** `signPDF`

Add digital signature to a PDF.

```javascript
chrome.runtime.sendMessage({
  action: 'signPDF',
  data: {
    file: File,
    name: 'John Doe',
    reason: 'Approved',
    page: 1,                       // Page number (1-indexed)
    x: 100,                        // X position on page
    y: 100,                        // Y position on page
    width: 150,                    // Signature width
    height: 50,                    // Signature height
    timestamp: true,               // Add timestamp
    visible: true                  // Show signature visually
  }
}, response => {
  if (response.success) {
    console.log('Signed:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    signed: true,
    signer: 'John Doe',
    reason: 'Approved',
    page: 1,
    timestamp: '2026-04-21T10:30:00Z',
    visible: true
  }
}
```

#### 9. Add Watermark
**Action:** `addWatermark`

Add watermark to PDF pages.

```javascript
chrome.runtime.sendMessage({
  action: 'addWatermark',
  data: {
    file: File,
    text: 'CONFIDENTIAL',
    opacity: 0.3,                  // 0.0 - 1.0
    rotation: -45,                 // degrees
    fontSize: 60,
    color: '#ff0000',              // hex color
    pages: [1, 2, 3],              // Optional: specific pages
    allPages: true                 // Apply to all if true
  }
}, response => {
  if (response.success) {
    console.log('Watermarked:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    watermarkText: 'CONFIDENTIAL',
    pagesModified: 10,
    opacity: 0.3,
    rotation: -45
  }
}
```

#### 10. Add Stamp
**Action:** `addStamp`

Add predefined stamp to PDF.

```javascript
chrome.runtime.sendMessage({
  action: 'addStamp',
  data: {
    file: File,
    type: 'approved'|'rejected'|'draft'|'confidential'|'urgent',
    page: 1,                       // Page number (1-indexed)
    x: 100,                        // X position
    y: 100,                        // Y position
    rotation: 0,                   // Rotation degrees
    opacity: 0.7
  }
}, response => {
  if (response.success) {
    console.log('Stamped:', response.data);
  }
});
```

**Response:**
```javascript
{
  success: true,
  data: {
    file: Blob,
    stamp: 'approved',
    page: 1,
    applied: true
  }
}
```

## Utility APIs

### PDFUtils

```javascript
// Check if file is PDF
PDFUtils.isPDF(file)  // Returns: boolean

// Format file size
PDFUtils.formatFileSize(bytes)  // Returns: string "5.2 MB"

// Generate filename
PDFUtils.generateFilename('document', 'encrypted')
// Returns: "document_encrypted_2026-04-21.pdf"

// Get timestamp
PDFUtils.getFormattedTimestamp()
// Returns: "04/21/2026, 10:30:00 AM"
```

### EncryptionUtils

```javascript
// Check password strength
EncryptionUtils.getPasswordStrength('MyPass123!@#')
// Returns: { score: 6, label: 'Very Strong' }

// Generate random password
EncryptionUtils.generateRandomPassword(16)
// Returns: "aB3$cD9@eF7#gH2!"
```

### StorageUtils

```javascript
// Save to local storage
await StorageUtils.saveToLocal('key', data)

// Get from local storage
const data = await StorageUtils.getFromLocal('key')

// Save to sync storage
await StorageUtils.saveToSync('key', data)

// Get from sync storage
const data = await StorageUtils.getFromSync('key')

// Clear all storage
await StorageUtils.clearAllStorage()
```

## Storage API

### chrome.storage.local
```javascript
// Save
chrome.storage.local.set({ myKey: myValue })

// Get
chrome.storage.local.get(['myKey'], (result) => {
  console.log(result.myKey);
})

// Clear
chrome.storage.local.clear()
```

### chrome.storage.sync
```javascript
// Synced across user's devices
chrome.storage.sync.set({ setting: value })

// Listen for changes
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync') {
    console.log('Settings changed:', changes);
  }
})
```

## Error Handling

### Common Errors

```javascript
chrome.runtime.sendMessage(message, response => {
  if (response.success) {
    console.log('Success:', response.data);
  } else {
    // Handle error
    switch(response.error) {
      case 'INVALID_PDF':
        console.error('Not a valid PDF file');
        break;
      case 'PASSWORD_INCORRECT':
        console.error('Incorrect password');
        break;
      case 'FILE_TOO_LARGE':
        console.error('File exceeds size limit');
        break;
      case 'PROCESSING_ERROR':
        console.error('Error processing PDF');
        break;
      default:
        console.error('Unknown error:', response.error);
    }
  }
});
```

## Permissions Required

The extension requires these permissions:
- `activeTab` - Access current tab
- `scripting` - Execute scripts
- `storage` - Store data
- `webRequest` - Monitor requests
- Host permissions for `file://`, `http://`, `https://`

## Limitations

- Maximum file size: 500MB
- Maximum pages per operation: 5000
- Processing timeout: 300 seconds
- Concurrent operations: 3 maximum
- Storage limit: Configurable (default 100MB)

## Examples

### Complete Example: Encrypt a PDF

```javascript
// Get file from input
const fileInput = document.getElementById('pdfInput');
const file = fileInput.files[0];

// Send encryption request
chrome.runtime.sendMessage({
  action: 'encryptPDF',
  data: {
    file: file,
    userPassword: 'MySecurePass123!',
    ownerPassword: 'OwnerPass456!',
    permissions: {
      print: true,
      copy: false,
      edit: false
    },
    algorithm: 'AES-256'
  }
}, response => {
  if (response.success) {
    // Download encrypted PDF
    const url = URL.createObjectURL(response.data.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'document-encrypted.pdf';
    link.click();
    
    console.log('PDF encrypted successfully');
  } else {
    console.error('Encryption failed:', response.error);
  }
});
```

## Version History

- **v1.0.0** - Initial release by Zozimus Technologies
- **v1.1.0** - Batch operations support (Q2 2026)
- **v1.2.0** - Advanced form filling and OCR (Q3 2026)
- **v2.0.0** - Enterprise features and team management (Q4 2026)

## Support

- Documentation: [README.md](../README.md)
- Issues: [GitHub Issues](https://github.com/zozimus-tech/pdftools/issues)
- Email: api@zozimus.com
- Website: [zozimus.com](https://zozimus.com)
