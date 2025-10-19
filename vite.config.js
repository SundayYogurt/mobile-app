import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import fs from 'node:fs';
import path from 'node:path';

function copyAssetsPlugin() {
  return {
    name: 'copy-src-assets-to-public',
    apply: 'build',
    buildStart() {
      const srcDir = path.resolve(process.cwd(), 'src/assets');
      const publicAssets = path.resolve(process.cwd(), 'public/assets');
      const publicSrcAssets = path.resolve(process.cwd(), 'public/src/assets');
      try {
        if (fs.existsSync(srcDir)) {
          const copyRecursive = (src, dest) => {
            const stat = fs.statSync(src);
            if (stat.isDirectory()) {
              fs.mkdirSync(dest, { recursive: true });
              for (const entry of fs.readdirSync(src)) {
                copyRecursive(path.join(src, entry), path.join(dest, entry));
              }
            } else {
              fs.mkdirSync(path.dirname(dest), { recursive: true });
              fs.copyFileSync(src, dest);
            }
          };
          copyRecursive(srcDir, publicAssets);
          copyRecursive(srcDir, publicSrcAssets);
        }
      } catch (e) {
        console.warn('[copy-assets]', e?.message || e);
      }
    },
  };
}

// Enable React JSX transform and HMR via @vitejs/plugin-react
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    copyAssetsPlugin(),
  ],
});
