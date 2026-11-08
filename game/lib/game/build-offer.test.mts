// The build line the Mind ends an offer with, with its place in our queue or without. 2026-11-08.
import test from "node:test";
import assert from "node:assert/strict";
import { readBuildOffer } from "./build-offer.ts";

test("a build line, with a place and without", () => {
  assert.deepEqual(readBuildOffer("Do it.\n\n[[build Thought Fields]]"), { words: "Do it.", name: "Thought Fields" });
  assert.deepEqual(readBuildOffer("Do it.\n\n[[build Thought Fields | 1]]"), { words: "Do it.", name: "Thought Fields", place: 1 });
  assert.deepEqual(readBuildOffer("Do it. [[build 15 m Mirror|3]] "), { words: "Do it.", name: "15 m Mirror", place: 3 });
  assert.deepEqual(readBuildOffer("Do it.\n[[build Thought"), { words: "Do it.", name: null });
});
