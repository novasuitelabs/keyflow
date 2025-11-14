import React, { useState, useEffect } from 'react';
import { Lock, Plus, Eye, EyeOff, Copy, Settings, Search, Edit2, Trash2 } from 'lucide-react';
import { keyflowCrypto, keyflowStorage } from '../utils/crypto.js';

const KeyFlowPopup = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [currentMasterPassword, setCurrentMasterPassword] = useState(''); // Store decrypted password in memory
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPassword, setEditingPassword] = useState(null); // For edit functionality
  const [newPassword, setNewPassword] = useState({
    site: '',
    username: '',
    password: '',
    url: '',
    notes: '',
    tags: [],
    isFavorite: false,
    lastUsed: null,
    createdAt: null,
    lastChanged: null
  });
  const [showPasswords, setShowPasswords] = useState({});
  const [lockTimer, setLockTimer] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showLockWarning, setShowLockWarning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Setup and onboarding states
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [setupStep, setSetupStep] = useState(0); // 0: welcome, 1: password setup, 2: confirm password, 3: tour
  const [newMasterPassword, setNewMasterPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  // Phase 1 features
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Enhanced Password Generator
  const [showPasswordGenerator, setShowPasswordGenerator] = useState(false);
  const [generatorSettings, setGeneratorSettings] = useState({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeAmbiguous: false,
    type: 'random' // 'random', 'pronounceable', 'passphrase'
  });

  // Password Health & Security
  const [showSecurityDashboard, setShowSecurityDashboard] = useState(false);
  const [passwordHealth, setPasswordHealth] = useState({
    duplicates: [],
    weak: [],
    old: [],
    score: 0
  });

  // Better Search & Organization  
  const [favorites, setFavorites] = useState([]);
  const [recentPasswords, setRecentPasswords] = useState([]);
  const [sortBy, setSortBy] = useState('name'); // 'name', 'dateAdded', 'lastUsed'
  const [fuzzySearchEnabled, setFuzzySearchEnabled] = useState(true);

  // Import/Export System
  const [showImportExport, setShowImportExport] = useState(false);
  const [exportConfirmation, setExportConfirmation] = useState(false);
  const [exportPasswordVerification, setExportPasswordVerification] = useState('');
  const [importData, setImportData] = useState('');
  const [importPreview, setImportPreview] = useState(null);
  const [importConfirmation, setImportConfirmation] = useState(false);

  // Auto-lock settings (in minutes)
  const AUTO_LOCK_TIME = 5; // 5 minutes
  const WARNING_TIME = 30; // 30 seconds warning

  // Check vault status on component mount
  useEffect(() => {
    checkInitialSetup();
    initializeDarkMode();
    setupKeyboardShortcuts();
  }, []);

  // Initialize dark mode from system preference or saved setting
  const initializeDarkMode = async () => {
    try {
      const result = await chrome.storage.local.get(['darkMode']);
      if (result.darkMode !== undefined) {
        setIsDarkMode(result.darkMode);
      } else {
        // Auto-detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setIsDarkMode(prefersDark);
      }
    } catch (error) {
      console.error('Failed to initialize dark mode:', error);
    }
  };

  // Setup keyboard shortcuts
  const setupKeyboardShortcuts = () => {
    const handleKeyboard = (e) => {
      // Don't trigger if user is typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        // Allow Enter to copy in password display
        if (e.key === 'Enter' && e.target.classList.contains('password-field')) {
          const passwordText = e.target.value;
          copyToClipboard(passwordText);
          return;
        }
        return;
      }

      // Ctrl+K for search focus
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        setShowAddForm(false);
        setShowSettings(false);
        setShowTour(false);
      }

      // Ctrl+N for new password
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        if (!isLocked) {
          setShowAddForm(true);
          resetAutoLockTimer();
        }
      }
    };

    document.addEventListener('keydown', handleKeyboard);
    return () => document.removeEventListener('keydown', handleKeyboard);
  };

  useEffect(() => {
    // Load passwords when unlocked
    if (!isLocked) {
      loadPasswords();
      initializeAutoLockTimer();
    } else {
      clearAutoLockTimer();
      // Don't clear timer from storage when locked - let it persist
      // Only clear when time actually expires
    }
  }, [isLocked]);

  // Analyze password health when passwords change
  useEffect(() => {
    if (passwords.length > 0) {
      analyzePasswordHealth();
      
      // Update favorites and recent lists
      const favoriteIds = passwords.filter(p => p.isFavorite).map(p => p.id);
      setFavorites(favoriteIds);
      
      const recentIds = passwords
        .filter(p => p.lastUsed)
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
        .slice(0, 5)
        .map(p => p.id);
      setRecentPasswords(recentIds);
    }
  }, [passwords]);

  // Check if this is the first time using KeyFlow
  const checkInitialSetup = async () => {
    try {
      const vaultExists = await keyflowStorage.vaultExists();

      if (!vaultExists) {
        // First time user - show setup flow
        setIsFirstTime(true);
        setSetupStep(0);
        setIsLocked(true);
      } else {
        // Existing user - check vault status
        setIsFirstTime(false);
        checkVaultStatus();
      }
    } catch (error) {
      setError('Failed to check vault status');
      setIsFirstTime(true); // Default to setup if error
    }
  };

  // Check if vault should already be unlocked
  const checkVaultStatus = async () => {
    try {
      const result = await chrome.storage.local.get(['autoLockTimer']);
      const timerData = result.autoLockTimer;
      
      if (timerData && timerData.unlockTime) {
        const now = Date.now();
        const elapsed = (now - timerData.unlockTime) / 1000; // seconds elapsed
        const remaining = (AUTO_LOCK_TIME * 60) - elapsed;
        
        if (remaining > 0) {
          // Vault should still be unlocked
          setIsLocked(false);
        } else {
          // Time expired, ensure vault is locked and clear timer
          setIsLocked(true);
          chrome.storage.local.remove(['autoLockTimer']);
        }
      } else {
        // No timer data, vault should be locked
        setIsLocked(true);
      }
    } catch (error) {
      console.error('Failed to check vault status:', error);
      // Default to locked on error
      setIsLocked(true);
    }
  };

  // Initialize timer from storage or start new one
  const initializeAutoLockTimer = async () => {
    try {
      const result = await chrome.storage.local.get(['autoLockTimer']);
      const timerData = result.autoLockTimer;
      
      if (timerData && timerData.unlockTime) {
        const now = Date.now();
        const elapsed = (now - timerData.unlockTime) / 1000; // seconds elapsed
        const remaining = (AUTO_LOCK_TIME * 60) - elapsed;
        
        if (remaining > 0) {
          // Resume timer with remaining time
          resumeAutoLockTimer(remaining);
        } else {
          // Time already expired, auto-lock
          autoLock();
        }
      } else {
        // Start fresh timer
        startAutoLockTimer();
      }
    } catch (error) {
      console.error('Failed to initialize timer:', error);
      startAutoLockTimer(); // Fallback to fresh timer
    }
  };

  // Resume timer with specific remaining time
  const resumeAutoLockTimer = (remainingSeconds) => {
    clearAutoLockTimer();
    setTimeRemaining(Math.floor(remainingSeconds));
    
    if (remainingSeconds <= WARNING_TIME) {
      setShowLockWarning(true);
    }
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        if (newTime === WARNING_TIME) {
          setShowLockWarning(true);
        }
        
        if (newTime <= 0) {
          autoLock();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    setLockTimer(timer);
  };

  // Start auto-lock timer
  const startAutoLockTimer = () => {
    clearAutoLockTimer(); // Clear any existing timer
    
    const totalTime = AUTO_LOCK_TIME * 60; // Convert to seconds
    setTimeRemaining(totalTime);
    
    // Store unlock time in storage for persistence
    const unlockTime = Date.now();
    chrome.storage.local.set({
      autoLockTimer: { unlockTime }
    });
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        const newTime = prev - 1;
        
        // Show warning when approaching lock time
        if (newTime === WARNING_TIME) {
          setShowLockWarning(true);
        }
        
        // Auto-lock when time is up
        if (newTime <= 0) {
          autoLock();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);
    
    setLockTimer(timer);
  };

  // Clear auto-lock timer
  const clearAutoLockTimer = () => {
    if (lockTimer) {
      clearInterval(lockTimer);
      setLockTimer(null);
    }
    setTimeRemaining(0);
    setShowLockWarning(false);
  };

  // Auto-lock the vault
  const autoLock = (clearStorage = true) => {
    setIsLocked(true);
    setCurrentMasterPassword(''); // Clear master password from memory
    setShowPasswords({});
    setShowAddForm(false);
    setSearchTerm('');
    setEditingPassword(null);
    clearAutoLockTimer();

    // Only clear storage when timer actually expires
    if (clearStorage) {
      chrome.storage.local.remove(['autoLockTimer']);
    }
  };

  // Reset auto-lock timer on user activity
  const resetAutoLockTimer = () => {
    if (!isLocked) {
      startAutoLockTimer();
      setShowLockWarning(false);
    }
  };

  // Setup flow functions
  const handleSetupNext = () => {
    if (setupStep === 0) {
      setSetupStep(1);
    } else if (setupStep === 1) {
      if (newMasterPassword.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
      }
      setSetupStep(2);
    } else if (setupStep === 2) {
      if (newMasterPassword !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }
      completeSetup();
    }
  };

  const completeSetup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Initialize vault with proper encryption
      await keyflowStorage.initializeVault(newMasterPassword);

      // Store master password in memory
      setCurrentMasterPassword(newMasterPassword);

      // Start tour
      setIsFirstTime(false);
      setIsLocked(false);
      setShowTour(true);
      setTourStep(0);
      setNewMasterPassword('');
      setConfirmPassword('');
    } catch (error) {
      setError('Setup failed. Please try again.');
      alert('Setup failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Tour functions
  const nextTourStep = () => {
    if (tourStep < 4) {
      setTourStep(tourStep + 1);
    } else {
      setShowTour(false);
    }
  };

  const skipTour = () => {
    setShowTour(false);
  };

  // Dark mode toggle
  const toggleDarkMode = async () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    try {
      await chrome.storage.local.set({ darkMode: newDarkMode });
    } catch (error) {
      console.error('Failed to save dark mode preference:', error);
    }
  };

  // Predefined tags
  const availableTags = ['Work', 'Personal', 'Banking', 'Social', 'Shopping', 'Gaming'];

  const toggleTag = (tag) => {
    const currentTags = newPassword.tags || [];
    const updatedTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setNewPassword({...newPassword, tags: updatedTags});
  };

  // Password Health & Security Functions
  const analyzePasswordHealth = () => {
    const duplicates = findDuplicatePasswords();
    const weak = findWeakPasswords();
    const old = findOldPasswords();
    const score = calculateSecurityScore(duplicates, weak, old);
    
    setPasswordHealth({ duplicates, weak, old, score });
  };

  const findDuplicatePasswords = () => {
    const passwordMap = {};
    const duplicates = [];
    
    passwords.forEach(password => {
      if (passwordMap[password.password]) {
        if (!duplicates.find(d => d.password === password.password)) {
          duplicates.push({
            password: password.password,
            sites: [passwordMap[password.password].site, password.site],
            count: 2
          });
        } else {
          const existing = duplicates.find(d => d.password === password.password);
          existing.sites.push(password.site);
          existing.count++;
        }
      } else {
        passwordMap[password.password] = password;
      }
    });
    
    return duplicates;
  };

  const findWeakPasswords = () => {
    return passwords.filter(password => {
      const pwd = password.password;
      if (pwd.length < 8) return true;
      if (!/[A-Z]/.test(pwd)) return true;
      if (!/[a-z]/.test(pwd)) return true;
      if (!/[0-9]/.test(pwd)) return true;
      if (!/[^A-Za-z0-9]/.test(pwd)) return true;
      
      // Common patterns
      const commonPatterns = ['123456', 'password', 'qwerty', 'abc123'];
      if (commonPatterns.some(pattern => pwd.toLowerCase().includes(pattern))) return true;
      
      return false;
    });
  };

  const findOldPasswords = () => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    return passwords.filter(password => {
      const lastChanged = password.lastChanged ? new Date(password.lastChanged) : new Date(password.createdAt);
      return lastChanged < sixMonthsAgo;
    });
  };

  const calculateSecurityScore = (duplicates, weak, old) => {
    const totalPasswords = passwords.length;
    if (totalPasswords === 0) return 100;
    
    const duplicateCount = duplicates.reduce((sum, dup) => sum + dup.count, 0);
    const weakCount = weak.length;
    const oldCount = old.length;
    
    const score = Math.max(0, 100 - (
      (duplicateCount / totalPasswords) * 40 +
      (weakCount / totalPasswords) * 40 +
      (oldCount / totalPasswords) * 20
    ));
    
    return Math.round(score);
  };

  // Save passwords with encryption
  const savePasswordsEncrypted = async (updatedPasswords) => {
    try {
      if (!currentMasterPassword) {
        throw new Error('Master password not available');
      }
      await keyflowStorage.savePasswords(updatedPasswords, currentMasterPassword);
      setPasswords(updatedPasswords);
    } catch (error) {
      setError('Failed to save passwords');
      throw error;
    }
  };

  // Favorites and Recent Functions
  const toggleFavorite = async (passwordId) => {
    try {
      const updatedPasswords = passwords.map(p =>
        p.id === passwordId ? { ...p, isFavorite: !p.isFavorite } : p
      );
      await savePasswordsEncrypted(updatedPasswords);

      // Update favorites list
      const newFavorites = updatedPasswords.filter(p => p.isFavorite).map(p => p.id);
      setFavorites(newFavorites);
    } catch (error) {
      alert('Failed to update favorite');
    }
  };

  const markAsUsed = async (passwordId) => {
    try {
      const now = new Date().toISOString();
      const updatedPasswords = passwords.map(p =>
        p.id === passwordId ? { ...p, lastUsed: now } : p
      );
      await savePasswordsEncrypted(updatedPasswords);

      // Update recent passwords (last 5 used)
      const recent = updatedPasswords
        .filter(p => p.lastUsed)
        .sort((a, b) => new Date(b.lastUsed) - new Date(a.lastUsed))
        .slice(0, 5)
        .map(p => p.id);
      setRecentPasswords(recent);
    } catch (error) {
      // Silent fail for usage tracking
    }
  };

  // Delete password function
  const deletePassword = async (passwordId) => {
    try {
      if (!confirm('Are you sure you want to delete this password?')) {
        return;
      }

      const updatedPasswords = passwords.filter(p => p.id !== passwordId);
      await savePasswordsEncrypted(updatedPasswords);
      alert('Password deleted successfully');
    } catch (error) {
      alert('Failed to delete password');
    }
  };

  // Edit password function
  const startEditPassword = (password) => {
    setEditingPassword(password.id);
    setNewPassword({
      site: password.site || '',
      username: password.username || '',
      password: password.password || '',
      url: password.url || '',
      notes: password.notes || '',
      tags: password.tags || [],
      isFavorite: password.isFavorite || false,
      lastUsed: password.lastUsed,
      createdAt: password.createdAt,
      lastChanged: password.lastChanged
    });
    setShowAddForm(true);
    resetAutoLockTimer();
  };

  const saveEditedPassword = async () => {
    try {
      const updatedPasswords = passwords.map(p =>
        p.id === editingPassword
          ? {
              ...p,
              ...newPassword,
              lastChanged: new Date().toISOString()
            }
          : p
      );
      await savePasswordsEncrypted(updatedPasswords);
      setShowAddForm(false);
      setEditingPassword(null);
      setNewPassword({
        site: '', username: '', password: '', url: '', notes: '', tags: [],
        isFavorite: false, lastUsed: null, createdAt: null, lastChanged: null
      });
      alert('Password updated successfully');
    } catch (error) {
      alert('Failed to update password');
    }
  };

  // Import/Export Functions
  const exportPasswords = async () => {
    try {
      // First security layer: Confirmation dialog
      if (!exportConfirmation) {
        setExportConfirmation(true);
        return;
      }

      // Second security layer: Master password verification
      if (exportPasswordVerification === '') {
        alert('Please enter your master password to export data.');
        return;
      }

      // Verify master password using crypto
      const isValid = await keyflowStorage.verifyPassword(exportPasswordVerification);

      if (!isValid) {
        alert('Incorrect master password. Export cancelled.');
        setExportPasswordVerification('');
        setExportConfirmation(false);
        return;
      }

      // Create export data
      const exportData = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        passwords: passwords,
        settings: {
          darkMode: isDarkMode,
          generatorSettings: generatorSettings
        }
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `keyflow-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Reset states
      setExportPasswordVerification('');
      setExportConfirmation(false);
      setShowImportExport(false);
      
      alert('Export completed successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    }
  };

  const importPasswords = async () => {
    try {
      if (!importData.trim()) {
        alert('Please paste or upload import data.');
        return;
      }

      // Parse and validate import data
      let parsedData;
      try {
        parsedData = JSON.parse(importData);
      } catch (error) {
        alert('Invalid JSON format. Please check your import data.');
        return;
      }

      // Validate data structure
      if (!parsedData.passwords || !Array.isArray(parsedData.passwords)) {
        alert('Invalid import format. Missing passwords array.');
        return;
      }

      // Show preview
      setImportPreview(parsedData);
      setImportConfirmation(true);
    } catch (error) {
      console.error('Import preview failed:', error);
      alert('Failed to process import data. Please check the format.');
    }
  };

  const confirmImport = async () => {
    try {
      if (!importPreview) return;

      // Merge passwords (avoid duplicates by ID)
      const existingIds = new Set(passwords.map(p => p.id));
      const newPasswords = importPreview.passwords.filter(p => !existingIds.has(p.id));

      const mergedPasswords = [...passwords, ...newPasswords];

      // Update storage with encryption
      await savePasswordsEncrypted(mergedPasswords);

      // Import settings if available
      if (importPreview.settings) {
        if (importPreview.settings.darkMode !== undefined) {
          setIsDarkMode(importPreview.settings.darkMode);
          await chrome.storage.local.set({ darkMode: importPreview.settings.darkMode });
        }
        if (importPreview.settings.generatorSettings) {
          setGeneratorSettings(importPreview.settings.generatorSettings);
        }
      }

      // Reset states
      setImportData('');
      setImportPreview(null);
      setImportConfirmation(false);
      setShowImportExport(false);

      alert(`Import completed! Added ${newPasswords.length} new passwords.`);
    } catch (error) {
      console.error('Import failed:', error);
      alert('Import failed. Please try again.');
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setImportData(e.target.result);
    };
    reader.readAsText(file);
  };

  // Format time remaining for display
  const formatTimeRemaining = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const loadPasswords = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!currentMasterPassword) {
        setPasswords([]);
        return;
      }

      // Load and decrypt passwords
      const decryptedPasswords = await keyflowStorage.loadPasswords(currentMasterPassword);
      setPasswords(decryptedPasswords || []);
    } catch (error) {
      setError('Failed to load passwords');
      setPasswords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!masterPassword) {
        alert('Please enter your master password');
        return;
      }

      // Verify master password using crypto
      const isValid = await keyflowStorage.verifyPassword(masterPassword);

      if (isValid) {
        // Store master password in memory for encryption/decryption
        setCurrentMasterPassword(masterPassword);
        setIsLocked(false);
        setMasterPassword('');
      } else {
        setError('Invalid master password');
        alert('Invalid master password');
      }
    } catch (error) {
      setError('Failed to unlock vault');
      alert('Failed to unlock vault: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Manual lock function
  const handleLock = () => {
    autoLock(false); // Don't clear storage when manually locking
  };

  // Enhanced Password Generator Functions
  const generatePassword = () => {
    let generatedPassword;
    
    switch (generatorSettings.type) {
      case 'pronounceable':
        generatedPassword = generatePronounceablePassword();
        break;
      case 'passphrase':
        generatedPassword = generatePassphrase();
        break;
      default:
        generatedPassword = generateRandomPassword();
    }
    
    setNewPassword({...newPassword, password: generatedPassword});
  };

  const generateRandomPassword = () => {
    let charset = '';
    
    if (generatorSettings.includeUppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (generatorSettings.includeLowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (generatorSettings.includeNumbers) charset += '0123456789';
    if (generatorSettings.includeSymbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';
    
    if (generatorSettings.excludeAmbiguous) {
      charset = charset.replace(/[0O1lI]/g, '');
    }
    
    let password = '';
    for (let i = 0; i < generatorSettings.length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  };

  const generatePronounceablePassword = () => {
    const consonants = 'bcdfghjklmnpqrstvwxyz';
    const vowels = 'aeiou';
    const numbers = '23456789';
    const symbols = '!@#$%';
    
    let password = '';
    const targetLength = generatorSettings.length;
    
    // Generate consonant-vowel pattern
    while (password.length < targetLength - 2) {
      if (password.length % 2 === 0) {
        password += consonants.charAt(Math.floor(Math.random() * consonants.length));
      } else {
        password += vowels.charAt(Math.floor(Math.random() * vowels.length));
      }
    }
    
    // Add number and symbol if enabled
    if (generatorSettings.includeNumbers && password.length < targetLength) {
      password += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    if (generatorSettings.includeSymbols && password.length < targetLength) {
      password += symbols.charAt(Math.floor(Math.random() * symbols.length));
    }
    
    // Capitalize first letter if enabled
    if (generatorSettings.includeUppercase) {
      password = password.charAt(0).toUpperCase() + password.slice(1);
    }
    
    return password.slice(0, targetLength);
  };

  const generatePassphrase = () => {
    const words = [
      'apple', 'brave', 'chair', 'dance', 'eagle', 'flame', 'grace', 'house',
      'ideal', 'juice', 'knife', 'light', 'magic', 'night', 'ocean', 'peace',
      'quick', 'river', 'storm', 'tiger', 'unity', 'voice', 'water', 'youth',
      'zebra', 'beach', 'cloud', 'dream', 'earth', 'forest', 'garden', 'happy',
      'island', 'jungle', 'kite', 'lemon', 'moon', 'nature', 'orange', 'planet',
      'queen', 'rainbow', 'sun', 'tree', 'universe', 'valley', 'wind', 'crystal'
    ];
    
    const wordCount = Math.max(4, Math.min(6, Math.floor(generatorSettings.length / 6)));
    const selectedWords = [];
    
    for (let i = 0; i < wordCount; i++) {
      const randomWord = words[Math.floor(Math.random() * words.length)];
      selectedWords.push(generatorSettings.includeUppercase && i === 0 ? 
        randomWord.charAt(0).toUpperCase() + randomWord.slice(1) : randomWord);
    }
    
    let passphrase = selectedWords.join('-');
    
    if (generatorSettings.includeNumbers) {
      passphrase += Math.floor(Math.random() * 100);
    }
    
    if (generatorSettings.includeSymbols) {
      passphrase += '!';
    }
    
    return passphrase;
  };

  const togglePasswordVisibility = (id) => {
    setShowPasswords(prev => ({...prev, [id]: !prev[id]}));
  };

  const copyToClipboard = async (text, passwordId = null) => {
    resetAutoLockTimer(); // Reset timer on user activity
    try {
      await navigator.clipboard.writeText(text);
      // Mark password as used if passwordId provided
      if (passwordId) {
        await markAsUsed(passwordId);
      }
      // Show success notification
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Enhanced Search & Filtering
  const fuzzySearch = (searchTerm, text) => {
    if (!fuzzySearchEnabled) {
      return text.toLowerCase().includes(searchTerm.toLowerCase());
    }
    
    const pattern = searchTerm.toLowerCase().split('').join('.*');
    const regex = new RegExp(pattern);
    return regex.test(text.toLowerCase());
  };

  const getSortedAndFilteredPasswords = () => {
    let filtered = passwords.filter(p => {
      if (!searchTerm) return true;
      
      return fuzzySearch(searchTerm, p.site) ||
             fuzzySearch(searchTerm, p.username) ||
             (p.notes && fuzzySearch(searchTerm, p.notes)) ||
             (p.tags && p.tags.some(tag => fuzzySearch(searchTerm, tag)));
    });

    // Sort passwords
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'dateAdded':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'lastUsed':
          const aLastUsed = a.lastUsed ? new Date(a.lastUsed) : new Date(0);
          const bLastUsed = b.lastUsed ? new Date(b.lastUsed) : new Date(0);
          return bLastUsed - aLastUsed;
        case 'name':
        default:
          return a.site.localeCompare(b.site);
      }
    });

    // Prioritize favorites
    const favoritePasswords = filtered.filter(p => p.isFavorite);
    const regularPasswords = filtered.filter(p => !p.isFavorite);
    
    return [...favoritePasswords, ...regularPasswords];
  };

  const filteredPasswords = getSortedAndFilteredPasswords();

  // Setup flow screens
  if (isFirstTime) {
    // Welcome screen
    if (setupStep === 0) {
      return (
        <div className="setup-screen">
          <div className="setup-container">
            <div className="setup-header">
              <div className="setup-icon">
                <Lock />
              </div>
              <h1 className="setup-title">Welcome to KeyFlow</h1>
              <p className="setup-subtitle">Your secure, local password manager</p>
            </div>
            
            <div className="setup-content">
              <div className="feature-list">
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <div>
                    <h3>Secure Storage</h3>
                    <p>All passwords stored locally on your device</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🚀</span>
                  <div>
                    <h3>Auto-Fill</h3>
                    <p>Instantly fill login forms across websites</p>
                  </div>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">⏰</span>
                  <div>
                    <h3>Auto-Lock</h3>
                    <p>Vault locks automatically for security</p>
                  </div>
                </div>
              </div>
              
              <button onClick={handleSetupNext} className="setup-button">
                Get Started
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Password setup screen
    if (setupStep === 1) {
      return (
        <div className="setup-screen">
          <div className="setup-container">
            <div className="setup-header">
              <div className="setup-icon">
                <Lock />
              </div>
              <h1 className="setup-title">Create Master Password</h1>
              <p className="setup-subtitle">This password will protect all your data</p>
            </div>
            
            <div className="setup-content">
              <div className="setup-form">
                <label className="setup-label">Master Password</label>
                <input
                  type="password"
                  placeholder="Enter a strong password"
                  value={newMasterPassword}
                  onChange={(e) => setNewMasterPassword(e.target.value)}
                  className="setup-input"
                />
                <div className="password-tips">
                  <p>Tips for a strong password:</p>
                  <ul>
                    <li>At least 6 characters (longer is better)</li>
                    <li>Mix of letters, numbers, and symbols</li>
                    <li>Avoid personal information</li>
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={handleSetupNext} 
                className="setup-button"
                disabled={newMasterPassword.length < 6}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      );
    }
    
    // Confirm password screen
    if (setupStep === 2) {
      return (
        <div className="setup-screen">
          <div className="setup-container">
            <div className="setup-header">
              <div className="setup-icon">
                <Lock />
              </div>
              <h1 className="setup-title">Confirm Password</h1>
              <p className="setup-subtitle">Re-enter your master password</p>
            </div>
            
            <div className="setup-content">
              <div className="setup-form">
                <label className="setup-label">Confirm Master Password</label>
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="setup-input"
                />
                
                {confirmPassword && confirmPassword !== newMasterPassword && (
                  <div className="error-message">Passwords do not match</div>
                )}
              </div>
              
              <button 
                onClick={handleSetupNext} 
                className="setup-button"
                disabled={!confirmPassword || confirmPassword !== newMasterPassword}
              >
                Complete Setup
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  if (isLocked) {
    return (
      <div className="lock-screen">
        <div className="lock-container">
          <div className="lock-header">
            <div className="lock-icon bounce-in">
              <Lock />
            </div>
            <h1 className="lock-title slide-in-down">KeyFlow</h1>
            <p className="lock-subtitle fade-in">Enter your master password</p>
          </div>
          
          <div className="lock-form slide-in-up">
            <input
              type="password"
              placeholder="Master password"
              value={masterPassword}
              onChange={(e) => setMasterPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
              className="lock-input"
            />
            <button
              onClick={handleUnlock}
              className="lock-button"
            >
              Unlock Vault
            </button>
            <p className="demo-note fade-in">Demo password: "demo"</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app ${isDarkMode ? 'dark-mode' : ''}`} onClick={resetAutoLockTimer}>
      {/* Tour Overlay */}
      {showTour && (
        <div className="tour-overlay">
          <div className="tour-content">
            {tourStep === 0 && (
              <div className="tour-step">
                <h3>🎉 Welcome to KeyFlow!</h3>
                <p>Your vault is now set up and unlocked. Let's take a quick tour to show you around!</p>
                <div className="tour-buttons">
                  <button onClick={skipTour} className="tour-skip">Skip Tour</button>
                  <button onClick={nextTourStep} className="tour-next">Start Tour</button>
                </div>
              </div>
            )}
            
            {tourStep === 1 && (
              <div className="tour-step">
                <h3>⏰ Auto-Lock Timer</h3>
                <p>This shows how much time is left before your vault locks. Click "+5min" to extend it anytime!</p>
                <div className="tour-arrow tour-arrow-timer"></div>
                <div className="tour-buttons">
                  <button onClick={skipTour} className="tour-skip">Skip</button>
                  <button onClick={nextTourStep} className="tour-next">Next</button>
                </div>
              </div>
            )}
            
            {tourStep === 2 && (
              <div className="tour-step">
                <h3>➕ Add Passwords</h3>
                <p>Click the plus button to add new passwords. They'll be stored securely and filled automatically!</p>
                <div className="tour-arrow tour-arrow-add"></div>
                <div className="tour-buttons">
                  <button onClick={skipTour} className="tour-skip">Skip</button>
                  <button onClick={nextTourStep} className="tour-next">Next</button>
                </div>
              </div>
            )}
            
            {tourStep === 3 && (
              <div className="tour-step">
                <h3>🔍 Search & Manage</h3>
                <p>Use the search bar to quickly find passwords. Click on any password to copy or view it!</p>
                <div className="tour-arrow tour-arrow-search"></div>
                <div className="tour-buttons">
                  <button onClick={skipTour} className="tour-skip">Skip</button>
                  <button onClick={nextTourStep} className="tour-next">Next</button>
                </div>
              </div>
            )}
            
            {tourStep === 4 && (
              <div className="tour-step">
                <h3>🌐 Auto-Fill Magic</h3>
                <p>Go to any login page and look for the KeyFlow icon in input fields. Click it to auto-fill your passwords!</p>
                <div className="tour-buttons">
                  <button onClick={nextTourStep} className="tour-next">Finish Tour</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Lock Warning */}
      {showLockWarning && (
        <div className="lock-warning">
          <span>⚠️ Vault will lock in {formatTimeRemaining(timeRemaining)}</span>
          <button 
            onClick={() => {
              resetAutoLockTimer();
              setShowLockWarning(false);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              marginLeft: '10px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            Stay unlocked
          </button>
        </div>
      )}
      
      {/* Header */}
      <div className="app-header">
        <div className="header-top">
          <h1 className="app-title">KeyFlow</h1>
          <div className="header-actions">
            {/* Timer Display */}
            <div className="timer-display" title="Auto-lock timer">
              <div className="timer-info">
                <span className="timer-text">{formatTimeRemaining(timeRemaining)}</span>
                <button 
                  onClick={() => {
                    resetAutoLockTimer();
                    setShowLockWarning(false);
                  }}
                  className="extend-timer-button"
                  title="Extend timer (+5 min)"
                >
                  +5min
                </button>
              </div>
              <div className="timer-progress-bar">
                <div 
                  className="timer-progress" 
                  style={{
                    width: `${(timeRemaining / (AUTO_LOCK_TIME * 60)) * 100}%`,
                    backgroundColor: timeRemaining <= WARNING_TIME ? '#ef4444' : timeRemaining <= 120 ? '#f59e0b' : '#10b981'
                  }}
                />
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                resetAutoLockTimer();
              }}
              className="header-button"
            >
              <Plus />
            </button>
            <button 
              onClick={handleLock}
              className="header-button"
              title="Lock Vault"
            >
              <Lock />
            </button>
            <button 
              onClick={() => {
                setShowSettings(!showSettings);
                resetAutoLockTimer();
              }}
              className="header-button"
              title="Settings"
            >
              <Settings />
            </button>
          </div>
        </div>
        
        <div className="search-row">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder="Search passwords..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                resetAutoLockTimer();
              }}
              className="search-input"
            />
          </div>
          
          <div className="search-controls">
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
              title="Sort by"
            >
              <option value="name">A-Z</option>
              <option value="dateAdded">Date Added</option>
              <option value="lastUsed">Last Used</option>
            </select>
            
            <button
              onClick={() => setShowSecurityDashboard(!showSecurityDashboard)}
              className={`header-button ${passwordHealth.score < 70 ? 'warning' : ''}`}
              title={`Security Score: ${passwordHealth.score}/100`}
            >
              🛡️
            </button>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel slide-in-down">
          <h3 className="form-title">⚙️ Settings</h3>
          <div className="settings-content">
            <div className="setting-item">
              <label className="setting-label">
                <span>🌙 Dark Mode</span>
                <button 
                  onClick={toggleDarkMode}
                  className={`toggle-button ${isDarkMode ? 'active' : ''}`}
                >
                  <span className="toggle-slider"></span>
                </button>
              </label>
            </div>
            
            <div className="setting-item">
              <div className="keyboard-shortcuts">
                <h4>⌨️ Keyboard Shortcuts</h4>
                <div className="shortcut-list">
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>K</kbd> <span>Focus search</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Ctrl</kbd> + <kbd>N</kbd> <span>New password</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Esc</kbd> <span>Close modals</span>
                  </div>
                  <div className="shortcut-item">
                    <kbd>Enter</kbd> <span>Copy password</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="setting-item">
              <div className="import-export-section">
                <h4>📁 Import/Export</h4>
                <div className="import-export-buttons">
                  <button
                    onClick={() => setShowImportExport(true)}
                    className="import-export-button"
                  >
                    📤 Export / 📥 Import
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Dashboard */}
      {showSecurityDashboard && (
        <div className="security-dashboard slide-in-down">
          <h3 className="form-title">🛡️ Security Dashboard</h3>
          <div className="security-content">
            <div className="security-score">
              <div className="score-circle">
                <div className={`score-value ${passwordHealth.score < 70 ? 'warning' : passwordHealth.score < 90 ? 'medium' : 'good'}`}>
                  {passwordHealth.score}
                </div>
                <div className="score-label">Security Score</div>
              </div>
            </div>
            
            <div className="security-issues">
              {passwordHealth.duplicates.length > 0 && (
                <div className="issue-item duplicate">
                  <span className="issue-icon">⚠️</span>
                  <div className="issue-info">
                    <strong>{passwordHealth.duplicates.length} Duplicate Password{passwordHealth.duplicates.length > 1 ? 's' : ''}</strong>
                    <p>Used across {passwordHealth.duplicates.reduce((sum, dup) => sum + dup.count, 0)} accounts</p>
                  </div>
                </div>
              )}
              
              {passwordHealth.weak.length > 0 && (
                <div className="issue-item weak">
                  <span className="issue-icon">🔓</span>
                  <div className="issue-info">
                    <strong>{passwordHealth.weak.length} Weak Password{passwordHealth.weak.length > 1 ? 's' : ''}</strong>
                    <p>Should be strengthened</p>
                  </div>
                </div>
              )}
              
              {passwordHealth.old.length > 0 && (
                <div className="issue-item old">
                  <span className="issue-icon">⏰</span>
                  <div className="issue-info">
                    <strong>{passwordHealth.old.length} Old Password{passwordHealth.old.length > 1 ? 's' : ''}</strong>
                    <p>Older than 6 months</p>
                  </div>
                </div>
              )}
              
              {passwordHealth.duplicates.length === 0 && passwordHealth.weak.length === 0 && passwordHealth.old.length === 0 && (
                <div className="no-issues">
                  <span className="success-icon">✅</span>
                  <p>Great job! No security issues found.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Password Generator */}
      {showPasswordGenerator && (
        <div className="password-generator slide-in-down">
          <h3 className="form-title">🎲 Password Generator</h3>
          <div className="generator-content">
            <div className="generator-type">
              <label className="form-label">Password Type</label>
              <div className="type-buttons">
                <button 
                  className={`type-button ${generatorSettings.type === 'random' ? 'active' : ''}`}
                  onClick={() => setGeneratorSettings({...generatorSettings, type: 'random'})}
                >
                  Random
                </button>
                <button 
                  className={`type-button ${generatorSettings.type === 'pronounceable' ? 'active' : ''}`}
                  onClick={() => setGeneratorSettings({...generatorSettings, type: 'pronounceable'})}
                >
                  Pronounceable
                </button>
                <button 
                  className={`type-button ${generatorSettings.type === 'passphrase' ? 'active' : ''}`}
                  onClick={() => setGeneratorSettings({...generatorSettings, type: 'passphrase'})}
                >
                  Passphrase
                </button>
              </div>
            </div>
            
            <div className="generator-options">
              <div className="option-row">
                <label className="form-label">Length: {generatorSettings.length}</label>
                <input 
                  type="range" 
                  min="8" 
                  max="50" 
                  value={generatorSettings.length}
                  onChange={(e) => setGeneratorSettings({...generatorSettings, length: parseInt(e.target.value)})}
                  className="length-slider"
                />
              </div>
              
              <div className="checkbox-grid">
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generatorSettings.includeUppercase}
                    onChange={(e) => setGeneratorSettings({...generatorSettings, includeUppercase: e.target.checked})}
                  />
                  Uppercase (A-Z)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generatorSettings.includeLowercase}
                    onChange={(e) => setGeneratorSettings({...generatorSettings, includeLowercase: e.target.checked})}
                  />
                  Lowercase (a-z)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generatorSettings.includeNumbers}
                    onChange={(e) => setGeneratorSettings({...generatorSettings, includeNumbers: e.target.checked})}
                  />
                  Numbers (0-9)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generatorSettings.includeSymbols}
                    onChange={(e) => setGeneratorSettings({...generatorSettings, includeSymbols: e.target.checked})}
                  />
                  Symbols (!@#$%)
                </label>
                <label className="checkbox-label">
                  <input 
                    type="checkbox" 
                    checked={generatorSettings.excludeAmbiguous}
                    onChange={(e) => setGeneratorSettings({...generatorSettings, excludeAmbiguous: e.target.checked})}
                  />
                  Exclude Ambiguous (0,O,1,l)
                </label>
              </div>
            </div>
            
            <div className="generator-actions">
              <button onClick={generatePassword} className="generate-button-large">
                Generate Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import/Export Panel */}
      {showImportExport && (
        <div className="import-export-panel slide-in-down">
          <h3 className="form-title">📁 Import/Export Data</h3>
          
          {/* Export Section */}
          <div className="export-section">
            <h4>📤 Export Passwords</h4>
            <p className="section-description">
              Export all your passwords and settings to a secure JSON file.
            </p>
            
            {!exportConfirmation ? (
              <div className="export-warning">
                <div className="warning-icon">⚠️</div>
                <div className="warning-content">
                  <strong>Security Warning</strong>
                  <p>Exporting creates a file with all your passwords. Keep this file secure!</p>
                  <ul>
                    <li>Store in a secure location</li>
                    <li>Don't share with others</li>
                    <li>Consider encrypting the file</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="password-verification">
                <label className="form-label">Enter Master Password to Confirm Export</label>
                <input
                  type="password"
                  value={exportPasswordVerification}
                  onChange={(e) => setExportPasswordVerification(e.target.value)}
                  placeholder="Master password"
                  className="form-input"
                />
                <p className="verification-note">
                  This is required to prevent unauthorized exports.
                </p>
              </div>
            )}
            
            <div className="export-actions">
              <button
                onClick={exportPasswords}
                className={`export-button ${exportConfirmation ? 'danger' : 'warning'}`}
              >
                {exportConfirmation ? '🔐 Confirm Export' : '⚠️ Start Export'}
              </button>
              {exportConfirmation && (
                <button
                  onClick={() => {
                    setExportConfirmation(false);
                    setExportPasswordVerification('');
                  }}
                  className="cancel-button"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          <div className="section-divider"></div>

          {/* Import Section */}
          <div className="import-section">
            <h4>📥 Import Passwords</h4>
            <p className="section-description">
              Import passwords from a KeyFlow export file or compatible JSON format.
            </p>
            
            {!importConfirmation ? (
              <div className="import-input">
                <label className="form-label">Import Data</label>
                <div className="import-options">
                  <textarea
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Paste JSON data here or upload a file..."
                    className="import-textarea"
                    rows="6"
                  />
                  <div className="file-upload">
                    <label className="file-upload-label">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileUpload}
                        className="file-input"
                      />
                      📁 Choose File
                    </label>
                  </div>
                </div>
                <button
                  onClick={importPasswords}
                  className="import-button"
                  disabled={!importData.trim()}
                >
                  📋 Preview Import
                </button>
              </div>
            ) : (
              <div className="import-preview">
                <h5>Import Preview</h5>
                {importPreview && (
                  <div className="preview-details">
                    <div className="preview-item">
                      <span>Passwords to import:</span>
                      <strong>{importPreview.passwords.length}</strong>
                    </div>
                    <div className="preview-item">
                      <span>Export date:</span>
                      <strong>{new Date(importPreview.exportDate).toLocaleDateString()}</strong>
                    </div>
                    <div className="preview-item">
                      <span>Version:</span>
                      <strong>{importPreview.version}</strong>
                    </div>
                    {importPreview.settings && (
                      <div className="preview-item">
                        <span>Settings included:</span>
                        <strong>Yes</strong>
                      </div>
                    )}
                  </div>
                )}
                <div className="import-actions">
                  <button
                    onClick={confirmImport}
                    className="confirm-import-button"
                  >
                    ✅ Confirm Import
                  </button>
                  <button
                    onClick={() => {
                      setImportConfirmation(false);
                      setImportPreview(null);
                    }}
                    className="cancel-button"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="panel-actions">
            <button
              onClick={() => {
                setShowImportExport(false);
                setExportConfirmation(false);
                setExportPasswordVerification('');
                setImportData('');
                setImportPreview(null);
                setImportConfirmation(false);
              }}
              className="close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Password Form */}
      {showAddForm && (
        <div className="add-form slide-in-down">
          <h3 className="form-title">{editingPassword ? 'Edit Password' : 'Add New Password'}</h3>
          <div className="form-grid">
            <input
              type="text"
              placeholder="Website name"
              value={newPassword.site}
              onChange={(e) => setNewPassword({...newPassword, site: e.target.value})}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Username/Email"
              value={newPassword.username}
              onChange={(e) => setNewPassword({...newPassword, username: e.target.value})}
              className="form-input"
            />
            <div className="password-row">
              <input
                type="text"
                placeholder="Password"
                value={newPassword.password}
                onChange={(e) => setNewPassword({...newPassword, password: e.target.value})}
                className="form-input password-input"
              />
              <button
                onClick={() => setShowPasswordGenerator(!showPasswordGenerator)}
                className="generate-button"
              >
                🎲 Generator
              </button>
            </div>
            
            <textarea
              placeholder="Notes (optional)"
              value={newPassword.notes}
              onChange={(e) => setNewPassword({...newPassword, notes: e.target.value})}
              className="form-input notes-input"
              rows="2"
            />
            
            <div className="tags-section">
              <label className="form-label">Tags</label>
              <div className="tags-container">
                {availableTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`tag-button ${newPassword.tags?.includes(tag) ? 'active' : ''}`}
                    type="button"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="form-actions">
              <button
                onClick={async () => {
                  // Use edit function if editing, otherwise add new
                  if (editingPassword) {
                    await saveEditedPassword();
                  } else {
                    try {
                      if (!newPassword.site || !newPassword.username || !newPassword.password) {
                        alert('Please fill in all required fields');
                        return;
                      }

                      const newPasswordEntry = {
                        id: Date.now(),
                        ...newPassword,
                        createdAt: new Date().toISOString(),
                        lastChanged: new Date().toISOString()
                      };

                      const updatedPasswords = [...passwords, newPasswordEntry];
                      await savePasswordsEncrypted(updatedPasswords);
                      setShowAddForm(false);
                      setNewPassword({
                        site: '', username: '', password: '', url: '', notes: '', tags: [],
                        isFavorite: false, lastUsed: null, createdAt: null, lastChanged: null
                      });
                      alert('Password saved successfully');
                    } catch (error) {
                      alert('Failed to save password: ' + error.message);
                    }
                  }
                }}
                className="save-button"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingPassword(null);
                  setNewPassword({
                    site: '', username: '', password: '', url: '', notes: '', tags: [],
                    isFavorite: false, lastUsed: null, createdAt: null, lastChanged: null
                  });
                }}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password List */}
      <div className="password-list">
        {filteredPasswords.length === 0 ? (
          <div className="empty-state">
            <Lock />
            <p>No passwords found</p>
            <p className="text-sm">Click the + button to add your first password</p>
          </div>
        ) : (
          <div>
            {filteredPasswords.map((password) => (
              <div key={password.id} className="password-item">
                <div className="password-header">
                  <div className="password-info">
                    <h3 className="password-site">{password.site}</h3>
                    <p className="password-username">{password.username}</p>
                    {password.tags && password.tags.length > 0 && (
                      <div className="password-tags">
                        {password.tags.map(tag => (
                          <span key={tag} className="tag-badge">{tag}</span>
                        ))}
                      </div>
                    )}
                    {password.notes && (
                      <p className="password-notes">{password.notes}</p>
                    )}
                  </div>
                  <div className="password-actions">
                    <button
                      onClick={() => toggleFavorite(password.id)}
                      className={`action-button ${password.isFavorite ? 'favorite' : ''}`}
                      title={password.isFavorite ? "Remove from favorites" : "Add to favorites"}
                    >
                      {password.isFavorite ? '⭐' : '☆'}
                    </button>
                    <button
                      onClick={() => copyToClipboard(password.username, password.id)}
                      className="action-button"
                      title="Copy username"
                    >
                      <Copy />
                    </button>
                    <button
                      onClick={() => togglePasswordVisibility(password.id)}
                      className="action-button"
                    >
                      {showPasswords[password.id] ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>
                
                <div className="password-display">
                  <div className="password-field">
                    {showPasswords[password.id] ? password.password : '••••••••••••'}
                  </div>
                  <div className="password-display-actions">
                    <button
                      onClick={() => copyToClipboard(password.password, password.id)}
                      className="action-button"
                      title="Copy password"
                    >
                      <Copy />
                    </button>
                    <button
                      onClick={() => startEditPassword(password)}
                      className="action-button"
                      title="Edit password"
                    >
                      <Edit2 />
                    </button>
                    <button
                      onClick={() => deletePassword(password.id)}
                      className="action-button delete-button"
                      title="Delete password"
                    >
                      <Trash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="app-footer">
        <div className="footer-content">
          <span>{passwords.length} passwords stored locally</span>
          <button
            onClick={() => setIsLocked(true)}
            className="lock-vault-button"
          >
            Lock Vault
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyFlowPopup;