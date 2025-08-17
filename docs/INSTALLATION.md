# Installation Guide

This guide will walk you through installing KeyFlow on your preferred browser.

## Prerequisites

- A modern web browser (Chrome 88+, Firefox 85+, or Edge 88+)
- Administrator access to install extensions (for some browsers)

## Installation Methods

### Method 1: Install from GitHub Releases (Recommended)

1. **Download the Extension**
   - Go to [KeyFlow Releases](https://github.com/novasuitelabs/keyflow/releases)
   - Download the latest release ZIP file
   - Extract the ZIP file to a permanent location on your computer

2. **Install in Your Browser**
   - Follow the browser-specific instructions below

### Method 2: Build from Source

If you prefer to build from source or want the latest development version:

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
   npm run build:extension
   ```

4. **Install the Built Extension**
   - The built files will be in the `public/` directory
   - Follow the browser-specific instructions below

## Browser-Specific Installation

### Google Chrome

1. **Open Chrome Extensions Page**
   - Type `chrome://extensions/` in the address bar
   - Or go to Chrome menu → More tools → Extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files
   - For releases: Select the extracted folder
   - For development: Select the `public/` folder

4. **Verify Installation**
   - You should see KeyFlow in your extensions list
   - The KeyFlow icon should appear in your browser toolbar

### Mozilla Firefox

1. **Open Firefox Add-ons Page**
   - Type `about:addons` in the address bar
   - Or go to Firefox menu → Add-ons

2. **Open Debug Mode**
   - Click the gear icon (⚙️) in the top-right corner
   - Select "Debug Add-ons"

3. **Load the Extension**
   - Click "Load Temporary Add-on"
   - Navigate to the extension folder
   - Select the `manifest.json` file

4. **Verify Installation**
   - KeyFlow should appear in the "Temporary Extensions" section
   - The KeyFlow icon should appear in your browser toolbar

**Note**: Firefox temporary extensions are removed when you restart the browser. For permanent installation, you'll need to sign the extension or use Firefox Developer Edition.

### Microsoft Edge

1. **Open Edge Extensions Page**
   - Type `edge://extensions/` in the address bar
   - Or go to Edge menu → Extensions → Manage extensions

2. **Enable Developer Mode**
   - Toggle the "Developer mode" switch in the left sidebar

3. **Load the Extension**
   - Click "Load unpacked" button
   - Select the folder containing the extension files

4. **Verify Installation**
   - KeyFlow should appear in your extensions list
   - The KeyFlow icon should appear in your browser toolbar

## First-Time Setup

After installing the extension, you'll need to set it up:

1. **Click the KeyFlow Icon**
   - Look for the KeyFlow icon in your browser toolbar
   - Click it to open the popup

2. **Create Your Master Password**
   - Enter a strong master password
   - This password encrypts all your data
   - **Important**: Keep this password safe - it cannot be recovered!

3. **Add Your First Password**
   - Click "Add Password" to create your first entry
   - Fill in the website, username, and password
   - Save the entry

4. **Test Auto-Fill**
   - Navigate to a login page
   - KeyFlow should detect the form
   - Click the KeyFlow icon and select your saved password

## Troubleshooting

### Extension Not Loading

**Symptoms**: Extension doesn't appear in the browser or shows an error.

**Solutions**:
1. **Check File Structure**: Ensure all required files are present
   - `manifest.json`
   - `popup.html`
   - `popup.js`
   - `background.js`
   - `content.js`
   - `popup.css`
   - `icons/` folder with icon files

2. **Check Manifest Version**: Ensure `manifest.json` uses Manifest V3
3. **Clear Browser Cache**: Clear browser cache and cookies
4. **Restart Browser**: Close and reopen your browser
5. **Check Console**: Open browser developer tools and check for errors

### Permission Issues

**Symptoms**: Extension loads but doesn't work properly.

**Solutions**:
1. **Check Permissions**: Ensure the extension has required permissions
2. **Grant Permissions**: Some features may require explicit permission
3. **Check Site Access**: Ensure the extension can access the current site

### Auto-Fill Not Working

**Symptoms**: Passwords don't auto-fill on login forms.

**Solutions**:
1. **Check Content Script**: Ensure content script is running
2. **Refresh Page**: Try refreshing the page
3. **Check Form Detection**: Verify the form is detected correctly
4. **Manual Fill**: Use the popup to manually fill forms

### Data Not Saving

**Symptoms**: Passwords don't persist between browser sessions.

**Solutions**:
1. **Check Storage**: Ensure browser storage is enabled
2. **Check Permissions**: Verify storage permissions
3. **Clear Storage**: Try clearing and re-adding data
4. **Check Encryption**: Verify master password is correct

## Uninstallation

### Remove the Extension

1. **Chrome/Edge**:
   - Go to `chrome://extensions/` or `edge://extensions/`
   - Find KeyFlow in the list
   - Click "Remove" or the trash icon

2. **Firefox**:
   - Go to `about:addons`
   - Find KeyFlow in the list
   - Click "Remove" or the gear icon → "Remove"

### Clear Data (Optional)

**Warning**: This will permanently delete all your passwords!

1. **Clear Extension Data**:
   - Go to browser settings
   - Find "Privacy and security"
   - Clear browsing data
   - Select "Extensions" or "Site data"

2. **Remove Files**:
   - Delete the extension folder from your computer

## Security Considerations

### Installation Security

1. **Download from Official Source**: Only download from GitHub releases
2. **Verify Checksums**: Check file integrity if checksums are provided
3. **Scan for Malware**: Run antivirus scan on downloaded files
4. **Check Permissions**: Review requested permissions before installing

### Usage Security

1. **Strong Master Password**: Use a strong, unique master password
2. **Regular Updates**: Keep the extension updated
3. **Secure Environment**: Only use on trusted devices
4. **Backup Data**: Regularly backup your password database

## Support

If you encounter issues during installation:

1. **Check Documentation**: Review this guide and other docs
2. **Search Issues**: Check existing GitHub issues
3. **Create Issue**: Use the bug report template
4. **Community Help**: Ask in GitHub discussions

## Next Steps

After successful installation:

1. **Read the User Guide**: Learn how to use KeyFlow effectively
2. **Set Up Backup**: Configure data backup
3. **Import Passwords**: Import existing passwords if needed
4. **Customize Settings**: Adjust preferences to your needs
5. **Join Community**: Follow the project for updates and support
