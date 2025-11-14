# GitHub Actions Workflows

This document explains the automated workflows configured for the KeyFlow extension.

## 📋 Overview

KeyFlow uses GitHub Actions to automate building, testing, and releasing the extension. All workflows are located in `.github/workflows/`.

## 🔄 Workflows

### 1. CI (Continuous Integration)
**File:** `.github/workflows/ci.yml`

**Triggers:**
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches

**What it does:**
- ✅ Builds the extension on Node.js 18.x and 20.x
- ✅ Runs ESLint to check code quality
- ✅ Verifies all required files are present
- ✅ Shows build statistics (file sizes)
- ✅ Runs security audit for dependencies
- ✅ Uploads build artifacts for 7 days

**Build Artifacts:**
The built extension is uploaded as an artifact that you can download from the workflow run. This is useful for testing without building locally.

### 2. Release
**File:** `.github/workflows/release.yml`

**Triggers:**
- Push of version tags (e.g., `v1.0.0`)
- Manual workflow dispatch with version input

**What it does:**
- ✅ Builds the extension for production
- ✅ Creates a ZIP file of the extension
- ✅ Generates release notes from CHANGELOG.md
- ✅ Creates a GitHub Release
- ✅ Uploads the ZIP file to the release
- ✅ Provides installation instructions

**Creating a Release:**

#### Automatic (via Git tag):
```bash
git tag v1.0.0
git push origin v1.0.0
```

#### Manual (via GitHub UI):
1. Go to the "Actions" tab
2. Select "Release" workflow
3. Click "Run workflow"
4. Enter version (e.g., `v1.0.0`)
5. Click "Run workflow"

**Release Output:**
- GitHub Release with downloadable ZIP
- Automatic release notes from CHANGELOG
- Installation instructions included
- ZIP file suitable for Chrome Web Store

### 3. PR Checks
**File:** `.github/workflows/pr-checks.yml`

**Triggers:**
- Pull request opened, synchronized, or reopened

**What it does:**
- ✅ Builds the extension
- ✅ Calculates and displays bundle sizes
- ✅ Posts a comment on the PR with:
  - Build status
  - File sizes
  - Testing instructions
  - Security information
- ✅ Checks code quality:
  - Scans for TODO/FIXME/HACK comments
  - Finds console.log statements
  - Runs linter

**PR Comment Example:**
```markdown
## 🚀 Build Successful!

### 📊 Bundle Sizes

| File | Size |
|------|------|
| popup.js | 224 KB |
| popup.css | 25 KB |
| background.js | 2 KB |
| content.js | 22 KB |
| **Total** | **273 KB** |

### Test this PR:
1. Download the build artifacts...
```

## 🎯 Best Practices

### For Contributors

1. **Before Creating PR:**
   - Run `npm run lint` locally
   - Run `npm run build` to ensure it builds
   - Remove console.log statements
   - Update CHANGELOG.md if needed

2. **After Creating PR:**
   - Check the CI workflow status
   - Review the automated PR comment
   - Download and test the build artifacts

3. **Before Merging:**
   - Ensure all checks pass (green checkmarks)
   - Review code quality warnings
   - Address any security audit issues

### For Maintainers

1. **Creating Releases:**
   - Update version in `package.json`
   - Update CHANGELOG.md with release notes
   - Create and push a version tag
   - Verify the release workflow succeeds
   - Download and test the release ZIP

2. **Managing Dependencies:**
   - Review security audit results regularly
   - Update outdated dependencies
   - Test after updating dependencies

## 📊 Workflow Status

You can check workflow status in several ways:

1. **Repository Homepage:**
   - Badge at the top shows CI status
   - Click badge to view workflow runs

2. **Actions Tab:**
   - Lists all workflow runs
   - Filter by workflow name
   - Download artifacts

3. **Pull Requests:**
   - Status checks shown at bottom
   - Click "Details" to view logs

## 🔧 Workflow Permissions

The workflows require these permissions:
- **CI:** Read access to code
- **Release:** Write access to create releases
- **PR Checks:** Write access to comment on PRs

These are automatically granted by GitHub Actions.

## 🐛 Troubleshooting

### Build Fails

**Problem:** Build step fails
**Solution:**
1. Check the error logs in workflow run
2. Test locally with `npm run build`
3. Ensure all dependencies are in package.json
4. Check Node.js version compatibility

### Release Workflow Not Triggering

**Problem:** Tag pushed but no release created
**Solution:**
1. Ensure tag follows `v*` pattern (e.g., `v1.0.0`)
2. Check workflow permissions in repository settings
3. Use manual workflow dispatch as alternative

### Security Audit Fails

**Problem:** npm audit finds vulnerabilities
**Solution:**
1. Run `npm audit` locally
2. Run `npm audit fix` to auto-fix
3. For unfixable issues, evaluate severity
4. Update dependencies manually if needed

## 📦 Artifacts

### CI Artifacts
- **Name:** `extension-build-node-{version}`
- **Contents:** Complete built extension in `public/` folder
- **Retention:** 7 days
- **Use:** Testing builds without local build

### Release Artifacts
- **Name:** `keyflow-v{version}.zip`
- **Contents:** Extension ZIP for Chrome Web Store
- **Retention:** Permanent (in GitHub Releases)
- **Use:** Distribution and Chrome Web Store submission

## 🚀 Advanced Usage

### Running Specific Workflows

You can trigger workflows manually:

1. Go to **Actions** tab
2. Select the workflow
3. Click **Run workflow**
4. Fill in inputs if required
5. Click **Run workflow**

### Downloading Artifacts

1. Go to workflow run
2. Scroll to **Artifacts** section
3. Click artifact name to download
4. Extract and use

### Modifying Workflows

If you need to modify workflows:

1. Edit files in `.github/workflows/`
2. Test changes in a PR first
3. Validate YAML syntax
4. Check workflow runs after merging

## 📚 Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Chrome Extension Publishing](https://developer.chrome.com/docs/webstore/publish/)

---

**Need Help?** Open an issue or check the workflow logs for detailed error messages.
