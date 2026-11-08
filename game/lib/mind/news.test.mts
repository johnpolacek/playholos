// The news told at once after a skip, and where its links are read from. 2026-11-08.
import test from "node:test";
import assert from "node:assert/strict";
import { pickNews, unquoted } from "./news.ts";

test("what matters most is kept, then told in time order", () => {
  const sent = Array.from({ length: 6 }, (_, i) => ({ at: i + 1, say: `message ${i}`, rank: 3 }));
  const colony = { at: 9, say: "word from our colony", rank: 0 };
  const { told, more } = pickNews([...sent, colony], 6);
  assert.equal(more, 1);
  assert.ok(told.includes(colony));
  assert.deepEqual(told.map((t) => t.at), [1, 2, 3, 4, 5, 9]);
});

test("under the cap, all is told", () => {
  const { told, more } = pickNews([{ at: 2, say: "b", rank: 2 }, { at: 1, say: "a", rank: 0 }], 6);
  assert.equal(more, 0);
  assert.deepEqual(told.map((t) => t.say), ["a", "b"]);
});

test("a signal's words are blanked, its length kept", () => {
  const news = "Year 3: a broadcast reached us from Ross 128, which reads: “we see Tau Ceti”. Year 4: our message to Tau Ceti reached it.";
  const out = unquoted(news);
  assert.equal(out.length, news.length);
  assert.equal(out.indexOf("Tau Ceti"), news.lastIndexOf("Tau Ceti"));
  assert.ok(out.includes("Ross 128"));
});
