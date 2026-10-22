import { access } from "./access";
import { earth } from "./earth";
import { known, leads } from "./leads";
import { mind } from "./mind";

// The game's server. The built client is served as static files before this runs, so only /api/* lands here.
const ROUTES: Record<string, (req: Request) => Promise<Response>> = {
  "GET /api/access": access,
  "POST /api/access": access,
  "DELETE /api/access": access,
  "GET /api/earth": earth,
  "GET /api/leads": leads,
  "GET /api/known": known,
  "POST /api/mind": mind,
};

export default {
  async fetch(req) {
    const route = ROUTES[`${req.method} ${new URL(req.url).pathname}`];
    return route ? route(req) : Response.json({ error: "Not found." }, { status: 404 });
  },
} satisfies ExportedHandler<Env>;
