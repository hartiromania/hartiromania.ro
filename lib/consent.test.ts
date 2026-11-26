import assert from "node:assert/strict";
import { test } from "node:test";

import { CONSENT_MAX_AGE_MS, CONSENT_VERSION, formatConsent, parseConsent } from "./consent.ts";

const now = 1_800_000_000_000;
const id = "3b241101-e2bb-4255-8caf-4136c566a962";

test("a fresh, current choice round-trips through the cookie value", () => {
  const consent = { id, statistics: true, version: CONSENT_VERSION, savedAt: now - 1000 };
  assert.deepEqual(parseConsent(formatConsent(consent), now), consent);
});

test("a refusal is a valid choice too", () => {
  const raw = formatConsent({ id, statistics: false, version: CONSENT_VERSION, savedAt: now });
  assert.equal(parseConsent(raw, now)?.statistics, false);
});

test("missing, broken, outdated, expired or future choices ask again", () => {
  const raw = (parts: (string | number)[]) => parts.join(".");
  assert.equal(parseConsent(undefined, now), null);
  assert.equal(parseConsent("", now), null);
  assert.equal(parseConsent("garbage", now), null);
  assert.equal(parseConsent(raw(["not-an-id", CONSENT_VERSION, 1, now]), now), null);
  assert.equal(parseConsent(raw([id, CONSENT_VERSION, "yes", now]), now), null);
  assert.equal(parseConsent(raw([id, 0, 1, now]), now), null);
  assert.equal(
    parseConsent(raw([id, CONSENT_VERSION, 1, now - CONSENT_MAX_AGE_MS - 1]), now),
    null,
  );
  assert.equal(parseConsent(raw([id, CONSENT_VERSION, 1, now + 3_600_000]), now), null);
});
