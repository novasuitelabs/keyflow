# Changelog

All notable changes to KeyFlow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-13

### 🔒 Security (CRITICAL FIXES)

#### Fixed
- **[CRITICAL]** Implemented proper AES-256-GCM encryption for all password storage
  - Previously passwords were stored in **plain text** - now fully encrypted
  - Uses Web Crypto API for industry-standard encryption
  - All sensitive data encrypted before storage
- **[CRITICAL]** Replaced insecure Base64 encoding with PBKDF2 password hashing
  - Master password now properly hashed with 100,000 iterations
  - Salt generation using cryptographically secure random values
  - Password verification using constant-time comparison
- **[SECURITY]** Master password now cleared from memory when vault locks
  - Reduces risk of memory-based attacks
  - Automatic cleanup on auto-lock and manual lock

### ✨ Added

#### Features
- **Edit Password Functionality**
  - Full edit capability for saved passwords
  - Updates last changed timestamp
  - Preserves metadata (favorites, tags, creation date)
  - Edit button with pencil icon on each password entry
- **Delete Password Functionality**
  - Confirmation dialog before deletion
  - Secure deletion with re-encryption of vault
  - Delete button with trash icon on each password entry
- **Password Update Detection** (Content Script)
  - Detects when credentials change on websites
  - Prompts to update existing passwords
  - Smart domain matching for update suggestions
- **Enhanced Error Handling**
  - User-friendly error messages throughout
  - Loading states for async operations
  - Proper error recovery and fallbacks
  - Input validation on all forms

#### UI/UX Improvements
- Loading indicators during encryption/decryption
- Better visual feedback for edit/delete actions
- Enhanced password display with action buttons
- Improved button styling and hover states
- CSS styling for new edit/delete buttons
- Delete button with red accent color

### 🛠️ Changed

#### Build System
- **Cross-Platform Build Scripts**
  - Replaced Windows-specific commands (copy, PowerShell)
  - Created Node.js-based post-build script
  - Works on Windows, macOS, and Linux
  - Proper error handling in build process
- **Simplified Build Commands**
  - `npm run build` now handles everything
  - Automatic file copying to public directory
  - Better build output and error reporting

#### Code Quality
- Removed all `console.log` statements from production code
- Removed `console.error` and `console.warn` from background script
- Removed mock data from production builds
- Cleaned up commented code
- Improved code organization and readability

#### Documentation
- Updated README with comprehensive security information
- Added detailed encryption specifications
- Documented keyboard shortcuts
- Improved build instructions for all platforms
- Added feature list with all new capabilities
- Updated installation instructions

### 🐛 Fixed
- Master password verification now uses proper crypto verification
- Export feature now verifies master password correctly
- Import feature now uses encrypted storage
- All password operations now use encryption
- Build scripts work on all operating systems
- Proper cleanup of sensitive data from memory

### 📚 Technical Details

#### Encryption Implementation
- **Algorithm**: AES-256-GCM (Galois/Counter Mode)
- **Key Derivation**: PBKDF2 with SHA-256
- **Iterations**: 100,000 (OWASP recommended minimum)
- **IV Generation**: Cryptographically secure random (12 bytes for GCM)
- **Salt**: 32 bytes of cryptographically secure random data

#### Storage Architecture
- All passwords encrypted before storage
- Encryption key derived from master password
- Salt and hash stored separately
- No plaintext passwords ever written to storage

#### Security Improvements Summary
1. Plain text storage → AES-256-GCM encryption
2. Base64 encoding → PBKDF2 key derivation
3. Weak password verification → Cryptographic verification
4. No memory cleanup → Automatic master password cleanup
5. No input validation → Comprehensive validation

### 🔧 Developer Notes

#### Breaking Changes
- **Storage Format Changed**: Passwords now encrypted - old plain text data incompatible
- **Master Password Hash Changed**: New setup required if upgrading from pre-1.0.0
- Users must re-create their vault and re-enter passwords

#### Migration Guide
For users upgrading from development versions:
1. Export your passwords (if you have a pre-1.0.0 version with export)
2. Install new version
3. Create new master password
4. Import passwords manually

#### Build Requirements
- Node.js 18.x or higher
- npm 9.x or higher
- Modern browser for testing

### 📊 Statistics
- Files modified: 10+
- Security issues fixed: 3 critical
- Features added: 4 major
- Code cleanup: Removed 30+ console.logs
- Documentation: Updated 5 files

### 🙏 Acknowledgments
Special thanks to the security research community for best practices in password management and encryption.

---

## Previous Versions

### [0.9.0] - Pre-release
- Initial development version
- **WARNING**: Had critical security vulnerabilities
- **NOT RECOMMENDED**: Plain text password storage
- Superseded by 1.0.0

---

**Note**: Version 1.0.0 is the first production-ready release with proper security implementation. All previous versions should not be used in production.
