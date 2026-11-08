import { env } from "cloudflare:workers";

// A pass opens the Mind on us, up to the allowance. It is earned once a week by passing Cloudflare Turnstile, which
// tells a person from a bot, and kept in a cookie signed with the Turnstile secret, so it can't be made up. The pass's
// random id is what the allowance counts a player by. With no Turnstile set up, there are no passes. 2026-11-08.

export const PASS_COOKIE = "holos-pass";
export const PASS_DAYS = 7;

// Cloudflare's test keys, which always pass, so the dev server needs no setup.
const TEST_SITE = "1x00000000000000000000AA";
const TEST_SECRET = "1x0000000000000000000000000000000AA";

const secret = () => env.TURNSTILE_SECRET || (import.meta.env.DEV ? TEST_SECRET : "");

/** The key the page shows the Turnstile check with, or null when passes are off. */
export function siteKey() {
  if (!secret()) return null;
  return env.TURNSTILE_SITE_KEY || (import.meta.env.DEV ? TEST_SITE : null);
}

const enc = new TextEncoder();
const b64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

async function sign(text: string) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return b64(await crypto.subtle.sign("HMAC", key, enc.encode(text)));
}

/** Asks Turnstile whether the check the page passed is real, and if so makes a pass. */
export async function earn(token: string, ip: string | null): Promise<string | null> {
  if (!siteKey() || !token) return null;
  const form = new FormData();
  form.append("secret", secret());
  form.append("response", token.slice(0, 2048));
  if (ip) form.append("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
    const { success } = (await res.json()) as { success?: boolean };
    if (!success) return null;
  } catch {
    return null;
  }
  const id = crypto.randomUUID();
  const until = Date.now() + PASS_DAYS * 864e5;
  return `${id}.${until}.${await sign(`${id}.${until}`)}`;
}

/** The pass's player id, if the cookie holds a pass we signed that hasn't run out. */
export async function readPass(cookie: string | undefined): Promise<string | null> {
  if (!cookie || !siteKey()) return null;
  const [id, until, mac] = cookie.split(".");
  if (!id || !until || !mac || !(Number(until) > Date.now())) return null;
  return (await sign(`${id}.${until}`)) === mac ? id : null;
}
