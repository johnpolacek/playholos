import { env } from "cloudflare:workers";
import { ACCESS_COOKIE, type Access, isAnthropicKey, KEY_COOKIE } from "@/lib/access";

// The cookies that open the Mind. The page can't read them, so it asks here: GET says what opens the Mind, POST opens
// it with a key or the code, and DELETE forgets the key.

const YEAR = 60 * 60 * 24 * 365;

function cookies(req: Request) {
  const jar = new Map<string, string>();
  for (const part of req.headers.get("cookie")?.split(";") ?? []) {
    const at = part.indexOf("=");
    if (at > 0) jar.set(part.slice(0, at).trim(), decodeURIComponent(part.slice(at + 1).trim()));
  }
  return jar;
}

/** Whether a code opens the Mind. With no ACCESS_CODE set, only the dev server is open. */
function admits(code: string | undefined) {
  if (!env.ACCESS_CODE) return import.meta.env.DEV;
  return code === env.ACCESS_CODE;
}

function opens(jar: Map<string, string>): Access {
  if (isAnthropicKey(jar.get(KEY_COOKIE))) return "key";
  return admits(jar.get(ACCESS_COOKIE)) ? "code" : null;
}

/** The key a question to the Mind spends: the player's own, ours behind the code, or null while it is locked. */
export function apiKeyFor(req: Request) {
  const jar = cookies(req);
  const theirs = jar.get(KEY_COOKIE);
  if (isAnthropicKey(theirs)) return theirs;
  return admits(jar.get(ACCESS_COOKIE)) ? (env.ANTHROPIC_API_KEY ?? "") : null;
}

function kept(req: Request, name: string, value: string | null) {
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value ?? "")}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value === null ? 0 : YEAR}${secure}`;
}

function answer(body: { open: Access; wrong?: "key" | "code" }, set: string[] = []) {
  const res = Response.json(body);
  for (const cookie of set) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function access(req: Request) {
  const jar = cookies(req);
  if (req.method === "GET") return answer({ open: opens(jar) });
  // Only this site's own page may change what opens the Mind.
  if (req.headers.get("origin") !== new URL(req.url).origin) return Response.json({ error: "Forbidden." }, { status: 403 });
  if (req.method === "DELETE") {
    jar.delete(KEY_COOKIE);
    return answer({ open: opens(jar) }, [kept(req, KEY_COOKIE, null)]);
  }
  const { entry } = (await req.json().catch(() => ({}))) as { entry?: unknown };
  const typed = typeof entry === "string" ? entry.trim() : "";
  if (typed.startsWith("sk-ant-")) {
    if (!isAnthropicKey(typed)) return answer({ open: opens(jar), wrong: "key" });
    return answer({ open: "key" }, [kept(req, KEY_COOKIE, typed), kept(req, ACCESS_COOKIE, null)]);
  }
  if (!admits(typed)) return answer({ open: opens(jar), wrong: "code" });
  return answer({ open: "code" }, [kept(req, ACCESS_COOKIE, typed), kept(req, KEY_COOKIE, null)]);
}
