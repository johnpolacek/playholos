// The test build's Mind is private: one code opens it, and a cookie keeps it open.
export const ACCESS_COOKIE = "holos-access";

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
