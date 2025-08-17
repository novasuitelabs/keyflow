# KeyFlow 🔐

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-1.0.1-blue.svg)](https://github.com/novasuitelabs/keyflow/releases)
[![Build Status](https://github.com/novasuitelabs/keyflow/workflows/CI/badge.svg)](https://github.com/novasuitelabs/keyflow/actions)
[![Security](https://img.shields.io/badge/security-audited-green.svg)](SECURITY.md)

**KeyFlow** is a secure, open-source password manager browser extension that keeps your passwords safe with local encryption. Built with modern web technologies and designed with security in mind.

## ✨ Features

- 🔐 **Local Encryption** - All passwords encrypted locally, never sent to servers
- 🔑 **Strong Password Generation** - Generate secure passwords with customizable options
- 🚀 **Auto-Fill** - Automatically fill login forms with saved credentials
- 🔍 **Search & Filter** - Quickly find passwords with powerful search capabilities
- 🎨 **Modern UI** - Clean, intuitive interface built with React
- 🌐 **Cross-Browser** - Works on Chrome, Firefox, and Edge
- 🔒 **Zero-Knowledge** - Your data stays on your device
- 📱 **Responsive Design** - Works great on all screen sizes

## 🚀 Quick Start

### Installation

1. **Download the Extension**
   - Download the latest release from [GitHub Releases](https://github.com/novasuitelabs/keyflow/releases)
   - Or build from source (see Development section)

2. **Install in Your Browser**
   - **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", click "Load unpacked", select the extension folder
   - **Firefox**: Go to `about:addons`, click the gear icon, select "Debug Add-ons", click "Load Temporary Add-on", select `manifest.json`
   - **Edge**: Go to `edge://extensions/`, enable "Developer mode", click "Load unpacked", select the extension folder

3. **Set Up Your Master Password**
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
- **Local Storage**: All data stored locally in your browser
- **Strong Encryption**: AES-256 encryption for all sensitive data
- **Zero-Knowledge**: No data ever leaves your device
- **Secure Random**: Cryptographically secure random number generation

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
   - Select the `public` folder as the extension directory

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run build:extension # Build extension files
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

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

- **Version**: 1.0.1
- **Status**: Stable
- **Browser Support**: Chrome 88+, Firefox 85+, Edge 88+
- **License**: MIT

---

**Made with ❤️ by the KeyFlow Team**

*Keep your passwords secure, keep them local, keep them with KeyFlow.*