import { inPool, loadWorld } from "@/lib/sim/world";
import { earthKnows } from "@/lib/sim/knowledge";

// The worlds Earth's planet hunters have felt by Year 0, through the knowledge wall: measured, never who lives there.
export async function GET(req: Request) {
  const seed = Number(new URL(req.url).searchParams.get("seed"));
  if (!inPool(seed)) return Response.json({ error: "No such game." }, { status: 404 });
  return Response.json(earthKnows(await loadWorld(seed), 0).felt);
}
