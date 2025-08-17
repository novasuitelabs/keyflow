# Development Guide

This document provides detailed information for developers working on KeyFlow.

## Architecture Overview

KeyFlow is a browser extension built with React and Vite. The extension consists of several key components:

### Core Components

1. **Popup Interface** (`src/components/KeyFlowPopup.jsx`)
   - Main user interface for password management
   - Built with React and modern JavaScript
   - Handles user interactions and data display

2. **Background Service Worker** (`src/scripts/background.js`)
   - Runs in the background to handle extension lifecycle
   - Manages storage and communication between components
   - Handles browser events and API calls

3. **Content Script** (`src/scripts/content.js`)
   - Injected into web pages for auto-fill functionality
   - Communicates with the popup and background script
   - Handles form detection and password insertion

4. **Cryptographic Utilities** (`src/utils/crypto.js`)
   - Handles password encryption and decryption
   - Implements secure random generation
   - Manages key derivation and storage

## Development Environment Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Modern browser (Chrome, Firefox, Edge)

### Local Development

1. **Clone and Install**
   ```bash
   git clone https://github.com/novasuitelabs/keyflow.git
   cd keyflow
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build Extension**
   ```bash
   npm run build:extension
   ```

4. **Load in Browser**
   - Chrome: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", select the `public` folder
   - Firefox: Go to `about:addons`, click the gear icon, select "Debug Add-ons", click "Load Temporary Add-on", select `manifest.json`
   - Edge: Go to `edge://extensions/`, enable Developer mode, click "Load unpacked", select the `public` folder

### Development Workflow

1. **Make Changes**: Edit files in the `src` directory
2. **Build**: Run `npm run build:extension` to compile changes
3. **Reload**: Reload the extension in your browser
4. **Test**: Test your changes thoroughly
5. **Commit**: Follow the commit message conventions

## Code Structure

### File Organization

```
src/
├── components/          # React components
│   └── KeyFlowPopup.jsx # Main popup component
├── scripts/            # Extension scripts
│   ├── background.js   # Background service worker
│   └── content.js      # Content script
├── utils/              # Utility functions
│   └── crypto.js       # Cryptographic utilities
└── index.css           # Global styles
```

### Key Patterns

#### React Components

- Use functional components with hooks
- Keep components focused and single-purpose
- Use meaningful prop names
- Implement proper error boundaries

```javascript
import React, { useState, useEffect } from 'react';

const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Side effects here
  }, [prop1]);

  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default MyComponent;
```

#### Extension Scripts

- Use async/await for asynchronous operations
- Implement proper error handling
- Follow browser extension best practices
- Use message passing for communication

```javascript
// Background script example
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'GET_PASSWORDS') {
    // Handle request
    sendResponse({ success: true, data: passwords });
  }
});
```

## Testing Strategy

### Manual Testing

1. **Functionality Testing**
   - Test all password operations (add, edit, delete)
   - Test password generation
   - Test auto-fill functionality
   - Test search and filtering

2. **Browser Compatibility**
   - Test on Chrome, Firefox, and Edge
   - Test on different versions
   - Test on different operating systems

3. **Security Testing**
   - Verify encryption/decryption works correctly
   - Test with various password types
   - Verify no sensitive data is logged

### Automated Testing

```bash
# Run linter
npm run lint

# Run type checking (if using TypeScript)
npm run type-check

# Run tests (when implemented)
npm test
```

## Debugging

### Chrome DevTools

1. **Popup Debugging**
   - Right-click the extension icon
   - Select "Inspect popup"
   - Use DevTools as normal

2. **Background Script Debugging**
   - Go to `chrome://extensions/`
   - Find KeyFlow
   - Click "service worker" link
   - Use DevTools for debugging

3. **Content Script Debugging**
   - Open DevTools on any webpage
   - Look for content script in Sources tab
   - Set breakpoints as needed

### Console Logging

```javascript
// Use console.log for debugging
console.log('Debug info:', data);

// Use console.error for errors
console.error('Error occurred:', error);

// Use console.warn for warnings
console.warn('Warning:', message);
```

## Performance Considerations

### Optimization Tips

1. **Bundle Size**
   - Keep dependencies minimal
   - Use tree shaking
   - Optimize images and assets

2. **Runtime Performance**
   - Use efficient algorithms
   - Implement proper caching
   - Avoid unnecessary re-renders

3. **Memory Usage**
   - Clean up event listeners
   - Dispose of resources properly
   - Monitor memory usage

## Security Guidelines

### Data Protection

1. **Encryption**
   - Always encrypt sensitive data
   - Use strong cryptographic algorithms
   - Implement proper key management

2. **Input Validation**
   - Validate all user inputs
   - Sanitize data before processing
   - Use parameterized queries

3. **Output Encoding**
   - Encode all outputs
   - Prevent XSS attacks
   - Use Content Security Policy

### Best Practices

- Never log sensitive information
- Use HTTPS for all network requests
- Implement proper authentication
- Follow the principle of least privilege
- Keep dependencies updated

## Deployment

### Building for Production

```bash
# Build the extension
npm run build:extension

# The built files will be in the public/ directory
```

### Release Process

1. **Version Update**
   - Update version in `package.json`
   - Update version in `manifest.json`
   - Create a git tag

2. **Build and Test**
   - Build the extension
   - Test thoroughly
   - Verify all functionality works

3. **Release**
   - Create a GitHub release
   - Upload the built extension
   - Update documentation

## Troubleshooting

### Common Issues

1. **Extension Not Loading**
   - Check manifest.json syntax
   - Verify all files exist
   - Check browser console for errors

2. **Build Errors**
   - Check Node.js version
   - Clear node_modules and reinstall
   - Check for syntax errors

3. **Runtime Errors**
   - Check browser console
   - Verify permissions in manifest.json
   - Check for API compatibility issues

### Getting Help

- Check existing issues on GitHub
- Read the documentation
- Ask questions in discussions
- Join the community

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for detailed contribution guidelines.

## Resources

- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)
- [Firefox Extension Documentation](https://extensionworkshop.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)
