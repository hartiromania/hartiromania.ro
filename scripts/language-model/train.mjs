// Trains the letter model used by the contact-form spam filter (lib/contact/language-model.ts).
//
// It reads real text: every blog article (Zenblog), every product and promo text (Sanity)
// and a short English sample, then counts every group of three letters inside words
// ("har", "art", "rta"...). Real words are built from groups that occur all the time;
// random typing ("wwefewrg", "svjbsd") is built from groups that almost never occur.
//
// Run again whenever the site has a lot of new text:
//   node --env-file=.env.local scripts/language-model/train.mjs
import { readFileSync, writeFileSync } from "node:fs";

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

// "^^" marks the start of a word and "$" its end, so "harta" gives
// ^^h ^ha har art rta ta$.
const trigrams = {};
for (const word of all) {
  const chars = `^^${word}$`;
  for (let i = 0; i < chars.length - 2; i++) {
    const key = chars.slice(i, i + 3);
    trigrams[key] = (trigrams[key] ?? 0) + 1;
  }
}

const sorted = Object.fromEntries(Object.entries(trigrams).sort(([a], [b]) => (a < b ? -1 : 1)));
writeFileSync(OUTPUT, `${JSON.stringify({ words: all.length, trigrams: sorted })}\n`);
console.log(`trained on ${all.length} words, ${Object.keys(sorted).length} letter groups`);
