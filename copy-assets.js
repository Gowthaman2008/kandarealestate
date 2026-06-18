const fs = require('fs');
const path = require('path');

const files = ['app.js', 'murugan.png', 'vel.png'];
const distDir = path.join(__dirname, 'dist');

// Ensure the dist directory exists before copying
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

files.forEach(file => {
  const src = path.join(__dirname, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied ${file} to dist/`);
  } else {
    console.warn(`Warning: Source file ${file} does not exist at ${src}`);
  }
});
