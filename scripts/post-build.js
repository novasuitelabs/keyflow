#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('Post-build: Copying files to public directory...');

// Ensure public directory exists
const publicDir = join(projectRoot, 'public');
if (!existsSync(publicDir)) {
  mkdirSync(publicDir, { recursive: true });
}

// Files to copy from dist to public
const filesToCopy = [
  { src: 'dist/popup.css', dest: 'public/popup.css' },
  { src: 'dist/popup.js', dest: 'public/popup.js' },
  { src: 'dist/background.js', dest: 'public/background.js' },
  { src: 'dist/content.js', dest: 'public/content.js' }
];

let successCount = 0;
let errorCount = 0;

filesToCopy.forEach(({ src, dest }) => {
  const srcPath = join(projectRoot, src);
  const destPath = join(projectRoot, dest);

  try {
    if (existsSync(srcPath)) {
      copyFileSync(srcPath, destPath);
      console.log(`  ✓ Copied ${src} → ${dest}`);
      successCount++;
    } else {
      console.warn(`  ⚠ Source file not found: ${src}`);
      errorCount++;
    }
  } catch (error) {
    console.error(`  ✗ Failed to copy ${src}: ${error.message}`);
    errorCount++;
  }
});

console.log(`\nPost-build complete: ${successCount} files copied, ${errorCount} errors`);

if (errorCount > 0) {
  process.exit(1);
}
