#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";

// npx playholos: the game on your own machine, with no git and no clone. Downloads the repo from GitHub once, to
// ~/playholos or the folder named, then runs its npm run play, which installs what it needs and opens the game with
// the Mind answering on your Claude login. --update swaps in the newest copy. 2026-11-04.

const REPO = "johnpolacek/playholos";
/** The commit a downloaded copy came from, kept beside it so a later run can tell it is behind. */
const STAMP = ".playholos-version";
const win = process.platform === "win32";

const args = process.argv.slice(2);
const update = args.includes("--update");
const dir = path.resolve(args.find((a) => !a.startsWith("-")) ?? path.join(homedir(), "playholos"));

const [major, minor] = process.versions.node.split(".").map(Number);
if (major < 20 || (major === 20 && minor < 9)) {
  console.error(`Holos needs Node 20.9 or later. This is ${process.versions.node}.`);
  process.exit(1);
}

// Checked before the download, so a missing Claude Code doesn't cost a hundred megabytes first.
if (spawnSync("claude", ["--version"], { shell: win }).status !== 0) {
  console.error("Holos plays on your Claude login through Claude Code, and it isn't installed.");
  console.error("Install it from https://claude.com/claude-code, run claude once to log in, then npx playholos again.");
  process.exit(1);
}

/** The newest commit on main, or null when GitHub can't be reached. */
async function latest() {
  try {
    const res = await fetch(`https://api.github.com/repos/${REPO}/commits/main`, { headers: { accept: "application/vnd.github.sha" } });
    return res.ok ? (await res.text()).trim() : null;
  } catch {
    return null;
  }
}

/** Unpacks the repo at a commit into a folder, streamed through tar, which macOS, Linux and Windows 10 all carry. */
async function download(sha, into) {
  console.log(`Downloading Holos to ${into}, about 100 MB…`);
  const res = await fetch(`https://codeload.github.com/${REPO}/tar.gz/${sha}`);
  if (!res.ok || !res.body) throw new Error(`GitHub answered ${res.status}.`);
  mkdirSync(into, { recursive: true });
  const tar = spawn("tar", ["-xzf", "-", "--strip-components=1", "-C", into], { stdio: ["pipe", "inherit", "inherit"] });
  Readable.fromWeb(res.body).pipe(tar.stdin);
  await new Promise((done, fail) => tar.on("close", (code) => (code === 0 ? done() : fail(new Error(`tar stopped with ${code}.`)))));
  writeFileSync(path.join(into, STAMP), sha);
}

const ours = existsSync(path.join(dir, "scripts", "play.mjs"));
const git = existsSync(path.join(dir, ".git"));

try {
  if (!ours) {
    if (existsSync(dir) && readdirSync(dir).length) {
      console.error(`${dir} already holds something else. Name an empty folder: npx playholos <folder>`);
      process.exit(1);
    }
    await download((await latest()) ?? "main", dir);
  } else if (git) {
    // A clone, as a contributor keeps. git updates it, not us.
    if (update) console.log("This copy is a git clone. Run git pull in it to update.");
  } else {
    const sha = await latest();
    const have = existsSync(path.join(dir, STAMP)) ? readFileSync(path.join(dir, STAMP), "utf8").trim() : null;
    if (sha && sha !== have) {
      if (update) {
        // Into a folder beside it first, so a failed download leaves the old copy playable. Saves live in the browser.
        const next = `${dir}.next`;
        rmSync(next, { recursive: true, force: true });
        await download(sha, next);
        rmSync(dir, { recursive: true, force: true });
        renameSync(next, dir);
      } else {
        console.log("A newer Holos is out. npx playholos --update fetches it.");
      }
    }
  }
} catch (e) {
  console.error(`We couldn't download Holos. ${e.message}`);
  process.exit(1);
}

const play = spawn(process.execPath, ["scripts/play.mjs"], { cwd: dir, stdio: "inherit" });
play.on("close", (code) => process.exit(code ?? 0));
