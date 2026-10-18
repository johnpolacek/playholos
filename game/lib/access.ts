// The test build's Mind is private: one code opens it, or the player's own Anthropic key, and a cookie keeps it open.
export const ACCESS_COOKIE = "holos-access";
export const KEY_COOKIE = "holos-key";

/** What the Mind says when Anthropic turns the player's key away. */
export const BAD_KEY = "That key doesn’t open the Mind.";

/** Only Console API keys. A claude.ai login token (sk-ant-oat) or an admin key can't stand in for one. */
export function isAnthropicKey(key: unknown): key is string {
  return typeof key === "string" && /^sk-ant-api\d+-[\w-]{20,}$/.test(key);
}

/** Whether a code opens the Mind. With no ACCESS_CODE set, only `next dev` is open. */
export function admits(code: string | undefined) {
  const access = process.env.ACCESS_CODE;
  if (!access) return process.env.NODE_ENV !== "production";
  return code === access;
}

/** Only same-site paths, so the unlock form can't send anyone elsewhere. */
export function safePath(path: unknown) {
  return typeof path === "string" && path.startsWith("/") && !path.startsWith("//") ? path : "/";
}
