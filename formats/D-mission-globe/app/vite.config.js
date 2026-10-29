import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// One self-contained HTML file. Studio-voice MP3s (optional) live next to it in audio/<voice>/<hash>.mp3.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: { outDir: '../dist', emptyOutDir: false, assetsInlineLimit: 100000000, chunkSizeWarningLimit: 4000, cssCodeSplit: false },
});
