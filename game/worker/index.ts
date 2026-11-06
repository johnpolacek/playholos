import { env } from "cloudflare:workers";
import type { UIMessage } from "ai";
import { NEWS } from "@/lib/mind/news";
import { access } from "./access";
import { earth } from "./earth";
import { known, leads, next } from "./leads";
import { mind } from "./mind";

// The Mind, held to MIND_LIMIT's questions a minute from one address. The dev server, where the evals ask a hundred in
// a row, is never held back. News the Mind tells unasked counts against MIND_NEWS_LIMIT instead, so it never uses up
// our questions. A question dressed as news only lands in the smaller allowance. 2026-11-03.
async function limited(req: Request) {
  if (import.meta.env.DEV) return mind(req);
  const body = (await req.clone().json().catch(() => null)) as { messages?: UIMessage[] } | null;
  const asked = body?.messages?.findLast((m) => m.role === "user");
  const news = asked?.parts.some((p) => p.type === "text" && p.text.startsWith(NEWS));
  const { success } = await (news ? env.MIND_NEWS_LIMIT : env.MIND_LIMIT).limit({ key: req.headers.get("cf-connecting-ip") ?? "" });
  return success ? mind(req) : Response.json({ error: "Too many questions. Wait a minute." }, { status: 429 });
}

// The game's server. The built client is served as static files before this runs, so only /api/* lands here.
const ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "GET /api/access": access,
  "POST /api/access": access,
  "DELETE /api/access": access,
  "GET /api/earth": earth,
  "GET /api/leads": leads,
  "GET /api/known": known,
  "GET /api/next": next,
  "POST /api/known": known,
  "POST /api/next": next,
  "POST /api/mind": limited,
};

export default {
  async fetch(req) {
    const route = ROUTES[`${req.method} ${new URL(req.url).pathname}`];
    const res = await (route ? route(req) : Response.json({ error: "Not found." }, { status: 404 }));
    // A route that answers before reading the body, as a locked Mind does, leaves it unread. On the dev server that
    // breaks the link to the Worker, and a request beside it fails with "fetch failed". So we read what is left.
    // 2026-10-28.
    if (req.body && !req.bodyUsed) await req.arrayBuffer().catch(() => undefined);
    return res;
  },
} satisfies ExportedHandler<Env>;
