import { env } from "cloudflare:workers";

// A player's note from the menu, kept as a row in Analytics Engine beside the events: the player's random id as the
// index, "feedback", the screen, the country and the note as blobs, the Year as a double. Three a minute from one
// address. pnpm events lists them, and the daily check reads them. The dev server keeps nothing. 2026-11-08.

export const NOTE_MAX = 1000;

export async function feedback(req: Request) {
  if (req.headers.get("origin") !== new URL(req.url).origin) return Response.json({ error: "Forbidden." }, { status: 403 });
  if (Number(req.headers.get("content-length") ?? 0) > 4096) return Response.json({ error: "Too long." }, { status: 413 });
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const text = typeof body?.text === "string" ? body.text.trim().slice(0, NOTE_MAX) : "";
  if (!text) return Response.json({ error: "Empty." }, { status: 400 });
  if (import.meta.env.DEV || !env.EVENTS) return Response.json({ ok: true });
  const { success } = await env.FEEDBACK_LIMIT.limit({ key: req.headers.get("cf-connecting-ip") ?? "" });
  if (!success) return Response.json({ error: "Too many notes. Wait a minute." }, { status: 429 });
  const screen = typeof body?.screen === "string" ? body.screen.slice(0, 96) : "";
  const player = typeof body?.player === "string" ? body.player.slice(0, 40) : "";
  const year = typeof body?.year === "number" && Number.isFinite(body.year) ? body.year : -1;
  const country = (req as Request & { cf?: { country?: string } }).cf?.country ?? "";
  env.EVENTS.writeDataPoint({ indexes: [player], blobs: ["feedback", screen, country, text], doubles: [year] });
  return Response.json({ ok: true });
}
