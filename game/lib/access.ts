// The test build's Mind is private: one code opens it, or the player's own Anthropic key, and a cookie keeps it open.
export const ACCESS_COOKIE = "holos-access";
export const KEY_COOKIE = "holos-key";
/** Where a key that spans several workspaces asks, found when it was entered. */
export const WORKSPACE_COOKIE = "holos-workspace";

/** The model the Mind thinks with, which the player's key must be able to use. */
export const MIND_MODEL = "claude-opus-5-5";

/** What opens the Mind in this browser: the player's own key, the code, or nothing. */
export type Access = "key" | "code" | null;

/** Why an entry didn't open the Mind: not a key Anthropic takes, no workspace it can ask in, or not the code. */
export type Wrong = "key" | "workspace" | "code";

/** What the Mind says when Anthropic turns the player's key away. */
export const BAD_KEY = "That key doesn’t open the Mind.";

/** What the Mind says when the player's key spans workspaces and Anthropic can't tell which one to bill. */
export const KEY_NEEDS_WORKSPACE = "That key needs a workspace. Make one for a single workspace.";

/**
 * Any Console API key: a workspace key (sk-ant-api), a personal key (sk-ant-usr) or a service account's. A claude.ai
 * login token (sk-ant-oat, sk-ant-ort) or an admin key can't stand in for one.
 */
export function isAnthropicKey(key: unknown): key is string {
  return typeof key === "string" && /^sk-ant-(?!oat|ort|admin)[a-z]+\d*-[\w-]{20,}$/.test(key);
}
