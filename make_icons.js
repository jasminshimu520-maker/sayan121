const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function createPNG(width, height, r, g, b, a = 255) {
  // A simple uncompressed raw bitmap turned into PNG
  const buffer = Buffer.alloc(8 + 25 + (height * (1 + width * 4)) + 12);
  
  // PNG Signature
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]).copy(buffer, 0);
  
  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const crc32 = (buf) => {
    let c = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      c ^= buf[i];
      for (let j = 0; j < 8; j++) {
        c = (c >>> 1) ^ (-(c & 1) & 0xedb88320);
      }
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  function writeChunk(type, data, offset) {
    const len = data.length;
    buffer.writeUInt32BE(len, offset);
    Buffer.from(type).copy(buffer, offset + 4);
    data.copy(buffer, offset + 8);
    const typeAndData = Buffer.concat([Buffer.from(type), data]);
    buffer.writeUInt32BE(crc32(typeAndData), offset + 8 + len);
    return offset + 12 + len;
  }

  let offset = 8;
  offset = writeChunk('IHDR', ihdr, offset);

  // Raw image data with filter byte 0 at start of each row
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let p = 0;
  for (let y = 0; y < height; y++) {
    rawData[p++] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      // Draw rounded card look
      const isBorder = x < 10 || x > width - 10 || y < 10 || y > height - 10;
      rawData[p++] = isBorder ? 99 : r;   // R (Indigo #4F46E5 -> 79, 70, 229)
      rawData[p++] = isBorder ? 102 : g;  // G
      rawData[p++] = isBorder ? 241 : b;  // B
      rawData[p++] = a;                  // A
    }
  }

  const compressed = zlib.deflateSync(rawData);
  offset = writeChunk('IDAT', compressed, offset);
  offset = writeChunk('IEND', Buffer.alloc(0), offset);

  return buffer.slice(0, offset);
}

const iconsDir = path.join(__dirname, 'client', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// 79, 70, 229 is Indigo #4F46E5
fs.writeFileSync(path.join(iconsDir, 'icon-192x192.png'), createPNG(192, 192, 79, 70, 229));
fs.writeFileSync(path.join(iconsDir, 'icon-512x512.png'), createPNG(512, 512, 79, 70, 229));

console.log('PWA Icons generated successfully!');
