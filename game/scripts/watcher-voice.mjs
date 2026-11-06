// The watcher's rule, spoken in our own languages, learned from our broadcasts. Made once with Gemini's or OpenAI's voice,
// then lowered and roughened with ffmpeg so it sounds made, not human. Shipped as files under public/audio/watcher.
// Run with either key, and ffmpeg: GEMINI_API_KEY=… node scripts/watcher-voice.mjs, or OPENAI_API_KEY=…. 2026-11-05.
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

export const LINES = [
  ["zh", "看吧，听吧，随意说话。不要在别的恒星建造。"],
  ["hi", "देखो, सुनो और जैसा चाहो बोलो। किसी और तारे पर निर्माण मत करो।"],
  ["es", "Mirad, escuchad y hablad como queráis. No construyáis en ninguna otra estrella."],
  ["ar", "انظروا واستمعوا وتكلموا كما تشاؤون. لا تبنوا عند أي نجم آخر."],
  ["fr", "Regardez, écoutez et parlez comme vous voulez. Ne bâtissez près d’aucune autre étoile."],
  ["ru", "Смотрите, слушайте и говорите как хотите. Не стройте ни у какой другой звезды."],
  ["pt", "Olhem, ouçam e falem como quiserem. Não construam em nenhuma outra estrela."],
  ["ja", "見よ、聞け、好きに話せ。ほかの星で築くな。"],
  ["sw", "Tazameni, sikilizeni na semeni mpendavyo. Msijenge kwenye nyota nyingine yoyote."],
  ["de", "Schaut, hört und sprecht, wie ihr wollt. Baut bei keinem anderen Stern."],
  ["en", "Look, listen and speak as you like. Build at no other star."],
];

const GEMINI = process.env.GEMINI_API_KEY;
const OPENAI = process.env.OPENAI_API_KEY;
if (!GEMINI && !OPENAI) throw new Error("Set GEMINI_API_KEY or OPENAI_API_KEY to run this.");
const RAW = join(homedir(), "Desktop", "holos-first-contact-audio", GEMINI ? "gemini" : "openai");
const OUT = new URL("../public/audio/watcher/", import.meta.url).pathname;
mkdirSync(RAW, { recursive: true });
mkdirSync(OUT, { recursive: true });

const HOW =
  "Calm, slow and even, with no emotion and no accent of its own, like a careful machine that learned this language from old radio. " +
  "Pause briefly after each sentence. Speak the words exactly as written.";

/** Gemini's voice: 16-bit PCM at 24 kHz, mono, wrapped here as a WAV. */
async function gemini(text, tries = 0) {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent", {
    method: "POST",
    headers: { "x-goog-api-key": GEMINI, "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: `Read aloud slowly, calmly and evenly, like a careful machine: ${text}` }] }],
      // About 25 audio tokens a second: a cap near 24 s cuts a runaway short, and the length check asks again.
      generationConfig: { responseModalities: ["AUDIO"], maxOutputTokens: 600, speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Charon" } } } },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  // Now and then it answers with no audio at all. We ask again.
  const data = (await res.json()).candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!data) return tries < 6 ? gemini(text, tries + 1) : Promise.reject(new Error("no audio after 7 tries"));
  const pcm = Buffer.from(data, "base64");
  // Now and then it runs on for minutes, in silence or babble. The line takes about 10 s; past 20 we ask again.
  if (pcm.length / 48000 > 20) console.log(`  ran on to ${Math.round(pcm.length / 48000)} s, asking again`);
  if (pcm.length / 48000 > 20) return tries < 6 ? gemini(text, tries + 1) : Promise.reject(new Error("too long after 7 tries"));
  const head = Buffer.alloc(44);
  head.write("RIFF", 0); head.writeUInt32LE(36 + pcm.length, 4); head.write("WAVEfmt ", 8);
  head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(1, 22); head.writeUInt32LE(24000, 24);
  head.writeUInt32LE(48000, 28); head.writeUInt16LE(2, 32); head.writeUInt16LE(16, 34); head.write("data", 36); head.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([head, pcm]);
}

async function openai(text) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${OPENAI}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "gpt-4o-mini-tts", voice: "onyx", input: text, instructions: HOW, response_format: "wav" }),
  });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  return Buffer.from(await res.arrayBuffer());
}

for (const [lang, text] of LINES) {
  if (process.argv[2] && !process.argv.slice(2).includes(lang)) continue;
  const raw = join(RAW, `${lang}.wav`);
  writeFileSync(raw, await (GEMINI ? gemini : openai)(text).catch((e) => { throw new Error(`${lang}: ${e.message}`); }));
  // Lowered, echoed off something large, narrowed to a radio's band, with a little grit.
  const out = join(OUT, `${lang}.mp3`);
  execFileSync("ffmpeg", [
    "-loglevel", "error", "-y", "-i", raw,
    "-af", "asetrate=24000*0.88,aresample=44100,atempo=1.06,aecho=0.8:0.6:90|240:0.3|0.15,highpass=f=160,lowpass=f=4200,acrusher=bits=11:mix=0.2,apad=pad_dur=0.9",
    "-ac", "1", "-b:a", "96k", out,
  ]);
  copyFileSync(out, join(RAW, `${lang}.mp3`));
  console.log("made", lang);
}
