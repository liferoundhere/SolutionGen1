import { copyFileSync, mkdirSync, statSync } from 'node:fs';
mkdirSync('../dist', { recursive: true });
copyFileSync('dist/index.html', '../dist/csx.html');
console.log('dist/csx.html', (statSync('../dist/csx.html').size / 1024).toFixed(0), 'KB');
