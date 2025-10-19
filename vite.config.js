import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

// Enable React JSX transform and HMR via @vitejs/plugin-react
function copyAssetsPlugin() {
  return {
    name: 'copy-src-assets-to-public',
    apply: 'build',
    buildStart() {
      const srcDir = path.resolve(process.cwd(), 'src/assets');
      const publicDir = path.resolve(process.cwd(), 'public/assets');
      try {
        if (fs.existsSync(srcDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
          const copyRecursive = (src, dest) => {
            const stat = fs.statSync(src);
            if (stat.isDirectory()) {
              fs.mkdirSync(dest, { recursive: true });
              for (const entry of fs.readdirSync(src)) {
                copyRecursive(path.join(src, entry), path.join(dest, entry));
              }
            } else {
              fs.copyFileSync(src, dest);
            }
          };
          copyRecursive(srcDir, publicDir);
        }
      } catch (e) {
        console.warn('[copy-assets]', e?.message || e);
      }
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyAssetsPlugin(),
  ],
});
