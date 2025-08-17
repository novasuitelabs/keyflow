# KeyFlow API Documentation

This document describes the internal APIs and interfaces used within KeyFlow.

## Core APIs

### Storage API

The storage API handles all data persistence operations.

#### `StorageManager`

```javascript
class StorageManager {
  // Store encrypted data
  static async set(key: string, value: any): Promise<void>
  
  // Retrieve and decrypt data
  static async get(key: string): Promise<any>
  
  // Remove data
  static async remove(key: string): Promise<void>
  
  // Clear all data
  static async clear(): Promise<void>
  
  // Get all keys
  static async keys(): Promise<string[]>
}
```

**Usage:**
```javascript
// Store a password entry
await StorageManager.set('passwords', encryptedPasswords);

// Retrieve passwords
const passwords = await StorageManager.get('passwords');

// Remove specific data
await StorageManager.remove('temp_data');
```

### Crypto API

The crypto API handles all encryption and decryption operations.

#### `CryptoManager`

```javascript
class CryptoManager {
  // Encrypt data with master password
  static async encrypt(data: any, masterPassword: string): Promise<string>
  
  // Decrypt data with master password
  static async decrypt(encryptedData: string, masterPassword: string): Promise<any>
  
  // Generate secure random string
  static generatePassword(length: number, options: PasswordOptions): string
  
  // Hash password for verification
  static async hashPassword(password: string): Promise<string>
  
  // Verify password hash
  static async verifyPassword(password: string, hash: string): Promise<boolean>
}
```

**Usage:**
```javascript
// Encrypt password data
const encrypted = await CryptoManager.encrypt(passwords, masterPassword);

// Decrypt password data
const decrypted = await CryptoManager.decrypt(encrypted, masterPassword);

// Generate secure password
const password = CryptoManager.generatePassword(16, {
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: true
});
```

### Message API

The message API handles communication between different parts of the extension.

#### Message Types

```javascript
// Request types
const MESSAGE_TYPES = {
  GET_PASSWORDS: 'GET_PASSWORDS',
  SAVE_PASSWORD: 'SAVE_PASSWORD',
  DELETE_PASSWORD: 'DELETE_PASSWORD',
  GENERATE_PASSWORD: 'GENERATE_PASSWORD',
  FILL_FORM: 'FILL_FORM',
  GET_CURRENT_TAB: 'GET_CURRENT_TAB'
};
```

#### Sending Messages

```javascript
// Send message to background script
chrome.runtime.sendMessage({
  type: 'GET_PASSWORDS',
  data: { /* optional data */ }
}, (response) => {
  console.log('Response:', response);
});

// Send message to content script
chrome.tabs.sendMessage(tabId, {
  type: 'FILL_FORM',
  data: { username, password }
});
```

#### Receiving Messages

```javascript
// Listen for messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'GET_PASSWORDS':
      // Handle request
      sendResponse({ success: true, data: passwords });
      break;
    case 'SAVE_PASSWORD':
      // Handle request
      sendResponse({ success: true });
      break;
  }
});
```

## Component APIs

### Popup Component

#### `KeyFlowPopup`

```javascript
const KeyFlowPopup = () => {
  // State management
  const [passwords, setPasswords] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  
  // Event handlers
  const handleUnlock = async (masterPassword) => { /* ... */ };
  const handleAddPassword = async (passwordData) => { /* ... */ };
  const handleEditPassword = async (id, passwordData) => { /* ... */ };
  const handleDeletePassword = async (id) => { /* ... */ };
  const handleGeneratePassword = () => { /* ... */ };
  const handleFillForm = async (password) => { /* ... */ };
  
  return (
    // JSX component
  );
};
```

#### Props and State

```javascript
// Password entry structure
interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  password: string;
  url: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Component state
interface PopupState {
  passwords: PasswordEntry[];
  searchTerm: string;
  isUnlocked: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Background Script

#### Event Handlers

```javascript
// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Initialize storage
    initializeStorage();
  }
});

// Message handling
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    // Handle tab completion
  }
});
```

### Content Script

#### Form Detection

```javascript
// Detect password forms
const detectPasswordForms = () => {
  const forms = document.querySelectorAll('form');
  const passwordFields = document.querySelectorAll('input[type="password"]');
  
  return {
    forms: Array.from(forms),
    passwordFields: Array.from(passwordFields)
  };
};

