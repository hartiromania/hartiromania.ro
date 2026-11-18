// Letter model trained on the site's own texts (see scripts/language-model/train.mjs).
//
// For a word it answers two questions:
// - how likely is each next letter, given the two before it (average log-probability);
// - how many of its three-letter groups never occur in real text (unseen share).
// Real Romanian or English words score high on the first and near zero on the second.
import model from "./language-model.json" with { type: "json" };

const trigrams: Record<string, number> = model.trigrams;

// Counts derived once from the trigram table: pairs, single letters and their contexts.
const pairs: Record<string, number> = {};
const pairContexts: Record<string, number> = {};
const letters: Record<string, number> = {};
const letterContexts: Record<string, number> = {};
let total = 0;
for (const [key, count] of Object.entries(trigrams)) {
  pairs[key.slice(1)] = (pairs[key.slice(1)] ?? 0) + count;
  pairContexts[key.slice(0, 2)] = (pairContexts[key.slice(0, 2)] ?? 0) + count;
  letters[key[2]] = (letters[key[2]] ?? 0) + count;
  letterContexts[key[1]] = (letterContexts[key[1]] ?? 0) + count;
  total += count;
}

const ALPHABET_SIZE = 28; // a-z, word start, word end

// Interpolated probability of letter c after a, b: mostly the three-letter evidence,
// backed by two-letter and single-letter evidence for groups the corpus is thin on.
function probability(a: string, b: string, c: string): number {
  const tri = (trigrams[a + b + c] ?? 0) / (pairContexts[a + b] || 1);
  const bi = (pairs[b + c] ?? 0) / (letterContexts[b] || 1);
  const uni = ((letters[c] ?? 0) + 1) / (total + ALPHABET_SIZE);
  return 0.6 * tri + 0.3 * bi + 0.1 * uni;
}

export interface WordStats {
  /** Average log-probability per letter; real words are around -1.5 to -3. */
  average: number;
  /** Share of three-letter groups never seen in real text (0 to 1). */
  unseen: number;
}

/** `word` must be lowercase a-z, without diacritics. */
export function wordStats(word: string): WordStats {
  const chars = `^^${word}$`;
  let sum = 0;
  let unseen = 0;
  const steps = chars.length - 2;
  for (let i = 0; i < steps; i++) {
    sum += Math.log(probability(chars[i], chars[i + 1], chars[i + 2]));
    if (!trigrams[chars.slice(i, i + 3)]) unseen++;
  }
  return { average: sum / steps, unseen: unseen / steps };
}
