// The test build's Mind is private: one code opens it, or the player's own Anthropic key, and a cookie keeps it open.
export const ACCESS_COOKIE = "holos-access";
export const KEY_COOKIE = "holos-key";

/** What opens the Mind in this browser: the player's own key, the code, or nothing. */
export type Access = "key" | "code" | null;

/** What the Mind says when Anthropic turns the player's key away. */
export const BAD_KEY = "That key doesn’t open the Mind.";

/** Only Console API keys. A claude.ai login token (sk-ant-oat) or an admin key can't stand in for one. */
export function isAnthropicKey(key: unknown): key is string {
  return typeof key === "string" && /^sk-ant-api\d+-[\w-]{20,}$/.test(key);
}
