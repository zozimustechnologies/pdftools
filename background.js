// Browser API compatibility shim
/* global browser */
const browser = globalThis.browser || globalThis.chrome;

// Open side panel when toolbar icon is clicked
browser.action.onClicked.addListener((tab) => {
  browser.sidePanel.open({ tabId: tab.id });
});

// Background Service Worker
browser.runtime.onInstalled.addListener(() => {
  console.log('PDF Tools extension installed');
  
  // Set default options
  browser.storage.sync.get('preferences', (result) => {
    if (!result.preferences) {
      browser.storage.sync.set({
        preferences: {
          defaultCompression: 'medium',
          autoDownload: true,
          theme: 'light'
        }
      });
    }
  });
});

// Handle messages from content script
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch(request.action) {
    case 'getPDFInfo':
      handleGetPDFInfo(request, sender, sendResponse);
      break;
    case 'processPDF':
      handleProcessPDF(request, sender, sendResponse);
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
  return true; // Keep the message channel open
});

// Handle PDF Info requests
function handleGetPDFInfo(request, sender, sendResponse) {
  // This will be called from content script to get PDF information
  sendResponse({ success: true, info: { pages: 10 } }); // Placeholder
}

// Handle PDF Processing
function handleProcessPDF(request, sender, sendResponse) {
  const { action, data } = request;
  
  switch(action) {
    case 'encrypt':
      // Encryption logic
      sendResponse({ success: true, message: 'PDF encrypted' });
      break;
    case 'decrypt':
      // Decryption logic
      sendResponse({ success: true, message: 'PDF decrypted' });
      break;
    case 'sign':
      // Signing logic
      sendResponse({ success: true, message: 'PDF signed' });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown PDF action' });
  }
}
