/* ============================================================
   Build preview copies (assets/images/thumbs/)
   Every photo shown in a grid gets a smaller preview: the gallery
   arrays in js/data/events/*.js and js/data/projects/*.js, plus every
   photo in assets/images/felicitations/. Grid tiles load the preview;
   the lightbox still opens the full-size file (see thumbOf() in
   js/event.js / js/project.js and `thumb` in js/data/gallery.js).

   Size: at least 1000px wide OR 640px tall, whichever needs more,
   never enlarged. Masonry tiles are ~410px wide on desktop and ~340px
   on phones (2-3x screens); gallery collage rows are ~190-350px tall.

   A preview's path mirrors its full-size image:
     assets/images/events/<slug>/photo-01.jpg
     -> assets/images/thumbs/events/<slug>/photo-01.jpg
   Previews whose full-size image is no longer used are deleted.

   Run from the repo root:  npm run build:thumbs
   ============================================================ */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const sharp = require('sharp');

const ROOT = path.resolve(__dirname, '..');
const IMAGES = 'assets/images';
const THUMBS = 'assets/images/thumbs';
const MIN_WIDTH = 1000;
const MIN_HEIGHT = 640;
const QUALITY = 80;

/* Load a js/data/<kind>/<slug>.js file (it assigns window.EVENT_DATA /
   window.PROJECT_DATA) and return that object. */
function loadData(file) {
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox, { filename: file });
  return Object.values(sandbox.window)[0];
}

/* Repo-relative paths ("assets/images/...") of every grid photo. */
function gridPhotos() {
  const photos = new Set();
  for (const dir of ['js/data/events', 'js/data/projects']) {
    for (const name of fs.readdirSync(path.join(ROOT, dir)).filter(n => n.endsWith('.js'))) {
      const data = loadData(path.join(ROOT, dir, name));
      for (const item of data.gallery || []) {
        if (item.placeholder || !item.image) continue;
        // Data files are loaded from events/*.html or projects/*.html, so
        // their paths start with ../ — strip it to get the repo path.
        photos.add(item.image.replace(/^\.\.\//, ''));
      }
    }
  }
  const felicitations = path.join(IMAGES, 'felicitations');
  for (const name of fs.readdirSync(path.join(ROOT, felicitations))) {
    if (/\.jpe?g$/i.test(name)) photos.add(felicitations.replace(/\\/g, '/') + '/' + name);
  }
  return [...photos].sort();
}

const thumbPathOf = src => src.replace(IMAGES + '/', THUMBS + '/');

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

/* Delete folders (below `dir`) that the stale-preview cleanup left empty. */
function removeEmptyDirs(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const sub = path.join(dir, e.name);
    removeEmptyDirs(sub);
    if (!fs.readdirSync(sub).length) fs.rmdirSync(sub);
  }
}

async function main() {
  const photos = gridPhotos();
  const wanted = new Set();
  let bytes = 0;

  for (const src of photos) {
    const full = path.join(ROOT, src);
    if (!fs.existsSync(full)) throw new Error('Missing image referenced by a data file: ' + src);
    const out = path.join(ROOT, thumbPathOf(src));
    wanted.add(path.normalize(out));

    const { width, height } = await sharp(full).metadata();
    const scale = Math.min(1, Math.max(MIN_WIDTH / width, MIN_HEIGHT / height));
    const buf = await sharp(full)
      .resize(Math.round(width * scale), Math.round(height * scale))
      .jpeg({ quality: QUALITY, mozjpeg: true })
      .toBuffer();

    fs.mkdirSync(path.dirname(out), { recursive: true });
    // Only rewrite when the bytes differ, so an unchanged build leaves git clean.
    if (!fs.existsSync(out) || !buf.equals(fs.readFileSync(out))) fs.writeFileSync(out, buf);
    bytes += buf.length;
  }

  const stale = walk(path.join(ROOT, THUMBS)).filter(f => !wanted.has(path.normalize(f)));
  stale.forEach(f => fs.unlinkSync(f));
  removeEmptyDirs(path.join(ROOT, THUMBS));

  console.log(`${photos.length} previews (${(bytes / 1048576).toFixed(1)} MB) in ${THUMBS}/`);
  if (stale.length) console.log('Removed stale previews:\n  ' + stale.map(f => path.relative(ROOT, f)).join('\n  '));
}

main().catch(err => { console.error(err.message); process.exit(1); });
