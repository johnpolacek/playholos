import { env } from "cloudflare:workers";
import { access } from "./access";
import { earth } from "./earth";
import { known, leads } from "./leads";
import { mind } from "./mind";

// The Mind, held to MIND_LIMIT's questions a minute from one address. The dev server, where the evals ask a hundred in
// a row, is never held back.
async function limited(req: Request) {
  if (import.meta.env.DEV) return mind(req);
  const { success } = await env.MIND_LIMIT.limit({ key: req.headers.get("cf-connecting-ip") ?? "" });
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
  "POST /api/mind": limited,
};

export default {
  async fetch(req) {
    const route = ROUTES[`${req.method} ${new URL(req.url).pathname}`];
    return route ? route(req) : Response.json({ error: "Not found." }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
