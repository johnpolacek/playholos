import { regime } from "./regime.mjs";
import { CHECKS } from "../game/evals/mind/checks.mjs";

// What code can tell about a captured screen, the same answer every run: its layout, measured in the page, and its
// words, read off it. scripts/capture.mjs runs both on every shot. The critic and the editor judge what code can't.
// 2026-11-08.

/** Runs in the page. Every visible piece of text, and every layout fault code can see, at this width. */
export function measure({ touch, minTarget, minFont }) {
  const vw = innerWidth, vh = innerHeight;
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
  };
  const shown = (el) => {
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none" || Number(s.opacity) === 0) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  // Seen now, not scrolled away inside its panel or off the page.
  const inView = (el) => {
    const r = el.getBoundingClientRect();
    if (r.bottom <= 0 || r.right <= 0 || r.top >= vh || r.left >= vw) return false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (/(hidden|auto|scroll|clip)/.test(s.overflow + s.overflowX + s.overflowY)) {
        const q = p.getBoundingClientRect();
        if (r.bottom <= q.top || r.top >= q.bottom || r.right <= q.left || r.left >= q.right) return false;
      }
    }
    return true;
  };
  const own = (el) =>
    [...el.childNodes]
      .filter((n) => n.nodeType === 3)
      .map((n) => n.textContent)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim();
  const label = (el) => (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().slice(0, 80);
  const tappable = (el) => el.matches("button, a[href], input, select, textarea, [role=button], [role=tab], [role=link]");

  // Contrast, against the first solid background behind the text. Text over a canvas or an image is skipped.
  const rgb = (c) => (c.match(/[\d.]+/g) || []).map(Number);
  const lum = ([r, g, b]) => {
    const f = (v) => ((v /= 255) <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const behind = (el) => {
    for (let p = el; p; p = p.parentElement) {
      const s = getComputedStyle(p);
      if (s.backgroundImage !== "none") return null;
      const c = rgb(s.backgroundColor);
      if (c.length >= 3 && (c[3] ?? 1) >= 0.95) return c;
    }
    return rgb(getComputedStyle(document.body).backgroundColor);
  };

  const texts = [];
  const faults = [];
  const fault = (rule, el, note) => faults.push({ rule, text: label(el), note, ...box(el) });
  for (const el of document.body.querySelectorAll("*")) {
    if (!shown(el) || ["SCRIPT", "STYLE", "NOSCRIPT", "SVG"].includes(el.tagName) || el.closest("svg")) continue;
    const t = own(el);
    const tap = tappable(el);
    const view = inView(el);
    if (t && /[A-Za-z]/.test(t)) {
      const kind = tap ? "button" : /^H[1-6]$/.test(el.tagName) ? "heading" : "text";
      texts.push({ text: t, kind, view, ...box(el) });
      if (!view) continue;
      const s = getComputedStyle(el);
      const size = parseFloat(s.fontSize);
      if (size < minFont) fault("tiny text", el, `${size}px`);
      // Cut off: wider or taller than its box, where the box hides the rest.
      if ((el.scrollWidth > el.clientWidth + 2 && s.overflowX !== "visible") || (el.scrollHeight > el.clientHeight + 2 && s.overflowY === "hidden"))
        fault("clipped", el, `${el.scrollWidth}×${el.scrollHeight} in ${el.clientWidth}×${el.clientHeight}`);
      if (s.textOverflow === "ellipsis" && el.scrollWidth > el.clientWidth + 1) fault("clipped", el, "cut to an ellipsis");
      const fg = rgb(s.color), bg = behind(el);
      if (bg && fg.length >= 3 && (fg[3] ?? 1) >= 0.95) {
        const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
        const ratio = (a + 0.05) / (b + 0.05);
        const large = size >= 24 || (size >= 18.66 && Number(s.fontWeight) >= 700);
        if (ratio < (large ? 3 : 4.5)) fault("low contrast", el, `${ratio.toFixed(1)} to 1`);
      }
    }
    if (tap && view) {
      const r = el.getBoundingClientRect();
      if (touch && (r.width < minTarget || r.height < minTarget)) fault("small target", el, `${Math.round(r.width)}×${Math.round(r.height)}`);
      if (r.left < -1 || r.right > vw + 1) fault("off screen", el, "runs past the edge");
      // Covered: something else is on top at its middle.
      const cx = Math.min(vw - 1, Math.max(0, r.left + r.width / 2)), cy = Math.min(vh - 1, Math.max(0, r.top + r.height / 2));
      const top = document.elementFromPoint(cx, cy);
      // A row in a list that scrolls, passing under the tab bar at the fold, is the fold, not a fault: it scrolls into
      // view. Two such were flagged as covered on 2026-11-08. One under a bar in a box that can't scroll still is.
      const scrolls = (n) => {
        for (let p = n.parentElement; p; p = p.parentElement) {
          const o = getComputedStyle(p).overflowY;
          if ((o === "auto" || o === "scroll") && p.scrollHeight > p.clientHeight + 1) return true;
        }
        return document.scrollingElement.scrollHeight > vh + 1;
      };
      const fold = top && top.closest("nav") && !el.closest("nav") && scrolls(el);
      if (top && !fold && !el.contains(top) && !top.contains(el)) fault("covered", el, `under ${top.tagName.toLowerCase()}${top.className && typeof top.className === "string" ? "." + top.className.split(" ")[0] : ""}`);
    }
  }
  if (document.scrollingElement.scrollWidth > vw + 1) faults.push({ rule: "page scrolls sideways", text: "", note: `${document.scrollingElement.scrollWidth}px wide`, x: 0, y: 0, w: vw, h: 0 });
  // One fault a rule and element: a nested span repeats its parent's.
  const seen = new Set();
  return {
    texts: texts.filter((x) => (seen.has("t" + x.text + x.y) ? false : seen.add("t" + x.text + x.y))),
    faults: faults.filter((f) => (seen.has(f.rule + f.text + f.x + f.y) ? false : seen.add(f.rule + f.text + f.x + f.y))),
  };
}

// The words, by code. The Mind's own rules hold for every line on screen, and each kind of text has a length it
// should fit. The limits live in the regime's audit, a first guess set 2026-11-08, to tune as runs come in.
const SCREEN_RULES = ["says I", "semicolon", "em dash", "jargon", "says AU", "names a model"];
const RULES = CHECKS.filter((c) => SCREEN_RULES.includes(c.name));
export const LIMITS = regime().audit?.limits ?? { button: 6, heading: 8, sentence: 25 };
const words = (s) => s.split(/\s+/).filter(Boolean).length;
const sentences = (s) => s.split(/(?<=[.!?])\s+/).filter((x) => x.trim());

/** Every line on screen that breaks a language rule. */
export function language(texts) {
  const out = [];
  for (const t of texts) {
    // Real words people sent, quoted, keep their own I and me.
    // An en dash between numbers, a range like 0.03–0.7%, is how every screen gives one.
    const ours = t.text.replace(/“[^”]*”|"[^"]*"/g, "").replace(/(\d)\s?–\s?(\d)/g, "$1-$2");
    for (const c of RULES) if (c.test(ours, {})) out.push({ rule: c.name, text: t.text.slice(0, 160) });
    // A sign is never a mind until seen: it might be one, never would. m:238.
    // Only a claim, like “would be a mind” or “it would be minds”, not “we would start the Halo Survey” beside minds.
    if (/\bwould be\b[^.]{0,30}\bminds?\b/i.test(t.text)) out.push({ rule: "would be a mind", text: t.text.slice(0, 160) });
    // Humans are we and us, never they. m:106.
    if (/\b(humans|humanity|people)\b[^.]*\bthey\b/i.test(t.text)) out.push({ rule: "humans are they", text: t.text.slice(0, 160) });
    if (t.kind === "button" && words(t.text.replace(/›/g, "")) > LIMITS.button) out.push({ rule: "long button", text: t.text, note: `${words(t.text)} words` });
    if (t.kind === "heading" && words(t.text) > LIMITS.heading) out.push({ rule: "long heading", text: t.text, note: `${words(t.text)} words` });
    for (const s of sentences(t.text)) if (words(s) > LIMITS.sentence) out.push({ rule: "long sentence", text: s.slice(0, 160), note: `${words(s)} words` });
  }
  const seen = new Set();
  // A button's arrow, ›, makes it no new line.
  return out.filter((x) => {
    const k = x.rule + x.text.replace(/\s*›\s*$/, "");
    return seen.has(k) ? false : seen.add(k);
  });
}
