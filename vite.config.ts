import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, rmSync } from 'fs';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/main.ts'),
      name: 'noter',
      fileName: 'main',
      formats: ['cjs'],
    },
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['obsidian'],
      output: {
        globals: {
          obsidian: 'obsidian',
        },
      },
    },
    minify: false,
    sourcemap: true,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  plugins: [
    {
      name: 'copy-assets',
      async closeBundle() {
        // 删除 vite 自动生成的 style.css，使用我们的 styles.css
        try {
          rmSync(resolve(__dirname, 'dist/style.css'));
        } catch {}
        // 复制 styles.css 到 dist
        copyFileSync(
          resolve(__dirname, 'src/styles.css'),
          resolve(__dirname, 'dist/styles.css')
        );
        copyFileSync(
          resolve(__dirname, 'manifest.json'),
          resolve(__dirname, 'dist/manifest.json')
        );
      },
    },
  ],
});
