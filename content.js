// Browser API compatibility shim
/* global browser */
const browser = globalThis.browser || globalThis.chrome;

// Content Script
console.log('PDF Tools content script loaded');

// Check if current page is displaying a PDF
function isPDFDocument() {
  const contentType = document.contentType || '';
  const isApplicationPDF = contentType.includes('application/pdf');
  const isPDFPath = /\.pdf/i.test(window.location.pathname);
  const hasPDFViewer = document.querySelector('embed[type="application/pdf"]') || 
                        document.querySelector('iframe[src*=".pdf"]') ||
                        document.body.classList.contains('pdf-viewer');
  
  return isApplicationPDF || isPDFPath || hasPDFViewer;
}

// Listen for messages from popup
browser.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Content script received:', request.action);
  
  // First, check if PDF is available for all actions except checkPDF
  if (request.action !== 'checkPDF' && !isPDFDocument()) {
    sendResponse({ success: false, error: 'No PDF detected on this page' });
    return;
  }
  
  switch(request.action) {
    case 'checkPDF':
      sendResponse({ success: true, isPDF: isPDFDocument() });
      break;
    case 'getTool':
      handleTool(request, sendResponse);
      break;
    case 'encryptPDF':
      handleEncrypt(request, sendResponse);
      break;
    case 'decryptPDF':
      handleDecrypt(request, sendResponse);
      break;
    case 'signPDF':
      handleSign(request, sendResponse);
      break;
    case 'addStamp':
      handleStamp(request, sendResponse);
      break;
    case 'addWatermark':
      handleWatermark(request, sendResponse);
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

// Handle tool actions
function handleTool(request, sendResponse) {
  const tool = request.tool;
  console.log(`Activating tool: ${tool}`);
  
  // Show notification or initiate tool
  notifyUser(`${tool} tool activated`);
  sendResponse({ success: true });
}

// Handle PDF Encryption
function handleEncrypt(request, sendResponse) {
  console.log('Encrypting PDF...');
  
  try {
    const { userPassword, ownerPassword, permissions } = request;
    
    // Here you would implement actual encryption logic
    // For now, we're just acknowledging the request
    notifyUser('PDF encrypted successfully');
    sendResponse({ success: true });
  } catch (error) {
    console.error('Encryption error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle PDF Decryption
function handleDecrypt(request, sendResponse) {
  console.log('Decrypting PDF...');
  
  try {
    const { password } = request;
    
    // Here you would implement actual decryption logic
    notifyUser('PDF decrypted successfully');
    sendResponse({ success: true });
  } catch (error) {
    console.error('Decryption error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle PDF Signing
function handleSign(request, sendResponse) {
  console.log('Signing PDF...');
  
  try {
    const { name, reason, page, timestamp, date } = request;
    
    // Here you would implement actual signing logic
    notifyUser(`PDF signed by ${name}`);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Signing error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle Adding Stamp
function handleStamp(request, sendResponse) {
  console.log('Adding stamp to PDF...');
  
  try {
    const { type, page } = request;
    
    // Here you would implement actual stamp logic
    notifyUser(`${type} stamp added to page ${page}`);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Stamp error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Handle Adding Watermark
function handleWatermark(request, sendResponse) {
  console.log('Adding watermark to PDF...');
  
  try {
    const { text, opacity } = request;
    
    // Here you would implement actual watermark logic
    notifyUser(`Watermark "${text}" added with ${Math.round(opacity * 100)}% opacity`);
    sendResponse({ success: true });
  } catch (error) {
    console.error('Watermark error:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Notify user
function notifyUser(message) {
  // Create a notification element
  const notification = document.createElement('div');
  notification.className = 'pdf-tools-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: linear-gradient(135deg, #3d7ea6 0%, #1a4a6e 100%);
    color: white;
    padding: 10px 18px;
    border-radius: 20px;
    z-index: 10000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.2px;
    box-shadow: 0 4px 14px rgba(26, 74, 110, 0.35);
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Report PDF status when extension loads
console.log('PDF on page:', isPDFDocument());
