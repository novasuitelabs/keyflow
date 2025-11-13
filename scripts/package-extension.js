#!/usr/bin/env node
import { createWriteStream, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname, relative } from 'path';
import { fileURLToPath } from 'url';
import { createGzip } from 'zlib';
import { pipeline } from 'stream/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Packaging extension for distribution...');

// Simple archiver using tar if available, otherwise just copy to a folder
const distDir = join(projectRoot, 'dist');
const publicDir = join(projectRoot, 'public');
const outputFile = join(projectRoot, 'keyflow-distribution.zip');

console.log(`
Note: To create a proper ZIP file for Chrome Web Store, please use one of these methods:

1. On Windows:
   - Right-click the 'public' folder
   - Select "Send to" → "Compressed (zipped) folder"

2. On Mac/Linux:
   - Run: cd public && zip -r ../keyflow-distribution.zip * && cd ..

3. Using 7-Zip or WinRAR:
   - Compress the 'public' folder to keyflow-distribution.zip

The extension files are ready in the 'public' directory:
  ${publicDir}

Upload the ZIP file or the public folder contents to:
  - Chrome Web Store (for publication)
  - chrome://extensions/ (for local testing - enable Developer Mode and use "Load unpacked")
`);

// Check if files exist
if (existsSync(publicDir)) {
  const files = readdirSync(publicDir);
  console.log('\nExtension files ready:');
  files.forEach(file => {
    console.log(`  ✓ ${file}`);
  });
} else {
  console.error('\n✗ Error: public directory not found. Run "npm run build" first.');
  process.exit(1);
}

console.log('\n✓ Extension packaging information displayed');
