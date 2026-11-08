import { env } from "cloudflare:workers";
import { allowance } from "./allowance";
import { earn, PASS_COOKIE, PASS_DAYS, readPass, siteKey } from "./pass";
import { ACCESS_COOKIE, type Access, isAnthropicKey, KEY_COOKIE, MIND_MODEL, WORKSPACE_COOKIE, type Wrong } from "@/lib/access";

// The cookies that open the Mind. The page can't read them, so it asks here: GET says what opens the Mind, POST opens
// it with a key, the code or a Turnstile pass, and DELETE forgets the key.

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

async function opens(jar: Map<string, string>): Promise<Access> {
  if (isAnthropicKey(jar.get(KEY_COOKIE))) return "key";
  if (admits(jar.get(ACCESS_COOKIE))) return "code";
  return (await readPass(jar.get(PASS_COOKIE))) ? "free" : null;
}

/** The key a question to the Mind spends: the player's own, ours behind the code, or null while it is locked. On the
 *  dev server, the CLI Mind asks for its prompt with none, and spends none. 2026-10-30. */
export async function apiKeyFor(req: Request): Promise<{ key: string; pass?: string } | null> {
  if (import.meta.env.DEV && req.headers.get("x-holos-cli")) return { key: "" };
  const jar = cookies(req);
  const theirs = jar.get(KEY_COOKIE);
  if (isAnthropicKey(theirs)) return { key: theirs };
  if (admits(jar.get(ACCESS_COOKIE))) return { key: env.ANTHROPIC_API_KEY ?? "" };
  // A pass spends ours too, up to the allowance, which the Mind checks before it asks. 2026-11-08.
  const pass = await readPass(jar.get(PASS_COOKIE));
  return pass ? { key: env.ANTHROPIC_API_KEY ?? "", pass } : null;
}

/** The workspace the player's key asks in, when it spans several. */
export function workspaceFor(req: Request) {
  const jar = cookies(req);
  return isAnthropicKey(jar.get(KEY_COOKIE)) ? jar.get(WORKSPACE_COOKIE) : undefined;
}

const ANTHROPIC = "https://api.anthropic.com/v1";

function heads(key: string, workspace?: string): HeadersInit {
  return { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json", ...(workspace && { "anthropic-workspace-id": workspace }) };
}

/** Counting a word's tokens is free, so it tests a key without spending the player's money. */
function tries(key: string, workspace?: string) {
  const body = JSON.stringify({ model: MIND_MODEL, messages: [{ role: "user", content: "Hello" }] });
  return fetch(`${ANTHROPIC}/messages/count_tokens`, { method: "POST", headers: heads(key, workspace), body });
}

/**
 * Asks Anthropic whether the key opens the Mind, and where to ask with it. A workspace key or a key made for one
 * workspace answers as it is. A personal or service account key that spans workspaces must name one on every call, so
 * we list its workspaces and keep the first it can ask in. If Anthropic can't be reached, the key is kept untested and
 * the Mind finds out on its first question.
 */
async function place(key: string): Promise<{ workspace: string | null } | { wrong: Wrong }> {
  try {
    const plain = await tries(key);
    if (plain.ok) return { workspace: null };
    if (plain.status === 401 || plain.status === 403) return { wrong: "key" };
    if (plain.status !== 400 || !(await plain.text()).includes("anthropic-workspace-id")) return { workspace: null };
    const listed = await fetch(`${ANTHROPIC}/organizations/workspaces?include_default=true&limit=20`, { headers: heads(key) });
    if (!listed.ok) return { wrong: "workspace" };
    const { data } = (await listed.json()) as { data: { id: string }[] };
    for (const { id } of data) if ((await tries(key, id)).ok) return { workspace: id };
    return { wrong: "workspace" };
  } catch {
    return { workspace: null };
  }
}

function kept(req: Request, name: string, value: string | null, age = YEAR) {
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return `${name}=${encodeURIComponent(value ?? "")}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${value === null ? 0 : age}${secure}`;
}

/** What GET tells the page: what opens the Mind, the Turnstile key when a pass is on offer, and on a pass, the
 *  questions left today and whether today's dollars are spent. */
async function state(jar: Map<string, string>) {
  const open = await opens(jar);
  const free = siteKey();
  if (open !== "free") return { open, ...(open === null && free && { free }) };
  const pass = (await readPass(jar.get(PASS_COOKIE)))!;
  return { open, ...(await allowance(env).left(pass)) };
}

function answer(body: Awaited<ReturnType<typeof state>> & { wrong?: Wrong }, set: string[] = []) {
  const res = Response.json(body);
  for (const cookie of set) res.headers.append("Set-Cookie", cookie);
  return res;
}

export async function access(req: Request) {
  const jar = cookies(req);
  if (req.method === "GET") return answer(await state(jar));
  // Only this site's own page may change what opens the Mind.
  if (req.headers.get("origin") !== new URL(req.url).origin) return Response.json({ error: "Forbidden." }, { status: 403 });
  if (req.method === "DELETE") {
    jar.delete(KEY_COOKIE);
    return answer(await state(jar), [kept(req, KEY_COOKIE, null), kept(req, WORKSPACE_COOKIE, null)]);
  }
  const { entry, turnstile } = (await req.json().catch(() => ({}))) as { entry?: unknown; turnstile?: unknown };
  // A Turnstile check passed on the page: a pass, kept a week. 2026-11-08.
  if (typeof turnstile === "string") {
    const pass = await earn(turnstile, req.headers.get("cf-connecting-ip"));
    if (!pass) return answer({ ...(await state(jar)), wrong: "check" });
    jar.set(PASS_COOKIE, pass);
    return answer(await state(jar), [kept(req, PASS_COOKIE, pass, PASS_DAYS * 86400)]);
  }
  const typed = typeof entry === "string" ? entry.trim() : "";
  if (typed.startsWith("sk-ant-")) {
    if (!isAnthropicKey(typed)) return answer({ ...(await state(jar)), wrong: "key" });
    const placed = await place(typed);
    if ("wrong" in placed) return answer({ ...(await state(jar)), wrong: placed.wrong });
    return answer({ open: "key" }, [kept(req, KEY_COOKIE, typed), kept(req, WORKSPACE_COOKIE, placed.workspace), kept(req, ACCESS_COOKIE, null)]);
  }
  if (!admits(typed)) return answer({ ...(await state(jar)), wrong: "code" });
  return answer({ open: "code" }, [kept(req, ACCESS_COOKIE, typed), kept(req, KEY_COOKIE, null), kept(req, WORKSPACE_COOKIE, null)]);
}
