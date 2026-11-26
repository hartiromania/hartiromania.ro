import assert from "node:assert/strict";
import { test } from "node:test";

import { maskIp } from "./request-info.ts";

test("IP addresses lose the part that points to one person", () => {
  assert.equal(maskIp("86.120.45.211"), "86.120.45.0");
  assert.equal(maskIp("2a02:2f0e:5c10:a900:1d2:3e4f:5a6b:7c8d"), "2a02:2f0e:5c10::");
  assert.equal(maskIp("2a02:2f0e::1"), "2a02:2f0e::");
  assert.equal(maskIp(undefined), null);
  assert.equal(maskIp("not an ip"), null);
});
