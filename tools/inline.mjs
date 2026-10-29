// Bundle a cisco-3d-stage deck folder into one self-contained HTML body for publishing.
// Usage: node inline.mjs <deckDir> <out.html> "<Title>" [narrated]
import * as esbuild from 'esbuild';
import fs from 'node:fs'; import path from 'node:path';
const [dir, out, title, narrated] = process.argv.slice(2);
const abs = p => path.join(dir, p);
const mime = f => ({ '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.svg': 'image/svg+xml' })[path.extname(f).toLowerCase()];
const dataUri = f => `data:${mime(f)};base64,${fs.readFileSync(f).toString('base64')}`;
const tmp = path.join(dir, '.bundle.js');
const vendor = path.resolve(abs('vendor/three'));
await esbuild.build({ entryPoints: [abs('js/main.js')], bundle: true, format: 'esm', minify: true, legalComments: 'none', outfile: tmp, logLevel: 'warning',
  plugins: [{ name: 'three', setup(b) {
    b.onResolve({ filter: /^three$/ }, () => ({ path: path.join(vendor, 'three.module.js') }));
    b.onResolve({ filter: /^three\/addons\// }, a => ({ path: path.join(vendor, a.path.slice('three/'.length)) }));
    // media files become data URIs looked up from window.__MEDIA, so the page needs no sibling files
    b.onLoad({ filter: /[\\/]js[\\/].*\.js$/ }, a => ({ contents: fs.readFileSync(a.path, 'utf8').replace(/`media\/\$\{(\w+)\}`/g, '(window.__MEDIA[$1] || `media/${$1}`)'), loader: 'js', resolveDir: path.dirname(a.path) }));
  } }] });
let js = fs.readFileSync(tmp, 'utf8'); fs.unlinkSync(tmp);
const media = {};
if (fs.existsSync(abs('media'))) for (const f of fs.readdirSync(abs('media'))) if (mime(f)) media[f] = dataUri(abs('media/' + f));
js = js.replace(/<\/script/gi, '<\\/script');
let css = fs.readFileSync(abs('css/style.css'), 'utf8').replace(/url\((\.\.\/vendor\/fonts\/[^)]+)\)/g, (_, p) => `url(${dataUri(path.join(dir, 'css', p))})`);
const html = fs.readFileSync(abs('index.html'), 'utf8');
const bodyM = html.match(/<body([^>]*)>([\s\S]*)<\/body>/);
let body = bodyM[2].replace(/<script[^>]*src="js\/main\.js"[^>]*><\/script>/, '');
const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
const icon = (html.match(/<link rel="icon"[^>]*>/) || [''])[0];
const page = `<title>${title}</title>\n<meta name="description" content="${desc}">\n${icon}\n<style>${css}\nbody{background:#050e1d}</style>\n${body.trim()}\n<script>window.__MEDIA=${JSON.stringify(media)};</script>\n<script type="module">${narrated ? "document.body.dataset.edition='narrated';" : ''}\n${js}</script>\n`;
fs.writeFileSync(out, page);
console.log(out, (page.length / 1024 / 1024).toFixed(2) + ' MB');
