# Contributing to KeyFlow

Thank you for your interest in contributing to KeyFlow! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Code Style](#code-style)
- [Security](#security)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a new branch for your feature/fix
4. Make your changes
5. Test your changes
6. Submit a pull request

## Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/novasuitelabs/keyflow.git
   cd keyflow
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build the extension:
   ```bash
   npm run build:extension
   ```

### Loading the Extension

1. Open your browser and go to the extensions page:
   - Chrome: `chrome://extensions/`
   - Firefox: `about:addons`
   - Edge: `edge://extensions/`

2. Enable "Developer mode"

3. Click "Load unpacked" and select the `dist` folder

## Making Changes

### Project Structure

```
keyflow/
├── src/                    # Source code
│   ├── components/         # React components
│   ├── scripts/           # Extension scripts
│   └── utils/             # Utility functions
├── public/                # Extension files
├── .github/               # GitHub templates and workflows
└── docs/                  # Documentation
```

### Key Files

- `src/components/KeyFlowPopup.jsx` - Main popup component
- `src/scripts/background.js` - Background service worker
- `src/scripts/content.js` - Content script
- `src/utils/crypto.js` - Cryptographic utilities
- `public/manifest.json` - Extension manifest

## Testing

### Manual Testing

1. Build the extension: `npm run build:extension`
2. Load the extension in your browser
3. Test all functionality manually
4. Test on different websites
5. Test with different password scenarios

### Automated Testing

Run the linter:
```bash
npm run lint
```

### Testing Checklist

- [ ] Extension loads without errors
- [ ] Popup opens and displays correctly
- [ ] Password generation works
- [ ] Password storage and retrieval works
- [ ] Auto-fill functionality works
- [ ] Security features work as expected
- [ ] No console errors
- [ ] Works on different browsers

## Submitting Changes

### Before Submitting

1. Ensure your code follows the style guidelines
2. Test your changes thoroughly
3. Update documentation if needed
4. Check that all tests pass

### Pull Request Process

1. Create a descriptive pull request title
2. Fill out the pull request template
3. Include screenshots if UI changes were made
4. Reference any related issues
5. Ensure the CI checks pass

### Commit Messages

Use conventional commit format:
```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

## Code Style

### JavaScript/React

- Use ES6+ features
- Prefer functional components with hooks
- Use meaningful variable and function names
- Add JSDoc comments for complex functions
- Follow the existing code style

### CSS

- Use consistent naming conventions
- Prefer CSS custom properties for theming
- Keep styles modular and reusable

### Security Guidelines

- Never log sensitive information
- Use secure cryptographic functions
- Validate all user inputs
- Follow the principle of least privilege
- Keep dependencies updated

## Security

### Reporting Security Issues

If you discover a security vulnerability, please:

1. **DO NOT** create a public issue
2. Email the maintainers directly
3. Provide detailed information about the vulnerability
4. Include steps to reproduce if possible

### Security Best Practices

- All passwords are encrypted locally
- No data is sent to external servers
- Use secure random number generation
- Validate all inputs
- Follow OWASP guidelines

## Getting Help

- Check existing issues and pull requests
- Read the documentation
- Ask questions in discussions
- Join our community

## Recognition

Contributors will be recognized in:
- The project README
- Release notes
- Contributor hall of fame

Thank you for contributing to KeyFlow! 🚀
