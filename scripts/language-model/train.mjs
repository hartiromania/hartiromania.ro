// Trains the letter model used by the contact-form spam filter (lib/contact/spam-score.ts).
//
// It reads real text: every blog article (Zenblog), every product and promo text (Sanity)
// and a short English sample, then counts which letter follows which inside words.
// Real words follow those habits; random keyboard strings ("svjbsd", "xjj") do not.
//
// Run again whenever the site has a lot of new text:
//   node --env-file=.env.local scripts/language-model/train.mjs
import { readFileSync, writeFileSync } from "node:fs";

const ALPHABET = "^abcdefghijklmnopqrstuvwxyz$"; // ^ = word start, $ = word end
const SMOOTHING = 0.1;
const OUTPUT = new URL("../../lib/contact/language-model.json", import.meta.url);

function words(text) {
  return (
    text
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .match(/[a-z]+/g) ?? []
  );
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, " ").replace(/&[a-z#0-9]+;/gi, " ");
}

async function blogText() {
  const blogId = process.env.ZENBLOG_BLOG_ID;
  if (!blogId) throw new Error("ZENBLOG_BLOG_ID missing (run with --env-file=.env.local)");
  const base = `https://www.zenblog.com/api/public/blogs/${blogId}/posts`;
  const list = await (await fetch(`${base}?limit=100`)).json();
  const texts = await Promise.all(
    list.data.map(async (post) => {
      const full = await (await fetch(`${base}/${post.slug}`)).json();
      return `${post.title} ${post.excerpt ?? ""} ${stripHtml(full.data?.html_content ?? "")}`;
    }),
  );
  console.log(`blog: ${texts.length} articles`);
  return texts.join(" ");
}

async function sanityText() {
  const project = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "kqgfquqs";
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const query = encodeURIComponent(
    `*[_type in ["product", "promoPackage"]]{title, description, longDescription, storyTitle, "story": pt::text(story), "specs": specifications[].value}`,
  );
  const url = `https://${project}.apicdn.sanity.io/v2025-02-19/data/query/${dataset}?query=${query}`;
  const { result } = await (await fetch(url)).json();
  console.log(`sanity: ${result.length} products and promos`);
  return result.map((doc) => Object.values(doc).flat().filter(Boolean).join(" ")).join(" ");
}

const corpus = [
  await blogText(),
  await sanityText(),
  readFileSync(new URL("english.txt", import.meta.url), "utf8"),
].join(" ");
const all = words(corpus);

// Count letter pairs, with word boundaries, then turn them into log-probabilities.
const size = ALPHABET.length;
const counts = Array.from({ length: size }, () => new Array(size).fill(0));
for (const word of all) {
  const chars = `^${word}$`;
  for (let i = 0; i < chars.length - 1; i++) {
    counts[ALPHABET.indexOf(chars[i])][ALPHABET.indexOf(chars[i + 1])]++;
  }
}
const logp = counts.map((row) => {
  const total = row.reduce((a, b) => a + b, 0) + SMOOTHING * size;
  return row.map((c) => Number(Math.log((c + SMOOTHING) / total).toFixed(2)));
});

// Calibrate: the score below which only ~1% of real words fall.
const score = (word) => {
  const chars = `^${word}$`;
  let sum = 0;
  for (let i = 0; i < chars.length - 1; i++) {
    sum += logp[ALPHABET.indexOf(chars[i])][ALPHABET.indexOf(chars[i + 1])];
  }
  return sum / (chars.length - 1);
};
const unique = [...new Set(all.filter((w) => w.length >= 3))];
const sorted = unique.map(score).sort((a, b) => a - b);
const threshold = Number(sorted[Math.floor(sorted.length * 0.01)].toFixed(2));

writeFileSync(OUTPUT, `${JSON.stringify({ alphabet: ALPHABET, threshold, logp })}\n`);
console.log(`trained on ${all.length} words (${unique.length} distinct), threshold ${threshold}`);
for (const sample of ["harta", "romania", "shipping", "thanks", "svjbsd", "sdsb", "sdg", "xjj"]) {
  console.log(`  ${sample.padEnd(10)} ${score(sample).toFixed(2)}`);
}
