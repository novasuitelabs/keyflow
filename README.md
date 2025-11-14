# KeyFlow 🔐

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/novasuitelabs/keyflow/releases)
[![Build Status](https://github.com/novasuitelabs/keyflow/workflows/CI/badge.svg)](https://github.com/novasuitelabs/keyflow/actions)
[![Security](https://img.shields.io/badge/security-audited-green.svg)](SECURITY.md)

**KeyFlow** is a secure, open-source password manager browser extension that keeps your passwords safe with local encryption. Built with modern web technologies and designed with security in mind.

## ✨ Features

- 🔐 **Military-Grade Encryption** - AES-256-GCM encryption with PBKDF2 key derivation (100,000 iterations)
- 🔑 **Advanced Password Generator** - Random, pronounceable, and passphrase options
- 🚀 **Smart Auto-Fill** - Automatically detect and fill login forms across websites
- ✏️ **Full CRUD Operations** - Create, read, update, and delete passwords with ease
- 🔍 **Powerful Search** - Fuzzy search with sorting by name, date, or last used
- ⭐ **Favorites & Recent** - Quick access to frequently used passwords
- 🛡️ **Security Dashboard** - Monitor password health, duplicates, and weak passwords
- 📊 **Password Analysis** - Identify old, weak, or reused passwords
- 📤 **Import/Export** - Backup and restore your vault with secure verification
- ⏰ **Auto-Lock Timer** - Configurable vault auto-lock with warnings
- 🌙 **Dark Mode** - Easy on the eyes for night-time use
- ⌨️ **Keyboard Shortcuts** - Efficient navigation with hotkeys
- 🎨 **Modern UI** - Clean, intuitive interface built with React
- 🌐 **Cross-Browser** - Works on Chrome, Firefox, and Edge
- 🔒 **Zero-Knowledge** - Your data never leaves your device
- 📱 **Responsive Design** - Works great on all screen sizes

## 🚀 Quick Start

Choose the installation method that works best for you:

### Option 1: Install from Chrome Web Store (Recommended for Most Users)

**Easiest method - One-click installation with automatic updates**

1. **Visit the Chrome Web Store**
   - Go to [KeyFlow on Chrome Web Store](https://chrome.google.com/webstore/detail/keyflow/your-extension-id)
   - Click "Add to Chrome" button

2. **Confirm Installation**
   - Click "Add extension" in the confirmation dialog
   - KeyFlow will be automatically installed and updated

3. **Set Up Your Master Password**
   - Click the KeyFlow icon in your browser toolbar
   - Create a strong master password
   - Start adding your passwords!

### Option 2: Install from GitHub Releases

**For users who want the latest version directly from GitHub**

1. **Download the Extension**
   - Go to [GitHub Releases](https://github.com/novasuitelabs/keyflow/releases)
   - Download the latest release ZIP file for your browser
   - Extract the ZIP file to a folder on your computer

2. **Install in Your Browser**
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select the extracted folder
   - **Firefox**: Go to `about:addons`, click the gear icon, select "Debug Add-ons", click "Load Temporary Add-on", select `manifest.json` from the extracted folder
   - **Edge**: Go to `edge://extensions/`, enable "Developer mode", click "Load unpacked", select the extracted folder

3. **Set Up Your Master Password**
   - Click the KeyFlow icon in your browser toolbar
   - Create a strong master password
   - Start adding your passwords!

### Option 3: Build from Source

**For developers and users who want the latest development version**

1. **Clone the Repository**
   ```bash
   git clone https://github.com/novasuitelabs/keyflow.git
   cd keyflow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Build the Extension**
   ```bash
   npm run build
   ```
   This will build the extension and copy all files to the `public` folder.

4. **Install in Your Browser**
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select the `public` folder
   - **Firefox**: Go to `about:addons`, click the gear icon, select "Debug Add-ons", click "Load Temporary Add-on", select `manifest.json` from the `public` folder
   - **Edge**: Go to `edge://extensions/`, enable "Developer mode", click "Load unpacked", select the `public` folder

5. **Set Up Your Master Password**
   - Click the KeyFlow icon in your browser toolbar
   - Create a strong master password
   - Start adding your passwords!

### First Time Setup

1. **Create Master Password**
   - Choose a strong, memorable master password
   - This password encrypts all your data locally
   - **Important**: Keep this password safe - it cannot be recovered!

2. **Add Your First Password**
   - Click "Add Password" in the popup
   - Fill in the website, username, and password
   - Save and you're ready to go!

3. **Auto-Fill Setup**
   - Navigate to a login page
   - KeyFlow will detect the form
   - Click the KeyFlow icon and select your saved password

## 🛡️ Security

KeyFlow prioritizes your security with multiple layers of protection:

### Data Protection
- **Local Storage**: All data stored locally in your browser using Chrome's secure storage API
- **AES-256-GCM Encryption**: Industry-standard authenticated encryption for all passwords
- **PBKDF2 Key Derivation**: 100,000 iterations for secure master password hashing
- **Zero-Knowledge Architecture**: No data ever leaves your device - not even encrypted
- **Secure Random**: Cryptographically secure random number generation (Web Crypto API)
- **Memory Protection**: Master password kept in memory only while vault is unlocked

### Privacy Features
- **No Tracking**: No analytics or tracking code
- **No Cloud**: No cloud storage or synchronization
- **No Logging**: No sensitive data is logged
- **Open Source**: Transparent code for security review

### Best Practices
- Use a strong, unique master password
- Keep your browser and extension updated
- Only use on trusted devices
- Regularly backup your password database

## 🛠️ Development

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git
- Modern browser (Chrome, Firefox, Edge)

### Building from Source

1. **Clone the Repository**
   ```bash
   git clone https://github.com/novasuitelabs/keyflow.git
   cd keyflow
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Build Extension**
   ```bash
   npm run build:extension
   ```

5. **Load in Browser**
   - Follow the installation instructions above
   - Select the `dist` folder as the extension directory

### Development Scripts

```bash
npm run dev              # Start development server
npm run build            # Build extension with post-build processing
npm run build:extension  # Alias for npm run build
npm run build:store      # Build and package for Chrome Web Store
npm run lint             # Run ESLint
npm run preview          # Preview production build
```

### Keyboard Shortcuts

KeyFlow includes powerful keyboard shortcuts for efficiency:

- **`Ctrl+K` / `Cmd+K`** - Focus search box
- **`Ctrl+N` / `Cmd+N`** - Add new password (when unlocked)
- **`Esc`** - Close modals and forms
- **`Enter`** - Copy password (when focused on password field)

These shortcuts work throughout the extension popup for faster navigation.

### Building for Production

When building your extension for production/distribution, you have two options:

#### Option 1: Using Build Script (Recommended)
```bash
npm run build:extension
```
- This builds the extension and copies files to the `public` folder
- Use the `public` folder for distribution or Chrome Web Store submission

#### Option 2: Using Chrome's Pack Extension
```bash
npm run build:extension
```
- Then go to `chrome://extensions/`
- Enable "Developer mode"
- Click "Pack extension"
- Select the `dist` folder
- This creates a `.crx` file for distribution

**Note**: Both methods work for Chrome Web Store submission - the store accepts both `.zip` (from Option 1) and `.crx` (from Option 2) formats.

### Project Structure

```
keyflow/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── scripts/           # Extension scripts
│   └── utils/             # Utility functions
├── public/                # Extension files
├── docs/                  # Documentation
├── .github/               # GitHub templates and workflows
└── README.md              # This file
```

## 📚 Documentation

- **[Contributing Guide](CONTRIBUTING.md)** - How to contribute to KeyFlow
- **[Development Guide](docs/DEVELOPMENT.md)** - Detailed development information
- **[API Documentation](docs/API.md)** - Internal APIs and interfaces
- **[Security Policy](SECURITY.md)** - Security guidelines and reporting
- **[Changelog](docs/CHANGELOG.md)** - Version history and changes

## 🤝 Contributing

We welcome contributions from the community! Here's how you can help:

### Ways to Contribute

- 🐛 **Report Bugs** - Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- 💡 **Suggest Features** - Use the [feature request template](.github/ISSUE_TEMPLATE/feature_request.md)
- 🔧 **Fix Issues** - Pick an issue and submit a pull request
- 📝 **Improve Documentation** - Help make our docs better
- 🔒 **Security Review** - Review code for security issues

### Getting Started

1. **Fork the Repository**
2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make Your Changes**
4. **Test Thoroughly**
5. **Submit a Pull Request**

### Code Style

- Follow the existing code style
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🐛 Reporting Issues

Found a bug? Have a security concern? We want to hear about it!

### Bug Reports
- Use the [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
- Include steps to reproduce
- Provide browser and OS information
- Add screenshots if relevant

### Security Issues
- **DO NOT** create public issues for security vulnerabilities
- Email security issues to labs@novasuite.one
- See [SECURITY.md](SECURITY.md) for more details

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Contributors** - Everyone who has contributed to KeyFlow
- **Security Researchers** - Those who help keep KeyFlow secure
- **Open Source Community** - For the amazing tools and libraries we use

## 🔗 Links

- **[GitHub Repository](https://github.com/novasuitelabs/keyflow)**
- **[Issue Tracker](https://github.com/novasuitelabs/keyflow/issues)**
- **[Releases](https://github.com/novasuitelabs/keyflow/releases)**
- **[Discussions](https://github.com/novasuitelabs/keyflow/discussions)**

## 📊 Project Status

- **Version**: 1.0.0
- **Status**: Stable
- **Browser Support**: Chrome 88+, Firefox 85+, Edge 88+
- **License**: MIT

---

**Made with ❤️ by Nova Suite Labs**

*Keep your passwords secure, keep them local, keep them with KeyFlow.*
