// The about pages' code, loaded only when one is opened: they carry the docs and their motion, which the game never
// needs. A way out of the game starts the load as the game plays out, so the page is there when it ends.
type Page = () => Promise<{ default: React.ComponentType }>;

export const loadLayout: Page = () => import("@/app/about/layout");

export const PAGES = {
  "/about": () => import("@/app/about"),
  "/about/research": () => import("@/app/about/research"),
  "/about/design": () => import("@/app/about/design"),
  "/about/building": () => import("@/app/about/building"),
} satisfies Record<string, Page>;

/** Starts loading an about page's code, by its address. Any other address is left alone. */
export function preload(href: string) {
  const page = PAGES[href.split(/[?#]/)[0] as keyof typeof PAGES];
  if (!page) return;
  void loadLayout();
  void page();
}
