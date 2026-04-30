// PDF Utilities - Helper functions for PDF operations
class PDFUtils {
  // Check if file is a PDF
  static isPDF(file) {
    return file.type === 'application/pdf' || file.name.endsWith('.pdf');
  }

  // Get file size in MB
  static getFileSizeInMB(sizeInBytes) {
    return (sizeInBytes / (1024 * 1024)).toFixed(2);
  }

  // Format file size for display
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Download file to user's computer
  static downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Generate unique filename
  static generateFilename(originalName, suffix) {
    const timestamp = new Date().toISOString().split('T')[0];
    const name = originalName.replace('.pdf', '');
    return `${name}_${suffix}_${timestamp}.pdf`;
  }

  // Create timestamp
  static getFormattedTimestamp() {
    const now = new Date();
    return now.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}

// Encryption Utilities
class EncryptionUtils {
  // Simple password hash (for UI purposes)
  static hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16);
  }

  // Check password strength
  static getPasswordStrength(password) {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    
    const levels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    return {
      score: strength,
      label: levels[strength] || 'Very Weak'
    };
  }

  // Generate random password
  static generateRandomPassword(length = 16) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }
}

// Storage Utilities
class StorageUtils {
  // Save to local storage
