#!/usr/bin/env node

/**
 * Sharp Diagnostic Script
 * Run this script to check if Sharp is working correctly in your environment
 */

console.log('🔍 Checking Sharp availability...\n');

// Check Node.js version
console.log('Node.js version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('');

// Try to load Sharp
try {
  const sharp = require('sharp');
  console.log('✅ Sharp module loaded successfully');
  
  // Check Sharp version
  console.log('📦 Sharp version:', sharp.versions.sharp);
  console.log('📦 libvips version:', sharp.versions.vips);
  console.log('');
  
  // Test basic Sharp functionality
  console.log('🧪 Testing Sharp functionality...');
  
  // Create a simple test image
  sharp({
    create: {
      width: 100,
      height: 100,
      channels: 3,
      background: { r: 255, g: 0, b: 0 }
    }
  })
  .jpeg()
  .toBuffer()
  .then(buffer => {
    console.log('✅ Sharp is working correctly!');
    console.log('📊 Test image buffer size:', buffer.length, 'bytes');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Sharp functionality test failed:', error.message);
    process.exit(1);
  });
  
} catch (error) {
  console.error('❌ Failed to load Sharp module:', error.message);
  console.error('');
  console.log('💡 Possible solutions:');
  console.log('1. Reinstall Sharp: npm uninstall sharp && npm install sharp');
  console.log('2. Rebuild Sharp: npm rebuild sharp');
  console.log('3. Platform-specific install: npm install --platform=linux --arch=x64 sharp');
  console.log('4. Include optional deps: npm install --include=optional sharp');
  console.log('');
  process.exit(1);
}
