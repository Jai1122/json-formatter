/**
 * Generates PNG icons for the Chrome extension without any external dependencies.
 * Uses Node.js built-in 'zlib' for PNG deflate compression and 'fs' for file output.
 *
 * Icon design: dark background with blue border and horizontal "code lines".
 */

import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

// --- CRC32 (required for PNG chunk integrity) ---
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = (crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.allocUnsafe(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcInput = Buffer.concat([typeBytes, data]);
  const crcBuf = Buffer.allocUnsafe(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([lenBuf, typeBytes, data, crcBuf]);
}

// --- Pixel color function (16×16 logical grid, scaled to any size) ---
function getColor(px, py, size) {
  // Map physical pixel → logical 16×16 grid
  const x = Math.floor((px * 16) / size);
  const y = Math.floor((py * 16) / size);

  // Palette
  const OUTER  = [15,  23,  42];   // #0f172a  — outer shadow
  const INNER  = [30,  41,  59];   // #1e293b  — content background
  const BORDER = [96,  165, 250];  // #60a5fa  — blue border/accent

  // 1-px outer shadow ring
  if (x === 0 || x === 15 || y === 0 || y === 15) return OUTER;
  // 1-px blue border
  if (x === 1 || x === 14 || y === 1 || y === 14) return BORDER;

  // Horizontal "code lines" inside (simulates a JSON document)
  if (y === 4  && x >= 3 && x <= 7)  return BORDER;  // short line (key)
  if (y === 6  && x >= 3 && x <= 11) return BORDER;  // long line (value)
  if (y === 8  && x >= 3 && x <= 9)  return BORDER;  // medium line
  if (y === 10 && x >= 3 && x <= 6)  return BORDER;  // short line (closing)

  return INNER;
}

// --- PNG encoder ---
function createPNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR: width, height, bit depth (8), color type (2 = RGB), compression, filter, interlace
  const ihdr = Buffer.allocUnsafe(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;

  // Raw image rows: filter byte (0 = None) + RGB pixels
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = [0]; // filter byte
    for (let px = 0; px < size; px++) {
      const [r, g, b] = getColor(px, py, size);
      row.push(r, g, b);
    }
    rows.push(Buffer.from(row));
  }
  const idat = deflateSync(Buffer.concat(rows));

  return Buffer.concat([
    sig,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', idat),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

// --- Generate icons ---
mkdirSync('public/icons', { recursive: true });

for (const size of [16, 48, 128]) {
  const png = createPNG(size);
  writeFileSync(`public/icons/icon${size}.png`, png);
  console.log(`Created public/icons/icon${size}.png (${png.length} bytes)`);
}

console.log('Icons ready.');
