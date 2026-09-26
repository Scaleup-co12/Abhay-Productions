# Build tools

Two scripts regenerate files the site uses. Run them from the repo root after
`npm install` (installs [sharp](https://sharp.pixelplumbing.com/), the only
dependency). The site itself has no build step — the generated files are
committed like any other.

| Command | Writes | Run it when |
|---|---|---|
| `npm run build:thumbs` | `assets/images/thumbs/**` | a photo is added, replaced or removed in an event/film gallery or in `assets/images/felicitations/` |
| `npm run build:gallery` | `js/data/gallery.js` | an event gallery or the felicitations change (run `build:thumbs` first) |
| `npm run build` | both, in the right order | when in doubt |

Both are safe to re-run: unchanged inputs produce byte-identical output, so
git shows no changes.

## Adding photos

1. Put the image in the right folder, e.g.
   `assets/images/events/<event-page-name>/photo-13.jpg` or
   `assets/images/felicitations/photo-49.jpg`.
2. For an event or film, add it to the `gallery` array in
   `js/data/events/<slug>.js` or `js/data/projects/<slug>.js`
   (paths there start with `../assets/...`).
3. Run `npm run build` and commit the new image, its preview and
   `js/data/gallery.js`.

To keep a photo on its event page but out of the Gallery page, add its path to
`EXCLUDE` at the top of `tools/build-gallery.js`.

## Image sizes

The site's images were optimised once (long edge capped at 2400px,
mozjpeg quality 84, posters 88). Large new photos should be resized to about
2400px on the long edge before adding them; the preview script only creates
the smaller grid copies and never changes the original.