// Auto-fill form
const fillForm = (username, password) => {
  const usernameField = document.querySelector('input[type="email"], input[type="text"]');
  const passwordField = document.querySelector('input[type="password"]');
  
  if (usernameField) {
    usernameField.value = username;
    usernameField.dispatchEvent(new Event('input', { bubbles: true }));
  }
  
  if (passwordField) {
    passwordField.value = password;
    passwordField.dispatchEvent(new Event('input', { bubbles: true }));
  }
};
```

## Utility Functions

### Password Generation

```javascript
// Password generation options
interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeSimilar: boolean;
}

// Generate password
const generatePassword = (options: PasswordOptions): string => {
  // Implementation
};
```

### Validation

```javascript
// Validate password entry
const validatePasswordEntry = (entry: Partial<PasswordEntry>): boolean => {
  return (
    entry.title?.trim() &&
    entry.username?.trim() &&
    entry.password?.trim() &&
    entry.url?.trim()
  );
};

// Validate master password
const validateMasterPassword = (password: string): boolean => {
  return password.length >= 8;
};
```

### URL Utilities

```javascript
// Extract domain from URL
const extractDomain = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return '';
  }
};

// Check if URL matches pattern
const urlMatches = (url: string, pattern: string): boolean => {
  // Implementation
};
```

## Error Handling

### Error Types

```javascript
const ERROR_TYPES = {
  INVALID_MASTER_PASSWORD: 'INVALID_MASTER_PASSWORD',
  ENCRYPTION_FAILED: 'ENCRYPTION_FAILED',
  DECRYPTION_FAILED: 'DECRYPTION_FAILED',
  STORAGE_ERROR: 'STORAGE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED'
};
```

### Error Handling Pattern

```javascript
const handleError = (error, context) => {
  console.error(`Error in ${context}:`, error);
  
  // Log error for debugging
  if (process.env.NODE_ENV === 'development') {
    console.trace();
  }
  
  // Show user-friendly message
  showErrorMessage(getErrorMessage(error));
  
  // Report error if critical
  if (isCriticalError(error)) {
    reportError(error, context);
  }
};
```

## Security Considerations

### Data Protection

- All sensitive data is encrypted before storage
- Master password is never stored in plain text
- Encryption keys are derived from master password
- No data is sent to external servers

### Input Validation

- All user inputs are validated
- URLs are sanitized before processing
- Password strength is enforced
- XSS prevention through output encoding

### Permission Model

- Minimal required permissions
- Granular permission requests
- Clear permission explanations
- User consent for sensitive operations

## Performance Guidelines

### Optimization Tips

1. **Lazy Loading**: Load data only when needed
2. **Caching**: Cache frequently accessed data
3. **Debouncing**: Debounce search and input events
4. **Virtual Scrolling**: For large password lists
5. **Memory Management**: Clean up resources properly

### Best Practices

- Use async/await for all I/O operations
- Implement proper error boundaries
- Monitor memory usage
- Profile performance regularly
- Optimize bundle size

## Testing

### Unit Tests

```javascript
// Example test structure
describe('CryptoManager', () => {
  test('should encrypt and decrypt data correctly', async () => {
    const data = { test: 'value' };
    const password = 'testPassword';
    
    const encrypted = await CryptoManager.encrypt(data, password);
    const decrypted = await CryptoManager.decrypt(encrypted, password);
    
    expect(decrypted).toEqual(data);
  });
});
```

### Integration Tests

```javascript
// Test message passing
test('should handle password retrieval', async () => {
  // Setup
  const mockPasswords = [/* test data */];
  
  // Execute
  const response = await sendMessage({
    type: 'GET_PASSWORDS'
  });
  
  // Assert
  expect(response.success).toBe(true);
  expect(response.data).toEqual(mockPasswords);
});
```

## Versioning

### API Versioning

- Major version changes may break existing APIs
- Minor version changes add new features
- Patch version changes fix bugs
- Deprecation warnings for breaking changes

### Migration

- Provide migration scripts for data format changes
- Maintain backward compatibility when possible
- Clear migration documentation
- Automated migration testing
