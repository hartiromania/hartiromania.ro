import { test } from "node:test";
import assert from "node:assert/strict";

import { analyzeMessage, type ContactInput, type BotSignals } from "./spam-score.ts";

const humanSignals: BotSignals = {
  honeypot: false,
  elapsedMs: 45_000,
  turnstile: "passed",
  emailDomain: "ok",
};

function check(input: ContactInput, signals: BotSignals = humanSignals) {
  return analyzeMessage(input, signals);
}

test("random-string bot message is suspect even when the bot checks pass", () => {
  const result = check({
    name: "pVrWyZkADOffKkYhEDHH",
    email: "upum.e.fe.ti.ba.578@gmail.com",
    subject: "sTnpUimWcKqFiFvAsgQo",
    message: "ytOtKrgEQwpdndUXQBMk",
  });
  assert.equal(result.verdict, "suspect");
  assert.ok(result.score >= 90, `score ${result.score}`);
});

test("lowercase gibberish is suspect", () => {
  const result = check({
    name: "xqzvbnmrt",
    email: "xqzvbnmrt@mail.com",
    subject: "salut",
    message: "kjhdsfkjh sdkfjhsd",
  });
  assert.equal(result.verdict, "suspect");
});

test("keyboard mashing is suspect even when Turnstile passes", () => {
  const result = check({
    name: "sfasfa",
    email: "alex@google.com",
    subject: "sdfsfsdf",
    message: "sfasfas",
  });
  assert.equal(result.verdict, "suspect", `score ${result.score}: ${result.reasons.join("; ")}`);
});

const gibberish: ContactInput[] = [
  { name: "John", email: "andrei@iancu.com", subject: "Test xjj", message: "svjbsd sdsb sdg" },
  { name: "Maria", email: "maria@gmail.com", subject: "hello", message: "qwpo zxkq mnbv trwq" },
  { name: "dfgdfg", email: "dfg@yahoo.com", subject: "fghfgh", message: "jkljkl hjkhjk" },
  { name: "Ana", email: "ana@gmail.com", subject: "Info", message: "ghj" },
];

for (const input of gibberish) {
  test(`gibberish is suspect: "${input.message}"`, () => {
    const result = check(input);
    assert.equal(result.verdict, "suspect", `score ${result.score}: ${result.reasons.join("; ")}`);
  });
}

test("SEO pitch with a link is suspect", () => {
  const result = check({
    name: "Mike",
    email: "mike@agency.com",
    subject: "Website ranking",
    message:
      "Hello, I noticed your website is not ranking on Google. We offer SEO services and backlinks at a low price. Reply for a free audit https://seo.example.com",
  });
  assert.equal(result.verdict, "suspect");
});

test("message made only of links is suspect", () => {
  const result = check({
    name: "Anna",
    email: "anna@mail.com",
    subject: "info",
    message: "https://bit.ly/abc https://cheap.example.com/x",
  });
  assert.equal(result.verdict, "suspect");
});

test("message in a foreign script is suspect", () => {
  const result = check({
    name: "Иван",
    email: "ivan@mail.ru",
    subject: "Привет",
    message: "Лучшие предложения только сегодня для вас",
  });
  assert.equal(result.verdict, "suspect");
});

test("filled honeypot alone makes the message suspect", () => {
  const result = check(
    {
      name: "Ion Popescu",
      email: "ion.popescu@yahoo.com",
      subject: "Comandă",
      message: "Bună ziua, aș dori o hartă.",
    },
    { ...humanSignals, honeypot: true },
  );
  assert.equal(result.verdict, "suspect");
});

const humans: ContactInput[] = [
  {
    name: "Ion Popescu",
    email: "ion.popescu@yahoo.com",
    subject: "Comandă hartă",
    message:
      "Bună ziua, aș dori să știu dacă harta România Mare se poate livra în Cluj. Mulțumesc!",
  },
  { name: "Maria", email: "maria85@gmail.com", subject: "Preț", message: "Cât costă harta mare?" },
  {
    name: "andrei",
    email: "andrei_m@outlook.com",
    subject: "intrebare",
    message: "salut, mai aveti harta dacia in stoc?",
  },
  {
    name: "John Smith",
    email: "john@example.co.uk",
    subject: "Shipping to UK",
    message: "Hi, do you ship maps to the UK? Thanks",
  },
  { name: "Elena", email: "elena@gmail.com", subject: "Mulțumesc", message: "ok mersi" },
  {
    name: "Wojciech Szczepański",
    email: "wojtek@wp.pl",
    subject: "Order",
    message:
      "Hello, I would like to buy the big historical map of Romania. Is shipping to Poland possible?",
  },
  {
    name: "Gheorghe",
    email: "ghita.vasile@yahoo.com",
    subject: "harta",
    message: "buna seara as vrea harta cu judetele vechi pt bunicul meu, cat costa cu transport?",
  },
  {
    name: "Cristina",
    email: "cristina@srl-design.ro",
    subject: "Factură SRL",
    message: "Bună, putem primi factură pe firmă? CUI RO123456, SRL din Iași.",
  },
  {
    name: "Mihai Ionescu",
    email: "mihai@firma.ro",
    subject: "Colaborare",
    message:
      "Salut! Avem o librărie în Brașov și ne-ar interesa să vindem hărțile voastre. Putem vorbi la telefon?",
  },
];

for (const input of humans) {
  test(`real message is ok: "${input.message}"`, () => {
    const result = check(input);
    assert.equal(result.verdict, "ok", `score ${result.score}: ${result.reasons.join("; ")}`);
  });
}

test("real message stays ok when Turnstile is not configured", () => {
  const result = check(humans[0], { ...humanSignals, turnstile: "skipped" });
  assert.equal(result.verdict, "ok");
});

test("every point added comes with a reason", () => {
  const result = check({
    name: "pVrWyZkADOffKkYhEDHH",
    email: "upum.e.fe.ti.ba.578@gmail.com",
    subject: "sTnpUimWcKqFiFvAsgQo",
    message: "ytOtKrgEQwpdndUXQBMk",
  });
  assert.ok(result.reasons.length >= 3);
});

// Broad sample: real messages in several languages and lengths, and typed nonsense.
const signals = humanSignals;
const realMessages = [
  "Salut",
  "Preț?",
  "Aveți harta Daciei?",
  "pls call me 0745123456",
  "Guten Tag, ich möchte eine Karte bestellen",
  "Jó napot, szeretnék egy térképet rendelni",
  "Buongiorno, vorrei comprare la mappa",
  "cand ajunge comanda mea nr 1234?",
  "Doresc factura pe PFA",
];
const nonsense = [
  "asdasd",
  "qweqwe",
  "lkjlkj ewrwer",
  "dsfgsdfgsdfg",
  "Hello sdfsdf jhgjhg",
  "zzzzzz",
];
const base = { name: "Ion", email: "ion@gmail.com", subject: "Mesaj" };

for (const message of realMessages) {
  test(`real message stays ok: "${message}"`, () => {
    assert.equal(analyzeMessage({ ...base, message }, signals).verdict, "ok");
  });
}
for (const message of nonsense) {
  test(`nonsense is suspect: "${message}"`, () => {
    assert.equal(analyzeMessage({ ...base, message }, signals).verdict, "suspect");
  });
}
