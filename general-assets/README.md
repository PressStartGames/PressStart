# General assets

Brand files for use outside the site build (profiles, stores, mail, documents). The site itself keeps
its own copy in `client/public/`.

## favicon/

The Press Start mark: a dark rounded square (`#0E1014`, radius 14/64) with the press-start red play
triangle (`#E8543A`). Every raster file is rendered from `favicon.svg` at an exact square size, so the
ratio and the look are the same at every scale; re-render from the SVG rather than resizing a PNG.

| file | size | typical use |
|---|---|---|
| `favicon.svg` | vector | the source; modern browsers, anything that takes SVG |
| `favicon.ico` | 16 + 32 + 48 | legacy browser tab icon, Windows shortcuts |
| `favicon-16.png` … `favicon-48.png` | 16, 24, 32, 48 | browser tabs, bookmarks, taskbar |
| `favicon-64.png`, `favicon-96.png`, `favicon-128.png` | 64, 96, 128 | desktop shortcuts, small avatars |
| `apple-touch-icon.png` (= `favicon-180.png`) | 180 | iOS home screen |
| `android-chrome-192.png` (= `favicon-192.png`) | 192 | Android home screen, web app manifest |
| `favicon-256.png`, `favicon-384.png` | 256, 384 | manifests, Windows tiles |
| `android-chrome-512.png` (= `favicon-512.png`) | 512 | web app manifest, Play/App listings |
| `favicon-1024.png` | 1024 | social profile avatars, app store masters |

To regenerate after changing the SVG, run from `client/` (sharp is already installed there):

```
node ../general-assets/favicon/render.cjs
```
