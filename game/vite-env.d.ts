/// <reference types="vite/client" />

// The about pages' docs, rendered as the client is built. See vite.config.ts.
declare module "*.md?doc" {
  const doc: import("@/lib/about/docs").Rendered;
  export default doc;
}
declare module "*.md?stats" {
  export const sources: number;
  export const sections: number;
}
