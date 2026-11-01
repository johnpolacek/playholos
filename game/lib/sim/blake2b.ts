// BLAKE2b (RFC 7693), unkeyed, any digest size up to 64 bytes, so calcs/seed.py's keyed() can be drawn in the browser.
// In BigInt for plainness: a draw hashes about a thousand short strings. Checked against Python in sim.test.mts.

const MASK = (BigInt(1) << BigInt(64)) - BigInt(1);
const IV = [
  "6a09e667f3bcc908", "bb67ae8584caa73b", "3c6ef372fe94f82b", "a54ff53a5f1d36f1",
  "510e527fade682d1", "9b05688c2b3e6c1f", "1f83d9abfb41bd6b", "5be0cd19137e2179",
].map((h) => BigInt("0x" + h));
const SIGMA = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
  [14, 10, 4, 8, 9, 15, 13, 6, 1, 12, 0, 2, 11, 7, 5, 3],
  [11, 8, 12, 0, 5, 2, 15, 13, 10, 14, 3, 6, 7, 1, 9, 4],
  [7, 9, 3, 1, 13, 12, 11, 14, 2, 6, 5, 10, 4, 0, 15, 8],
  [9, 0, 5, 7, 2, 4, 10, 15, 14, 1, 11, 12, 6, 8, 3, 13],
  [2, 12, 6, 10, 0, 11, 8, 3, 4, 13, 7, 5, 15, 14, 1, 9],
  [12, 5, 1, 15, 14, 13, 4, 10, 0, 7, 6, 3, 9, 2, 8, 11],
  [13, 11, 7, 14, 12, 1, 3, 9, 5, 0, 15, 4, 8, 6, 2, 10],
  [6, 15, 14, 9, 11, 3, 0, 8, 12, 2, 13, 7, 1, 4, 10, 5],
  [10, 2, 8, 4, 7, 6, 1, 5, 15, 11, 9, 14, 3, 12, 13, 0],
];
const R = [32, 24, 16, 63].map(BigInt);
const B64 = BigInt(64);
const rotr = (x: bigint, n: bigint) => ((x >> n) | (x << (B64 - n))) & MASK;

function compress(h: bigint[], block: Uint8Array, t: number, last: boolean) {
  const m: bigint[] = [];
  const dv = new DataView(block.buffer, block.byteOffset, 128);
  for (let i = 0; i < 16; i++) m.push(dv.getBigUint64(i * 8, true));
  const v = [...h, ...IV];
  v[12] ^= BigInt(t);
  if (last) v[14] ^= MASK;
  const G = (a: number, b: number, c: number, d: number, x: bigint, y: bigint) => {
    v[a] = (v[a] + v[b] + x) & MASK;
    v[d] = rotr(v[d] ^ v[a], R[0]);
    v[c] = (v[c] + v[d]) & MASK;
    v[b] = rotr(v[b] ^ v[c], R[1]);
    v[a] = (v[a] + v[b] + y) & MASK;
    v[d] = rotr(v[d] ^ v[a], R[2]);
    v[c] = (v[c] + v[d]) & MASK;
    v[b] = rotr(v[b] ^ v[c], R[3]);
  };
  for (let r = 0; r < 12; r++) {
    const s = SIGMA[r % 10];
    G(0, 4, 8, 12, m[s[0]], m[s[1]]);
    G(1, 5, 9, 13, m[s[2]], m[s[3]]);
    G(2, 6, 10, 14, m[s[4]], m[s[5]]);
    G(3, 7, 11, 15, m[s[6]], m[s[7]]);
    G(0, 5, 10, 15, m[s[8]], m[s[9]]);
    G(1, 6, 11, 12, m[s[10]], m[s[11]]);
    G(2, 7, 8, 13, m[s[12]], m[s[13]]);
    G(3, 4, 9, 14, m[s[14]], m[s[15]]);
  }
  for (let i = 0; i < 8; i++) h[i] ^= v[i] ^ v[i + 8];
}

/** The digest of bytes, size bytes long. */
export function blake2b(bytes: Uint8Array, size = 64): Uint8Array {
  const h = IV.slice();
  h[0] ^= BigInt(0x01010000 ^ size);
  const blocks = Math.max(1, Math.ceil(bytes.length / 128));
  for (let b = 0; b < blocks; b++) {
    const block = new Uint8Array(128);
    block.set(bytes.subarray(b * 128, (b + 1) * 128));
    const last = b === blocks - 1;
    compress(h, block, last ? bytes.length : (b + 1) * 128, last);
  }
  const out = new Uint8Array(64), dv = new DataView(out.buffer);
  h.forEach((x, i) => dv.setBigUint64(i * 8, x, true));
  return out.slice(0, size);
}
