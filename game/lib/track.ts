import { EVENT_NAMES, type EventName } from "@/lib/events";

// How people play, one anonymous row an event: what happened, a short detail such as a build's name, and the Year. No
// cookie, no name, no words from the Mind's talk. Only playholos.com sends. A game on our own machine, by npm run play
// or a playtest, sends nothing, so our tests never count as players, and no one's local game reports to us unasked.
// Global Privacy Control turns it off, and so does marking a browser as ours. 2026-11-08.

export const LIVE = typeof location !== "undefined" && /^(www\.)?playholos\.com$/.test(location.hostname);
const PLAYER = "holos-player";

const ME = "holos-me";

// Our own browsers send nothing either: playholos.com/?me marks one as ours, and ?me=0 unmarks it. 2026-11-08.
function mine() {
  try {
    const me = new URLSearchParams(location.search).get("me");
    if (me === "0") localStorage.removeItem(ME);
    else if (me !== null) localStorage.setItem(ME, "1");
    return localStorage.getItem(ME) === "1";
  } catch {
    return false;
  }
}

function off() {
  if (!LIVE || mine()) return true;
  return (navigator as Navigator & { globalPrivacyControl?: boolean }).globalPrivacyControl === true;
}

/** A random id for this browser, so one player's events read as one path. Not tied to anything else. */
function player() {
  try {
    let id = localStorage.getItem(PLAYER);
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem(PLAYER, id);
    }
    return id;
  } catch {
    return "";
  }
}

/** Notes one event. Never throws and never waits. */
export function track(name: EventName, detail = "", year: number | null = null) {
  if (off() || !EVENT_NAMES.includes(name)) return;
  try {
    const body = JSON.stringify({ name, detail: detail.slice(0, 96), year, player: player() });
    const blob = new Blob([body], { type: "application/json" });
    if (!navigator.sendBeacon?.("/api/event", blob)) void fetch("/api/event", { method: "POST", body, keepalive: true }).catch(() => undefined);
  } catch {
    // Tracking never gets in the way of play.
  }
}

/** Sends a player's note from the menu, with where they were. Only playholos.com and the dev server offer it. True once
 *  it is kept. 2026-11-08. */
export async function sendFeedback(text: string, screen: string, year: number | null) {
  try {
    const res = await fetch("/api/feedback", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, screen, year, player: player() }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
