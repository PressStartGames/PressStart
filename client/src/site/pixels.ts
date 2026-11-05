// The three moves' pixel glyphs (12 x 12), drawn as SVG rects. "X" is a lit pixel.
import type { Move } from './data';

export const GLYPHS: Record<Move | 'arrow' | 'check' | 'road' | 'talk', readonly string[]> = {
  // a speech bubble (the community)
  talk: [
    '............',
    '.XXXXXXXXXX.',
    'X..........X',
    'X..........X',
    'X.XX.XX.XX.X',
    'X..........X',
    'X..........X',
    '.XXXX.XXXXX.',
    '....X.X.....',
    '....XX......',
    '....X.......',
    '............',
  ],
  // a document with a folded corner and lines of text
  build: [
    '.XXXXXXX....',
    '.X.....XX...',
    '.X.....X.X..',
    '.X.....XXXX.',
    '.X.XXXX...X.',
    '.X........X.',
    '.X.XXXXXX.X.',
    '.X........X.',
    '.X.XXXXX..X.',
    '.X........X.',
    '.XXXXXXXXXX.',
    '............',
  ],
  // a tick inside a stamp
  prove: [
    'XXXXXXXXXXXX',
    'X..........X',
    'X.........XX',
    'X........XXX',
    'X.......XX.X',
    'XXX....XX..X',
    'X.XX..XX...X',
    'X..XXXX....X',
    'X...XX.....X',
    'X..........X',
    'XXXXXXXXXXXX',
    '............',
  ],
  // a cartridge
  own: [
    '.XXXXXXXXXX.',
    '.X........X.',
    '.X.XXXXXX.X.',
    '.X.X....X.X.',
    '.X.X....X.X.',
    '.X.XXXXXX.X.',
    '.X........X.',
    '.XXXXXXXXXX.',
    '..XXXXXXXX..',
    '..X.X.X.X...',
    '..X.X.X.X...',
    '............',
  ],
  arrow: [
    '............',
    '............',
    '.......X....',
    '.......XX...',
    '.......XXX..',
    '.XXXXXXXXXX.',
    '.XXXXXXXXXX.',
    '.......XXX..',
    '.......XX...',
    '.......X....',
    '............',
    '............',
  ],
  check: [
    '............',
    '............',
    '..........X.',
    '.........XX.',
    '........XX..',
    '.X.....XX...',
    '.XX...XX....',
    '..XX.XX.....',
    '...XXX......',
    '....X.......',
    '............',
    '............',
  ],
  road: [
    '............',
    '............',
    '....XXXX....',
    '...X....X...',
    '..X......X..',
    '..X......X..',
    '..X......X..',
    '..X......X..',
    '...X....X...',
    '....XXXX....',
    '............',
    '............',
  ],
};

// One path for all lit pixels of a glyph (fewer nodes than one rect each).
export function glyphPath(name: keyof typeof GLYPHS): string {
  let d = '';
  GLYPHS[name].forEach((row, y) => {
    for (let x = 0; x < row.length; x++) if (row[x] === 'X') d += `M${x} ${y}h1v1h-1z`;
  });
  return d;
}
