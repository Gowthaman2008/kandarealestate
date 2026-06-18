import { defineConfig } from 'vite';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    {
      name: 'copy-custom-assets',
      closeBundle() {
        const files = ['app.js', 'murugan.png', 'vel.png', 'bala.png'];
        const distDir = path.resolve(__dirname, 'dist');
        
        if (!fs.existsSync(distDir)) {
          fs.mkdirSync(distDir, { recursive: true });
        }
        
        files.forEach(file => {
          const src = path.resolve(__dirname, file);
          const dest = path.resolve(distDir, file);
          if (fs.existsSync(src)) {
            fs.copyFileSync(src, dest);
            console.log(`[copy-custom-assets] Copied ${file} to dist/`);
          } else {
            console.warn(`[copy-custom-assets] Warning: Source file ${file} does not exist at ${src}`);
          }
        });
      }
    }
  ]
});
