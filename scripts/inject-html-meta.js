// Patches the statically-exported dist/index.html to declare the page as
// light-only. Without this, some Android browsers (Chrome's "Force dark" /
// auto-dark-theme-for-web-content) invert the whole page's colors, since we
// don't support a dark theme. Runs as a build step (see vercel.json) rather
// than via app/+html.jsx because switching Expo Router's web output to
// "static" (needed for +html to apply) triggers build-time prerendering,
// which breaks lib/supabase.js's browser-only localStorage access.
const fs = require('fs');
const path = require('path');

const indexPath = path.join(__dirname, '..', 'dist', 'index.html');
const html = fs.readFileSync(indexPath, 'utf8');

const metaTag = '<meta name="color-scheme" content="light only" />';

if (html.includes('color-scheme')) {
  process.exit(0);
}

const patched = html.replace(
  /<meta name="viewport"[^>]*>/,
  match => `${match}\n    ${metaTag}`
);

fs.writeFileSync(indexPath, patched);
console.log('Injected color-scheme meta tag into dist/index.html');
