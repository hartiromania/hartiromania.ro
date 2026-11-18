// Decide whether a contact message was written by a person or by a bot.
//
// It reasons the way a careful reader would: does the text look like words in a real
// language, does it read like a sales pitch, do the name and the email look made up,
// did the browser checks pass? Each clue adds or removes points with a reason; at
// SUSPECT_FROM points or more the message is marked suspect. Nothing is thrown away:
// the caller still delivers suspect messages, only labelled.
//
// The core is a letter model trained on the site's own texts (lib/contact/language-model.ts):
// every word is checked against how real Romanian and English words are built, so random
// typing is recognised in any shape, not only in known patterns. Each non-word adds points,
// so even a message that is only partly nonsense is caught.
//
// Pure functions, fast (well under a millisecond per message), run in Next and `node --test`.

import { wordStats } from "./language-model.ts";

export interface ContactInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface BotSignals {
  /** The hidden field that only bots fill in. */
  honeypot: boolean;
  /** Time between the form appearing and being sent; null when the browser did not send it. */
  elapsedMs: number | null;
  /** "skipped" = Turnstile keys are not configured (local development). */
  turnstile: "passed" | "failed" | "missing" | "skipped";
  /** Result of the DNS check on the email domain; "unknown" when the lookup timed out. */
  emailDomain: "ok" | "invalid" | "disposable" | "unknown";
}

export interface Analysis {
  score: number;
  verdict: "ok" | "suspect";
  reasons: string[];
}

export const SUSPECT_FROM = 50;

// Common Romanian and English words, without diacritics. A real message almost always
// contains at least one of them, however short or oddly written it is.
const COMMON_WORDS = new Set(
  `si de la in cu pe pentru va vă sa se ma mi imi ne nu da un o una unei unui care ce cum unde cand
  cat cate mai daca as am ai are avem aveti au este e sunt fi fost poate puteti pot vreau vrem doresc
  dori dorim buna ziua seara salut salutare multumesc mersi multumim va rog rog pret preturi costa
  harta harti hartii carte carti vedere vederi comanda comand livrare stoc colet plata mare mic
  romania noi voi eu tu el ea lor lui ei acum azi ok bine super frumos
  srl pfa cui cnp tva nr tel sms emag olx iban bcr brd ing cec
  the and to you your is are do does i a an of for in on at it hi hello hey thanks thank please can
  could would have has what how when where why with my me we our this that buy price ship order`.split(
    /\s+/,
  ),
);

// Phrases from sales pitches and scams that real customers of a map shop do not write.
const SPAM_PATTERNS: RegExp[] = [
  /\bseo\b/i,
  /backlinks?/i,
  /\branking\b|\brank (higher|first)/i,
  /first page of google/i,
  /guest post/i,
  /link building/i,
  /(web|website) design services|marketing services|digital marketing/i,
  /increase (your )?(traffic|sales)/i,
  /\byour (website|site)\b/i,
  /crypto|bitcoin|\bbtc\b|forex|binary options/i,
  /casino|betting|\bslots?\b|jackpot/i,
  /\bloans?\b|credit offer|investment opportunit/i,
  /viagra|cialis|\bpharmacy\b/i,
  /\bporn|\bescort|\bsex\b|dating site|hot (girls|singles)/i,
  /make money|earn money|earn \$|passive income/i,
];

const URL_PATTERN = /https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|org|xyz|top|ru|io|info|biz)\/\S*/gi;

