const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const standaloneDir = path.join(projectRoot, '.next', 'standalone');

// Source and Destination Paths
const publicSrc = path.join(projectRoot, 'public');
const publicDest = path.join(standaloneDir, 'public');

const staticSrc = path.join(projectRoot, '.next', 'static');
const staticDest = path.join(standaloneDir, '.next', 'static');

console.log('Copying static assets to standalone directory...');

try {
  // Copy /public -> .next/standalone/public
  if (fs.existsSync(publicSrc)) {
    fs.cpSync(publicSrc, publicDest, { recursive: true, force: true });
    console.log('✅ Copied public directory successfully.');
  } else {
    console.warn('⚠️ Public directory not found.');
  }

  // Copy .next/static -> .next/standalone/.next/static
  if (fs.existsSync(staticSrc)) {
    fs.cpSync(staticSrc, staticDest, { recursive: true, force: true });
    console.log('✅ Copied .next/static directory successfully.');
  } else {
    console.warn('⚠️ .next/static directory not found.');
  }
} catch (err) {
  console.error('❌ Error copying assets:', err);
  process.exit(1);
}

console.log('Standalone build assets prepared successfully.');
