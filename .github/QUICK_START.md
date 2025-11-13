# 🚀 Quick Start: GitHub Actions

## Automatic Builds

Every time you push code or create a PR, GitHub will automatically:
- ✅ Build your extension
- ✅ Run security checks
- ✅ Create downloadable build artifacts

**No setup required!** Just push your code.

## Creating a Release

### Method 1: Git Tag (Recommended)
```bash
# Update version in package.json and CHANGELOG.md first!
git tag v1.0.0
git push origin v1.0.0
```

### Method 2: GitHub UI
1. Go to **Actions** → **Release**
2. Click **Run workflow**
3. Enter version (e.g., `v1.0.0`)
4. Click **Run workflow**

### What Happens Next
1. Extension builds automatically
2. ZIP file is created
3. GitHub Release is published
4. Download link is provided

## Downloading Builds

### From CI Runs:
1. Go to **Actions** tab
2. Click on a workflow run
3. Scroll to **Artifacts**
4. Download `extension-build-node-20.x`

### From Releases:
1. Go to **Releases** tab
2. Click on a release
3. Download `keyflow-v*.zip`

## Testing a Build

After downloading:
```bash
# Extract the ZIP
unzip keyflow-v1.0.0.zip -d keyflow

# Load in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extracted folder
```

## PR Workflow

When you create a pull request:
1. **Wait for CI to finish** (2-3 minutes)
2. **Check the automated comment** with build info
3. **Download artifacts** to test your changes
4. **Merge when green** ✅

## Common Commands

```bash
# Build locally (same as CI)
npm run build

# Test locally before pushing
npm run lint
npm run build

# Create a release
git tag v1.0.1
git push origin v1.0.1
```

## Status Badges

Add to your README to show build status:
```markdown
[![CI](https://github.com/novasuitelabs/keyflow/workflows/CI/badge.svg)](https://github.com/novasuitelabs/keyflow/actions)
```

## Need Help?

- 📚 Read [WORKFLOWS.md](WORKFLOWS.md) for detailed docs
- 🐛 Check workflow logs in Actions tab
- 💬 Open an issue if something breaks

---

**That's it!** GitHub Actions handles everything automatically. Just push your code and create releases when ready.
