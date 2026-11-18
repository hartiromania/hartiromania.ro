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
