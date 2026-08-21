export interface ImageSize {
  width: number;
  height: number;
}

function u16be(bytes: Uint8Array, offset: number): number {
  return (bytes[offset] << 8) | bytes[offset + 1];
}

function u16le(bytes: Uint8Array, offset: number): number {
  return bytes[offset] | (bytes[offset + 1] << 8);
}

function u32be(bytes: Uint8Array, offset: number): number {
  return (
    (bytes[offset] << 24) |
    (bytes[offset + 1] << 16) |
    (bytes[offset + 2] << 8) |
    bytes[offset + 3]
  ) >>> 0;
}

export function readPngSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 24) return null;
  if (bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e || bytes[3] !== 0x47) return null;
  return { width: u32be(bytes, 16), height: u32be(bytes, 20) };
}

export function readGifSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 10) return null;
  const header = String.fromCharCode(...bytes.subarray(0, 6));
  if (header !== 'GIF87a' && header !== 'GIF89a') return null;
  return { width: u16le(bytes, 6), height: u16le(bytes, 8) };
}

export function readJpegSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return null;
  let i = 2;
  while (i + 8 < bytes.length) {
    if (bytes[i] !== 0xff) {
      i += 1;
      continue;
    }
    const marker = bytes[i + 1];
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      i += 2;
      continue;
    }
    const size = u16be(bytes, i + 2);
    if (size < 2) return null;
    const sof =
      (marker >= 0xc0 && marker <= 0xc3) ||
      (marker >= 0xc5 && marker <= 0xc7) ||
      (marker >= 0xc9 && marker <= 0xcb) ||
      (marker >= 0xcd && marker <= 0xcf);
    if (sof) {
      return { height: u16be(bytes, i + 5), width: u16be(bytes, i + 7) };
    }
    i += 2 + size;
  }
  return null;
}

export function readWebpSize(bytes: Uint8Array): ImageSize | null {
  if (bytes.length < 30) return null;
  const riff = String.fromCharCode(...bytes.subarray(0, 4));
  const webp = String.fromCharCode(...bytes.subarray(8, 12));
  if (riff !== 'RIFF' || webp !== 'WEBP') return null;
  const fourcc = String.fromCharCode(...bytes.subarray(12, 16));
  if (fourcc === 'VP8X' && bytes.length >= 30) {
    const width = 1 + bytes[24] + (bytes[25] << 8) + (bytes[26] << 16);
    const height = 1 + bytes[27] + (bytes[28] << 8) + (bytes[29] << 16);
    return { width, height };
  }
  if (fourcc === 'VP8 ' && bytes.length >= 30 && bytes[20] === 0x9d && bytes[21] === 0x01 && bytes[22] === 0x2a) {
    return { width: u16le(bytes, 23) & 0x3fff, height: u16le(bytes, 25) & 0x3fff };
  }
  if (fourcc === 'VP8L' && bytes.length >= 25 && bytes[20] === 0x2f) {
    const bits = bytes[21] | (bytes[22] << 8) | (bytes[23] << 16) | (bytes[24] << 24);
    return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
  }
  return null;
}

export function readImageSize(bytes: Uint8Array): ImageSize | null {
  return readPngSize(bytes) || readJpegSize(bytes) || readGifSize(bytes) || readWebpSize(bytes);
}

/** Drop JPEG APP1 (EXIF/XMP). Orientation is not re-applied — keep uploads upright. */
export function stripJpegExif(bytes: Uint8Array): Uint8Array {
  if (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8) return bytes;
  const out: number[] = [0xff, 0xd8];
  let i = 2;
  while (i + 4 < bytes.length) {
    if (bytes[i] !== 0xff) {
      out.push(...bytes.subarray(i));
      break;
    }
    const marker = bytes[i + 1];
    if (marker === 0xda) {
      out.push(...bytes.subarray(i));
      break;
    }
    if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
      out.push(bytes[i], bytes[i + 1]);
      i += 2;
      continue;
    }
    const size = u16be(bytes, i + 2);
    if (size < 2 || i + 2 + size > bytes.length) {
      out.push(...bytes.subarray(i));
      break;
    }
    if (marker !== 0xe1) out.push(...bytes.subarray(i, i + 2 + size));
    i += 2 + size;
  }
  return Uint8Array.from(out);
}
