// The things the Mind is told of our queue, in order, each said once. 2026-11-08.
import test from "node:test";
import assert from "node:assert/strict";
import { nextNote, queueNotes } from "./queue.ts";

const proxima = { star: "Proxima Centauri", unknown: "Whether it kept any air, or is bare rock.", builds: [{ name: "Infrared Telescope", how: "Opens the 15 m Mirror." }] };

test("nothing queued, nothing said", () => {
  assert.deepEqual(queueNotes({ builds: [], short: 5, mysteries: [proxima] }), []);
});

test("compute short comes first, and names Thought Fields where it stands", () => {
  const notes = queueNotes({ builds: ["All-Sky Watch", "Laser Sail Array"], short: 3.55, mysteries: [proxima], fields: { last: "Laser Sail Array", sooner: 79.3 } });
  assert.deepEqual(notes.map((n) => n.key), ["short", "mystery:Proxima Centauri", "sail"]);
  assert.equal(notes[0].facts, "our compute is overloaded by 355%. Adding Thought Fields first in line would grow our compute, bringing our last build, the Laser Sail Array, about 79 Years sooner.");
  assert.match(queueNotes({ builds: ["Probe Yard", "Thought Fields"], short: 1, mysteries: [] })[0].facts, /Moving Thought Fields first/);
  assert.equal(queueNotes({ builds: ["Probe Yard"], short: 0.4, mysteries: [] }).length, 0);
});

test("a mystery a queued build answers is not said", () => {
  assert.equal(queueNotes({ builds: ["Infrared Telescope"], short: 0, mysteries: [proxima] }).length, 0);
  assert.match(queueNotes({ builds: ["Probe Yard"], short: 0, mysteries: [proxima] })[0].facts, /^nothing queued would tell us whether it kept any air, or is bare rock at Proxima Centauri\. The Infrared Telescope would\.$/);
});

test("each said once, and again only after it stops being true", () => {
  const q = { builds: ["Laser Sail Array"], short: 2, mysteries: [] };
  assert.equal(nextNote(q, []).note?.key, "short");
  assert.equal(nextNote(q, ["short"]).note?.key, "sail");
  assert.equal(nextNote(q, ["short", "sail"]).note, null);
  assert.deepEqual(nextNote({ ...q, short: 0 }, ["short", "sail"]).said, ["sail"]);
});