function plain(text: string): string {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function words(text: string): string[] {
  return plain(text).match(/[\p{L}]+/gu) ?? [];
}

// Letters hit by sliding a hand along one keyboard row ("sfasfa"): such strings can look
// pronounceable, so they get their own check. Only the middle and bottom rows; the top
// row holds most vowels and real words fit in it.
function isKeyboardMash(word: string): boolean {
  return word.length >= 5 && /^([asdfghjkl]+|[zxcvbnm]+)$/.test(word);
}

/**
 * How much a token counts as a non-word: 1 = certainly, 0.5 = probably (a short 3-letter
 * token, or a capitalised word that may be a foreign name), 0 = a word.
 */
function nonWordWeight(token: string, isFirst: boolean): number {
  const letters = token.replace(/[^\p{L}]/gu, "");
  const word = plain(letters);
  if (word.length < 3 || COMMON_WORDS.has(word) || !/^[a-z]+$/.test(word)) return 0;
  const caseFlips = (letters.slice(1).match(/(?<=\p{Ll})\p{Lu}/gu) ?? []).length;
  const { average, unseen } = wordStats(word);
  const nonWord = caseFlips >= 3 || isKeyboardMash(word) || unseen >= 0.4 || average < -4.5;
  if (!nonWord) return 0;
  const looksLikeName = !isFirst && /^\p{Lu}\p{Ll}+$/u.test(letters);
  return word.length === 3 || looksLikeName ? 0.5 : 1;
}

interface NonWords {
  /** Weighted number of non-words (see nonWordWeight). */
  count: number;
  /** Share of the letters that belong to non-words (0 to 1). */
  share: number;
  /** True when every token of 3+ letters is a non-word. */
  all: boolean;
  list: string[];
}

function findNonWords(text: string): NonWords {
  const tokens = text.split(/[\s,.;:!?()"'„”/-]+/).filter(Boolean);
  let count = 0;
  let bad = 0;
  let total = 0;
  let judged = 0;
  const list: string[] = [];
  tokens.forEach((token, i) => {
    const length = token.replace(/[^\p{L}]/gu, "").length;
    const weight = nonWordWeight(token, i === 0);
    total += length;
    if (length >= 3) judged++;
    if (weight > 0) {
      count += weight;
      bad += length * weight;
      list.push(token);
    }
  });
  return { count, share: total ? bad / total : 0, all: judged > 0 && list.length === judged, list };
}

export function analyzeMessage(input: ContactInput, signals: BotSignals): Analysis {
  let score = 0;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    reasons.push(`${points > 0 ? "+" : ""}${points} ${reason}`);
  };

  const { name, email, subject, message } = input;
  const all = `${subject} ${message}`;

  // --- Browser checks ---
  if (signals.honeypot) add(60, "a completat câmpul ascuns (capcana pentru boți)");
  if (signals.elapsedMs === null) add(20, "browserul nu a trimis timpul de completare");
  else if (signals.elapsedMs < 3000) add(35, "formular completat în sub 3 secunde");
  if (signals.turnstile === "failed") add(40, "verificarea anti-bot Cloudflare a eșuat");
  if (signals.turnstile === "missing") add(30, "lipsește verificarea anti-bot Cloudflare");
  if (signals.emailDomain === "invalid") add(40, "domeniul emailului nu primește emailuri");
  if (signals.emailDomain === "disposable") add(30, "adresă de email de unică folosință");

  // --- Made-up identity ---
  if (findNonWords(name).share >= 0.5) add(35, "numele pare generat aleator");
  else if (/\d|https?:|www\./i.test(name)) add(20, "numele conține cifre sau linkuri");
  const [local = "", domain = ""] = email.toLowerCase().split("@");
  if (/^(gmail|googlemail)\.com$/.test(domain) && (local.match(/\./g) ?? []).length >= 3) {
    add(35, "adresă Gmail cu multe puncte (truc folosit de boți)");
  }

  // --- The text itself: every non-word counts, plus how much of the text they make up ---
  const nonWords = findNonWords(all);
  const emptyMessage = findNonWords(message).all;
  const nonsense = nonWords.count >= 1 || emptyMessage;
  if (emptyMessage) add(30, "mesajul nu are niciun cuvânt real");
  if (nonWords.count > 0) {
    const points = Math.round(Math.min(80, 45 * nonWords.count + 40 * nonWords.share));
    const shown = nonWords.list.slice(0, 5).join(", ");
    add(points, `cuvinte fără sens în subiect/mesaj: ${shown}`);
  }

  const spamHits = SPAM_PATTERNS.filter((p) => p.test(all)).length;
  if (spamHits > 0) {
    const points = spamHits >= 3 ? 55 : spamHits === 2 ? 40 : 20;
    add(points, `${spamHits} expresii tipice de spam/reclamă`);
  }

  const links = message.match(URL_PATTERN) ?? [];
  const withoutLinks = message.replace(/\S*(https?:\/\/|www\.)\S*/gi, "").trim();
  if (/\[url=|<a\s+href/i.test(message)) add(40, "linkuri ascunse în cod (BBCode/HTML)");
  const onlyLinks = links.length > 0 && withoutLinks.length < 20;
  if (onlyLinks) add(55, "mesajul e aproape doar linkuri");
  else if (links.length >= 2) add(30, `${links.length} linkuri în mesaj`);
  else if (links.length === 1) add(10, "un link în mesaj");

  const letters = all.match(/\p{L}/gu) ?? [];
  const foreign =
    all.match(
      /[\p{Script=Cyrillic}\p{Script=Han}\p{Script=Arabic}\p{Script=Hangul}\p{Script=Thai}]/gu,
    ) ?? [];
  if (letters.length > 0 && foreign.length / letters.length > 0.3) {
    add(45, "scris într-un alfabet străin (chirilic/asiatic/arab)");
  }

  const messageWords = words(message);
  const knowsLanguage = words(all).some((w) => COMMON_WORDS.has(w));
  if (messageWords.length >= 2 && !knowsLanguage)
    add(15, "niciun cuvânt uzual românesc sau englezesc");

  const upper = message.match(/\p{Lu}/gu) ?? [];
  const msgLetters = message.match(/\p{L}/gu) ?? [];
  if (msgLetters.length >= 20 && upper.length / msgLetters.length > 0.8)
    add(10, "scris numai cu majuscule");

  // Test messages ("test", "testing", "lorem ipsum") are not spam, but not a real enquiry either.
  const testLike = /(test|teste|testing|lorem|ipsum)/i.test(all) || /^test/i.test(local);
  if (testLike) add(45, "pare un mesaj de test");

  const same = (a: string, b: string) => a.trim().length > 3 && plain(a).trim() === plain(b).trim();
  if (same(name, subject) || same(subject, message)) add(15, "câmpuri identice între ele");

  // --- Signs of a real person: only when no trap was hit and the message says something.
  // A person can pass Cloudflare and still type nonsense, so the bonuses need real content.
  if (!signals.honeypot && !nonsense && !testLike && !onlyLinks && spamHits === 0) {
    if (signals.turnstile === "passed") add(-10, "verificarea anti-bot Cloudflare a trecut");
  }
  if (!signals.honeypot && !nonsense && !testLike && spamHits === 0 && links.length === 0) {
    if (knowsLanguage) add(-10, "folosește cuvinte uzuale dintr-o limbă reală");
    if (/[ăâîșțşţ]/i.test(all)) add(-10, "folosește diacritice românești");
  }

  score = Math.max(0, Math.min(100, score));
  return { score, verdict: score >= SUSPECT_FROM ? "suspect" : "ok", reasons };
}
