// CPython's random.Random, exactly: Mersenne Twister, seeded from an int or a string as Python 3 seeds it.
// The calcs roll with it (calcs/seed.py, the mocks), so a roll made here matches the same roll made there.
// Tested against Python's own output in golden.json.
import { createHash } from "node:crypto";

const N = 624, M = 397;

export class PyRandom {
  private mt = new Uint32Array(N);
  private i = N + 1;

  constructor(seed: number | bigint | string) {
    this.initByArray(keyOf(seed));
  }

  private initGenrand(s: number) {
    const mt = this.mt;
    mt[0] = s >>> 0;
    for (let i = 1; i < N; i++) mt[i] = (Math.imul(1812433253, mt[i - 1] ^ (mt[i - 1] >>> 30)) + i) >>> 0;
    this.i = N;
  }

  private initByArray(key: number[]) {
    const mt = this.mt;
    this.initGenrand(19650218);
    let i = 1, j = 0;
    for (let k = Math.max(N, key.length); k > 0; k--) {
      mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1664525)) + key[j] + j) >>> 0;
      i++; j++;
      if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
      if (j >= key.length) j = 0;
    }
    for (let k = N - 1; k > 0; k--) {
      mt[i] = ((mt[i] ^ Math.imul(mt[i - 1] ^ (mt[i - 1] >>> 30), 1566083941)) - i) >>> 0;
      i++;
      if (i >= N) { mt[0] = mt[N - 1]; i = 1; }
    }
    mt[0] = 0x80000000;
  }

  private uint32(): number {
    const mt = this.mt;
    if (this.i >= N) {
      for (let k = 0; k < N; k++) {
        const y = (mt[k] & 0x80000000) | (mt[(k + 1) % N] & 0x7fffffff);
        mt[k] = mt[(k + M) % N] ^ (y >>> 1) ^ (y & 1 ? 0x9908b0df : 0);
      }
      this.i = 0;
    }
    let y = mt[this.i++];
    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;
    return y >>> 0;
  }

  /** A float in [0, 1), 53 bits, as Python's random() makes it. */
  random(): number {
    const a = this.uint32() >>> 5, b = this.uint32() >>> 6;
    return (a * 67108864 + b) / 9007199254740992;
  }

  /** One pick, as Python's choices(population, weights)[0]: cumulative weights and a right bisection. */
  choice<T>(population: readonly T[], weights: readonly number[]): T {
    const cum: number[] = [];
    let total = 0;
    for (const w of weights) cum.push((total += w));
    const r = this.random() * total;
    let lo = 0, hi = cum.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (r < cum[mid]) hi = mid;
      else lo = mid + 1;
    }
    return population[lo];
  }
}

const ZERO = BigInt(0), WORD = BigInt(0xffffffff), BITS = BigInt(32);     // no BigInt literals: the build targets ES2017

/** Python's seed key: a string is its UTF-8 bytes and their SHA-512, read as one big-endian integer. */
function keyOf(seed: number | bigint | string): number[] {
  let n: bigint;
  if (typeof seed === "string") {
    const bytes = Buffer.from(seed, "utf8");
    n = BigInt("0x" + Buffer.concat([bytes, createHash("sha512").update(bytes).digest()]).toString("hex"));
  } else {
    n = BigInt(seed);
    if (n < ZERO) n = -n;
  }
  const key: number[] = [];
  while (n > ZERO) {
    key.push(Number(n & WORD));
    n >>= BITS;
  }
  return key.length ? key : [0];
}
