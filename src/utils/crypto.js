// KeyFlow Encryption Utilities
// Uses Web Crypto API for secure local encryption

class KeyFlowCrypto {
  constructor() {
    this.algorithm = 'AES-GCM';
    this.keyLength = 256;
    this.ivLength = 12; // 96 bits for GCM
  }

  /**
   * Derives encryption key from master password using PBKDF2
   */
  async deriveKey(masterPassword, salt) {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(masterPassword),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000, // OWASP recommended minimum
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: this.algorithm, length: this.keyLength },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Generates random salt for key derivation
   */
  generateSalt() {
    return crypto.getRandomValues(new Uint8Array(32));
  }

  /**
   * Generates random IV for encryption
   */
  generateIV() {
    return crypto.getRandomValues(new Uint8Array(this.ivLength));
  }

  /**
   * Encrypts data with derived key
   */
  async encrypt(data, key) {
    const encoder = new TextEncoder();
    const iv = this.generateIV();
    
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: this.algorithm,
        iv: iv
      },
      key,
      encoder.encode(JSON.stringify(data))
    );

    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);

    return this.arrayBufferToBase64(combined.buffer);
  }

  /**
   * Decrypts data with derived key
   */
  async decrypt(encryptedData, key) {
    try {
      const combined = this.base64ToArrayBuffer(encryptedData);
      const iv = combined.slice(0, this.ivLength);
      const data = combined.slice(this.ivLength);

      const decryptedData = await crypto.subtle.decrypt(
        {
          name: this.algorithm,
          iv: iv
        },
        key,
        data
      );

      const decoder = new TextDecoder();
      return JSON.parse(decoder.decode(decryptedData));
    } catch (error) {
      throw new Error('Decryption failed - invalid password or corrupted data');
    }
  }

  /**
   * Hashes master password for verification
   */
  async hashPassword(password, salt) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );

    return this.arrayBufferToBase64(hashBuffer);
  }

  /**
   * Generates secure password
   */
  generatePassword(length = 16, options = {}) {
    const defaults = {
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true // Exclude 0, O, l, I, etc.
    };
    
    const settings = { ...defaults, ...options };
    
    let charset = '';
    if (settings.includeLowercase) {
      charset += settings.excludeSimilar ? 'abcdefghijkmnopqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
    }
    if (settings.includeUppercase) {
      charset += settings.excludeSimilar ? 'ABCDEFGHJKLMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    }
    if (settings.includeNumbers) {
      charset += settings.excludeSimilar ? '23456789' : '0123456789';
    }
    if (settings.includeSymbols) {
      charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    }

    if (charset === '') {
      throw new Error('At least one character type must be selected');
    }

    let password = '';
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      password += charset[array[i] % charset.length];
    }

    return password;
  }

  /**
   * Converts ArrayBuffer to Base64 string
   */
  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  /**
   * Converts Base64 string to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  /**
   * Validates password strength
   */
  checkPasswordStrength(password) {
    const checks = {
      length: password.length >= 12,
      hasLower: /[a-z]/.test(password),
      hasUpper: /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      notCommon: !this.isCommonPassword(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    let strength = 'weak';
    
    if (score >= 5) strength = 'strong';
    else if (score >= 3) strength = 'medium';

    return {
      score,
      strength,
      checks,
      suggestions: this.getPasswordSuggestions(checks)
    };
  }

  /**
   * Check if password is in common passwords list (simplified)
   */
  isCommonPassword(password) {
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey'
    ];
    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Get password improvement suggestions
   */
  getPasswordSuggestions(checks) {
    const suggestions = [];
    
    if (!checks.length) suggestions.push('Use at least 12 characters');
    if (!checks.hasLower) suggestions.push('Add lowercase letters');
    if (!checks.hasUpper) suggestions.push('Add uppercase letters');
    if (!checks.hasNumber) suggestions.push('Add numbers');
    if (!checks.hasSymbol) suggestions.push('Add special characters');
    if (!checks.notCommon) suggestions.push('Avoid common passwords');

    return suggestions;
  }
}

// Storage utilities for Chrome extension
export class KeyFlowStorage {
  constructor(crypto) {
    this.crypto = crypto;
    this.storageKey = 'keyflow_vault';
    this.saltKey = 'keyflow_salt';
    this.hashKey = 'keyflow_hash';
  }

  /**
   * Initialize vault with master password
   */
  async initializeVault(masterPassword) {
    const salt = this.crypto.generateSalt();
    const passwordHash = await this.crypto.hashPassword(masterPassword, salt);
    
    // Store salt and password hash
    await chrome.storage.local.set({
      [this.saltKey]: this.crypto.arrayBufferToBase64(salt.buffer),
      [this.hashKey]: passwordHash,
      [this.storageKey]: null // Empty vault
    });

    return true;
  }

  /**
   * Verify master password
   */
  async verifyPassword(masterPassword) {
    const result = await chrome.storage.local.get([this.saltKey, this.hashKey]);
    
    if (!result[this.saltKey] || !result[this.hashKey]) {
      throw new Error('Vault not initialized');
    }

    const salt = this.crypto.base64ToArrayBuffer(result[this.saltKey]);
    const storedHash = result[this.hashKey];
    const inputHash = await this.crypto.hashPassword(masterPassword, salt);

    return inputHash === storedHash;
  }

  /**
   * Save encrypted passwords
   */
  async savePasswords(passwords, masterPassword) {
    const result = await chrome.storage.local.get([this.saltKey]);
    const salt = this.crypto.base64ToArrayBuffer(result[this.saltKey]);
    
    const key = await this.crypto.deriveKey(masterPassword, salt);
    const encryptedData = await this.crypto.encrypt(passwords, key);
    
    await chrome.storage.local.set({
      [this.storageKey]: encryptedData
    });

    return true;
  }

  /**
   * Load and decrypt passwords
   */
  async loadPasswords(masterPassword) {
    const result = await chrome.storage.local.get([this.saltKey, this.storageKey]);
    
    if (!result[this.storageKey]) {
      return []; // Empty vault
    }

    const salt = this.crypto.base64ToArrayBuffer(result[this.saltKey]);
    const key = await this.crypto.deriveKey(masterPassword, salt);
    
    return await this.crypto.decrypt(result[this.storageKey], key);
  }

  /**
   * Check if vault exists
   */
  async vaultExists() {
    const result = await chrome.storage.local.get([this.saltKey, this.hashKey]);
    return !!(result[this.saltKey] && result[this.hashKey]);
  }

  /**
   * Clear all vault data
   */
  async clearVault() {
    await chrome.storage.local.remove([this.saltKey, this.hashKey, this.storageKey]);
    return true;
  }
}

// Export instances
export const keyflowCrypto = new KeyFlowCrypto();
export const keyflowStorage = new KeyFlowStorage(keyflowCrypto);