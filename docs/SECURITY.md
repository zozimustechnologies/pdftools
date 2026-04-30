# PDF Tools - Security Policy

## 🔐 Security Overview

PDF Tools is designed with security as a core principle. All PDF processing happens locally in your browser—no data is sent to external servers.

## Data Privacy

### What We Collect
- **None by default** - Extension does not collect personal data
- **Optional Analytics** - Only if explicitly enabled in settings
- **Crash Reports** - Only if crash reporting is enabled

### What We Don't Collect
- PDF file contents
- User passwords
- Encryption keys
- Browsing history
- Personal information

## Local Processing

All PDF operations are performed locally:
- ✅ Encryption/Decryption
- ✅ Compression
- ✅ Merging and splitting
- ✅ Signature generation
- ✅ Watermarking

**No data leaves your computer.**

## Encryption Standards

### Algorithms Supported
- **AES-256** (Recommended) - 256-bit Advanced Encryption Standard
- **AES-128** - 128-bit Advanced Encryption Standard
- **RC4** - Legacy support (not recommended)

### Password Requirements
For strong encryption:
- Minimum 8 characters (12+ recommended)
- Mix of uppercase and lowercase letters
- Include numbers and special characters
- Avoid dictionary words and personal information

## Permissions Explanation

### Required Permissions
- `activeTab` - Process the current tab's PDFs
- `scripting` - Execute scripts for PDF processing
- `storage` - Store user preferences and settings
- `webRequest` - Monitor PDF downloads

### Host Permissions
- `file:///*` - Access local PDF files
- `http://*/*` - Process PDFs over HTTP
- `https://*/*` - Process PDFs over HTTPS

## Vulnerability Reporting

### Security Issues
If you discover a security vulnerability, please email:
**security@zozimus.com**

**Please do not open public issues for security vulnerabilities.**
Zozimus Technologies takes security seriously and will respond within 24 hours.

### Reporting Process
1. Email details of the vulnerability
2. Include reproduction steps if possible
3. Allow 48 hours for initial response
4. Coordinate disclosure timeline
5. Receive credit upon publication (if desired)

## Best Security Practices

### For Users
1. **Strong Passwords** - Use 12+ character passwords with mixed character types
2. **Don't Reuse Passwords** - Use unique passwords for important PDFs
3. **Verify Certificates** - Check website SSL certificates when downloading PDFs
4. **Keep Updated** - Install extension updates promptly
5. **Clear Cache** - Regularly clear cached data from settings
6. **Review Permissions** - Check extension permissions in your browser's extensions page

### For PDF Sensitive Data
1. Use AES-256 encryption for sensitive documents
2. Set strong owner passwords for permission restrictions
3. Add timestamps to signatures for legal validity
4. Use watermarks to identify confidential documents
5. Keep backup copies of encryption passwords

## Security Audits

PDF Tools undergoes regular security reviews:
- **Static Code Analysis** - Regular code scanning for vulnerabilities
- **Dependency Updates** - Security updates for all libraries
- **User Audits** - Community security review welcome

## Compliance

### Standards Compliance
- **Manifest V3** - Latest browser extension security standards
- **Content Security Policy** - Strict CSP enforcement
- **Secure Coding** - OWASP Top 10 considerations

### Data Protection
- **GDPR Compliant** - Respects user privacy rights
- **CCPA Compliant** - California privacy law compliance
- **No Data Retention** - PDFs not stored after processing

## Known Limitations

1. **Browser Offline** - Some features require internet connection
2. **Large Files** - Performance may degrade with files >100MB
3. **Corrupted PDFs** - Cannot process severely corrupted PDFs
4. **DRM PDFs** - Cannot process DRM-protected PDFs
5. **Memory** - Very large PDFs may cause browser slowdown

## Security Updates

### Version Updates
- Monthly security patches
- Quarterly feature releases
- Emergency updates for critical vulnerabilities

### How to Stay Updated
1. Enable automatic extension updates (default)
2. Check the extension store for the latest version
3. Review release notes for security changes

## Third-Party Libraries Security

### Library Versions
- **PDF-lib** - Latest security patches applied
- **PDF.js** - Mozilla maintained
- **Crypto-JS** - Community reviewed

### Library Audits
All dependencies are audited for known vulnerabilities using:
- npm audit
- Snyk scanning
- Manual code review

## Support

For security questions or concerns:
- Email: **security@zozimus.com**
- Phone: +1-XXX-XXX-XXXX (Enterprise)
- GitHub: [Security Issues](https://github.com/zozimus-tech/pdftools/security)
- Documentation: [README.md](../README.md)
- Enterprise Support: contact@zozimus.com

---

**Last Updated:** April 21, 2026
**Version:** 1.0.0
**Maintained by:** Zozimus Technologies
