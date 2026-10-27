// The test build's Mind is private: one code opens it, or the player's own Anthropic key, and a cookie keeps it open.
export const ACCESS_COOKIE = "holos-access";
export const KEY_COOKIE = "holos-key";
/** Where a key that spans several workspaces asks, found when it was entered. */
export const WORKSPACE_COOKIE = "holos-workspace";

/** The model the Mind thinks with unless the Will picks another, which the player's key must be able to use. */
export const MIND_MODEL = "claude-opus-5-5";

// The models the Will can pick for the Mind, with dollars per million tokens from Anthropic's price list, 2026-10-25.
// Cache writes are the five-minute kind, 1.25 times input. Haiku's are for prompts under 100K tokens.
export const MIND_MODELS = {
  "claude-haiku-5-5": { name: "Haiku", input: 0.1, cacheRead: 0.01, cacheWrite: 0.125, output: 0.5 },
  "claude-sonnet-5-5": { name: "Sonnet", input: 2, cacheRead: 0.2, cacheWrite: 2.5, output: 10 },
  "claude-opus-5-5": { name: "Opus", input: 4, cacheRead: 0.2, cacheWrite: 5, output: 20 },
} as const;
export type MindModel = keyof typeof MIND_MODELS;

/** How hard the Mind thinks before it answers. */
export const EFFORTS = ["low", "medium", "high"] as const;
export type Effort = (typeof EFFORTS)[number];
export const MIND_EFFORT: Effort = "medium";

/** The Will's pick of model and effort, checked, since it comes from the browser. */
export function readMindPick(pick: unknown): { model: MindModel; effort: Effort } {
  const { model, effort } = (pick ?? {}) as { model?: unknown; effort?: unknown };
  return {
    model: typeof model === "string" && model in MIND_MODELS ? (model as MindModel) : MIND_MODEL,
    effort: EFFORTS.includes(effort as Effort) ? (effort as Effort) : MIND_EFFORT,
  };
}

/** What one answer from the Mind used, in tokens, as the server reads it from Anthropic, and the model that answered. */
export type Usage = { model: MindModel; input: number; cacheRead: number; cacheWrite: number; output: number };

/** What an answer cost in dollars, at its model's prices. */
export function costOf(u: Usage) {
  const price = MIND_MODELS[u.model] ?? MIND_MODELS[MIND_MODEL];
  return (u.input * price.input + u.cacheRead * price.cacheRead + u.cacheWrite * price.cacheWrite + u.output * price.output) / 1e6;
}

/** What opens the Mind in this browser: the player's own key, the code, or nothing. */
export type Access = "key" | "code" | null;

/** Why an entry didn't open the Mind: not a key Anthropic takes, no workspace it can ask in, or not the code. */
export type Wrong = "key" | "workspace" | "code";

/** What the Mind says when Anthropic turns the player's key away. */
export const BAD_KEY = "That key doesn’t open the Mind.";

/** What the Mind says when the player's key spans workspaces and Anthropic can't tell which one to bill. */
export const KEY_NEEDS_WORKSPACE = "That key spans several workspaces. Make a key for a single workspace.";

/** What the Mind says when the player's key opens it but its account has no credit to ask with. A key is checked by
 *  counting tokens, which is free, so this only shows once a question is asked. 2026-10-24. */
export const KEY_NEEDS_CREDIT = "That key’s account has no credit. Add a little at platform.claude.com/settings/billing.";

/**
 * Any Console API key: a workspace key (sk-ant-api), a personal key (sk-ant-usr) or a service account's. A claude.ai
 * login token (sk-ant-oat, sk-ant-ort) or an admin key can't stand in for one.
 */
export function isAnthropicKey(key: unknown): key is string {
  return typeof key === "string" && /^sk-ant-(?!oat|ort|admin)[a-z]+\d*-[\w-]{20,}$/.test(key);
}
