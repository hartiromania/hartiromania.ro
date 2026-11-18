import { test } from "node:test";
import assert from "node:assert/strict";

import { newCode, newToken, hashToken, hashCode, sameHash } from "./tokens.ts";

const SECRET = "test-secret-with-enough-length-0123456789";

test("codes are 6 digits", () => {
  for (let i = 0; i < 200; i++) assert.match(newCode(), /^\d{6}$/);
});

test("tokens are long and unique", () => {
  const a = newToken();
  const b = newToken();
  assert.ok(a.length >= 40);
  assert.notEqual(a, b);
});

test("hashes are stable and never contain the input", () => {
  const token = newToken();
  assert.equal(hashToken(token), hashToken(token));
  assert.ok(!hashToken(token).includes(token));
  assert.equal(hashCode("123456", SECRET), hashCode("123456", SECRET));
  assert.notEqual(hashCode("123456", SECRET), hashCode("123456", `${SECRET}x`));
});

test("sameHash compares in constant time and handles different lengths", () => {
  const h = hashCode("654321", SECRET);
  assert.equal(sameHash(h, hashCode("654321", SECRET)), true);
  assert.equal(sameHash(h, hashCode("654320", SECRET)), false);
  assert.equal(sameHash(h, "short"), false);
});
