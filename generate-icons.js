const fs = require('fs');
const path = require('path');

// Create a simple script to generate icon files
// In a real environment, you would use proper image processing

const iconSizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

const svgTemplate = (size) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="#facc15"/>
  <rect x="${size * 0.125}" y="${size * 0.125}" width="${size * 0.75}" height="${size * 0.75}" rx="${size * 0.1}" fill="#000000"/>
  <circle cx="${size * 0.35}" cy="${size * 0.4}" r="${size * 0.05}" fill="#facc15"/>
  <circle cx="${size * 0.5}" cy="${size * 0.32}" r="${size * 0.04}" fill="#facc15"/>
  <circle cx="${size * 0.65}" cy="${size * 0.43}" r="${size * 0.035}" fill="#facc15"/>
  <path d="M${size * 0.3} ${size * 0.6} Q${size * 0.4} ${size * 0.5} ${size * 0.5} ${size * 0.55} Q${size * 0.6} ${size * 0.6} ${size * 0.7} ${size * 0.53}" stroke="#facc15" stroke-width="${size * 0.015}" fill="none" stroke-linecap="round"/>
  <rect x="${size * 0.27}" y="${size * 0.67}" width="${size * 0.46}" height="${size * 0.12}" rx="${size * 0.06}" fill="#facc15"/>
  <text x="${size * 0.5}" y="${size * 0.745}" text-anchor="middle" fill="#000000" font-family="Arial" font-weight="bold" font-size="${size * 0.046}">CityPulse</text>
</svg>`;

// Create icons directory if it doesn't exist
const iconsDir = path.join(__dirname, 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
    fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size (in a real setup, these would be converted to PNG)
iconSizes.forEach(size => {
    const svg = svgTemplate(size);
    const filename = `icon-${size}x${size}.svg`;
    fs.writeFileSync(path.join(iconsDir, filename), svg);
    console.log(`Generated ${filename}`);
});

// Create a favicon.ico placeholder
const faviconSvg = svgTemplate(32);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSvg);

console.log('✅ Icon generation complete!');
console.log('📝 Note: SVG files created. In production, convert to PNG using:');
console.log('   - Online tools like https://pwa-asset-generator.netlify.app/');
console.log('   - ImageMagick: convert icon.svg -background none icon.png');
console.log('   - Or proper build tools with image processing');
