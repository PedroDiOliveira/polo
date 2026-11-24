// A small deterministic generator (mulberry32): the same seed always draws the same round,
// which is what lets a shared link replay the exact questions a friend got.
export function seededRandom(seed: string): () => number {
  let state = hashSeed(seed)
  return () => {
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// FNV-1a: turns any seed text into a 32-bit start state.
function hashSeed(seed: string): number {
  let hash = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return hash >>> 0
}

const SEED_PATTERN = /^[a-z0-9]{4,12}$/

export function isSeed(value: string): boolean {
  return SEED_PATTERN.test(value)
}

export function newSeed(): string {
  return Math.floor(Math.random() * 36 ** 8)
    .toString(36)
    .padStart(8, '0')
}
