// The theme: System follows the phone, and Light or Dark override it. The choice lives in this browser. The root
// layout's script paints it before the first frame, so a reload never flashes the other theme.
export type Choice = "system" | "light" | "dark";
export type Scheme = "light" | "dark";

const KEY = "holos:theme";

/**
 * Sets the page's theme, and the browser's chrome to match. Light or Dark set `data-theme`, anything else clears
 * it. Self-contained, since the root layout inlines it as a script.
 */
export function paint(choice: string | null) {
  const chosen = choice === "light" || choice === "dark";
  if (chosen) document.documentElement.setAttribute("data-theme", choice);
  else document.documentElement.removeAttribute("data-theme");
  // The chrome's color is --paper: the chosen theme's, or both by media for the phone's. Only this sets
  // theme-color, since Next re-inserts its own on every navigation.
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => meta.remove());
  for (const scheme of chosen ? [choice] : ["light", "dark"]) {
    const meta = document.createElement("meta");
    meta.name = "theme-color";
    meta.content = scheme === "dark" ? "#121314" : "#fbfaf7";
    if (!chosen) meta.media = `(prefers-color-scheme: ${scheme})`;
    document.head.append(meta);
  }
}

export const themeScript = `(function(){var c;try{c=localStorage.getItem(${JSON.stringify(KEY)})}catch(e){};(${paint})(c)})()`;

export function loadChoice(): Choice {
  try {
    const c = localStorage.getItem(KEY);
    return c === "light" || c === "dark" ? c : "system";
  } catch {
    return "system";
  }
}

export function saveChoice(choice: Choice) {
  try {
    if (choice === "system") localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, choice);
  } catch {}
}
