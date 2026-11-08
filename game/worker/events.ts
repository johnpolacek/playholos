import { env } from "cloudflare:workers";
import { EVENT_NAMES } from "@/lib/events";

// Keeps one event from the page as a row in Analytics Engine: the player's random id as the index, the event, its
// detail and the country as blobs, the Year as a double. The dev server keeps nothing. Anything not on the list, or
// shaped wrong, is dropped without a word, since the page never waits on it. 2026-11-08.

const NAMES = new Set<string>(EVENT_NAMES);
const done = () => new Response(null, { status: 204 });

export async function events(req: Request) {
  if (import.meta.env.DEV || !env.EVENTS) return done();
  if (Number(req.headers.get("content-length") ?? 0) > 1024) return done();
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body.name !== "string" || !NAMES.has(body.name)) return done();
  const detail = typeof body.detail === "string" ? body.detail.slice(0, 96) : "";
  const player = typeof body.player === "string" ? body.player.slice(0, 40) : "";
  const year = typeof body.year === "number" && Number.isFinite(body.year) ? body.year : -1;
  const country = (req as Request & { cf?: { country?: string } }).cf?.country ?? "";
  env.EVENTS.writeDataPoint({ indexes: [player], blobs: [body.name, detail, country], doubles: [year] });
  return done();
}
