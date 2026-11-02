// Renders every favicon size from favicon.svg. Run from client/ (sharp lives in its dependencies):
//   node ../general-assets/favicon/render.cjs
const fs = require('fs');
const path = require('path');

function loadSharp() {
  try {
    return require('sharp');
  } catch {
    const pnpm = path.resolve(__dirname, '..', '..', 'node_modules', '.pnpm');
    const dir = fs.readdirSync(pnpm).find((d) => d.startsWith('sharp@'));
    if (!dir) throw new Error('sharp not found; run pnpm install at the repository root');
    return require(path.join(pnpm, dir, 'node_modules', 'sharp'));
  }
}

const sharp = loadSharp();
const out = __dirname;
const svg = fs.readFileSync(path.join(out, 'favicon.svg'));
const sizes = [16, 24, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512, 1024];

(async () => {
  for (const s of sizes) {
    await sharp(svg, { density: Math.max(72, (72 * s) / 64) })
      .resize(s, s)
      .png()
      .toFile(path.join(out, `favicon-${s}.png`));
  }
  fs.copyFileSync(path.join(out, 'favicon-180.png'), path.join(out, 'apple-touch-icon.png'));
  fs.copyFileSync(path.join(out, 'favicon-192.png'), path.join(out, 'android-chrome-192.png'));
  fs.copyFileSync(path.join(out, 'favicon-512.png'), path.join(out, 'android-chrome-512.png'));

  // favicon.ico: an ICO container holding the 16, 32 and 48 px PNGs.
  const icoSizes = [16, 32, 48];
  const pngs = icoSizes.map((s) => fs.readFileSync(path.join(out, `favicon-${s}.png`)));
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(icoSizes.length, 4);
  const dir = Buffer.alloc(16 * icoSizes.length);
  let offset = 6 + dir.length;
  icoSizes.forEach((s, i) => {
    const e = i * 16;
    dir.writeUInt8(s, e);
    dir.writeUInt8(s, e + 1);
    dir.writeUInt8(0, e + 2);
    dir.writeUInt8(0, e + 3);
    dir.writeUInt16LE(1, e + 4);
    dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(pngs[i].length, e + 8);
    dir.writeUInt32LE(offset, e + 12);
    offset += pngs[i].length;
  });
  fs.writeFileSync(path.join(out, 'favicon.ico'), Buffer.concat([header, dir, ...pngs]));
  console.log(`rendered ${sizes.length} sizes + favicon.ico into ${out}`);
})();
