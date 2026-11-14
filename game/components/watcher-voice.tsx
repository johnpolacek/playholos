import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { WATCHER_VOICE } from "@/lib/game/watcher-voice";

// First contact, heard: the watcher's voice in our own languages, one after another, its waveform drawn live from the
// sound as it plays. It was a line of text "in pictures" until a playtest, 2026-11-05: "we didn't make a big enough deal
// about first contact."

const AMBER = "#e0a24a";

export function WatcherVoice({ onClose }: { onClose(): void }) {
  // Waiting for us to listen (browsers play sound only after a tap), or on line i. Once all are heard, done.
  const [at, setAt] = useState<"wait" | number>("wait");
  const [done, setDone] = useState(false);
  // The first time through runs on from line to line. A line we pick plays alone.
  const auto = useRef(true);
  const now = useRef(-1);
  // The arrow keys reach pick through this, set after each render, so the key listener stays put.
  const step = useRef<(i: number) => void>(() => undefined);
  const canvas = useRef<HTMLCanvasElement>(null);
  const audio = useRef<HTMLAudioElement | null>(null);
  const ctx = useRef<AudioContext | null>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const gap = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    // Escape closes the voice only, not the lead page under it: caught first, and kept from it. The arrows step lines.
    const esc = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        if (now.current < 0) return;
        e.preventDefault();
        step.current(now.current + (e.key === "ArrowLeft" ? -1 : 1));
        return;
      }
      if (e.key !== "Escape") return;
      e.stopPropagation();
      onClose();
    };
    window.addEventListener("keydown", esc, true);
    return () => window.removeEventListener("keydown", esc, true);
  }, [onClose]);

  // All sound stops when the screen closes.
  useEffect(
    () => () => {
      clearTimeout(gap.current);
      audio.current?.pause();
      void ctx.current?.close().catch(() => undefined);
    },
    [],
  );

  const play = (i: number) => {
    const el = audio.current;
    if (!el) return;
    clearTimeout(gap.current);
    if (i >= WATCHER_VOICE.length) {
      auto.current = false;
      setDone(true);
      return;
    }
    now.current = i;
    setAt(i);
    el.src = `/audio/watcher/${WATCHER_VOICE[i].lang}.mp3`;
    void el.play().catch(() => setDone(true));
  };

  // A line we pick, by arrow or dot: it plays alone, and the run on stops.
  function pick(i: number) {
    if (i < 0 || i >= WATCHER_VOICE.length) return;
    auto.current = false;
    play(i);
  }

  useEffect(() => {
    step.current = pick;
  });

  const again = () => {
    auto.current = true;
    setDone(false);
    play(0);
  };

  const listen = () => {
    const el = new Audio();
    el.preload = "auto";
    el.onended = () => {
      if (auto.current) gap.current = setTimeout(() => play(now.current + 1), 700);
    };
    audio.current = el;
    try {
      const ac = new AudioContext();
      const node = ac.createAnalyser();
      node.fftSize = 2048;
      ac.createMediaElementSource(el).connect(node);
      node.connect(ac.destination);
      ctx.current = ac;
      analyser.current = node;
    } catch {
      // No Web Audio: the voice still plays, and the line rests flat.
    }
    play(0);
  };

  // The waveform: the voice's own shape, drawn each frame, with fading echoes of the frames before.
  useEffect(() => {
    const c = canvas.current;
    if (!c) return;
    const g = c.getContext("2d");
    if (!g) return;
    let frame = 0;
    const buf = new Uint8Array(2048);
    const draw = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = c.clientWidth;
      const h = c.clientHeight;
      if (c.width !== w * dpr || c.height !== h * dpr) {
        c.width = w * dpr;
        c.height = h * dpr;
      }
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      // The last frames fade rather than vanish, so the line leaves a glow behind it.
      g.globalCompositeOperation = "destination-out";
      g.fillStyle = "rgba(0,0,0,0.22)";
      g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "lighter";
      const node = analyser.current;
      if (node) node.getByteTimeDomainData(buf);
      else buf.fill(128);
      const t = performance.now() / 1000;
      g.strokeStyle = AMBER;
      g.lineWidth = 1.6;
      g.shadowColor = AMBER;
      g.shadowBlur = 10;
      g.beginPath();
      const n = 512;
      for (let k = 0; k < n; k++) {
        const x = (k / (n - 1)) * w;
        const v = (buf[Math.floor((k / n) * buf.length)] - 128) / 128;
        // Fade at both ends, and a faint carrier always alive, as a beam is before and after its words.
        const edge = Math.sin((Math.PI * k) / (n - 1));
        const hum = 0.012 * Math.sin(k * 0.21 + t * 3);
        const y = h / 2 + (v * 2.2 + hum) * edge * (h / 2) * 0.9;
        if (k) g.lineTo(x, y);
        else g.moveTo(x, y);
      }
      g.stroke();
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, []);

  const line = typeof at === "number" ? WATCHER_VOICE[at] : null;

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="The watcher’s voice" className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 px-4">
      <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 inline-flex h-9 items-center rounded-full border border-ink/40 px-4 font-mono text-[12px] tracking-[.12em] text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-black">
        Close ✕
      </button>
      <span className="font-mono text-[10.5px] tracking-[.16em] text-other uppercase">A voice from beyond our system</span>
      <canvas ref={canvas} className="mt-6 h-40 w-full max-w-3xl" aria-hidden />
      <div className="mt-6 flex min-h-[7.5rem] max-w-2xl flex-col items-center text-center">
        {at === "wait" ? (
          <>
            <p className="text-[15px] leading-snug text-page-ink2">It speaks in our own languages, learned from our broadcasts.</p>
            <button
              onClick={listen}
              className="mt-5 inline-flex h-10 items-center rounded-full bg-other px-6 text-[14px] font-medium text-black transition-[filter] hover:brightness-110"
            >
              Listen ›
            </button>
          </>
        ) : (
          line && (
            <>
              <span className="font-mono text-[10.5px] tracking-[.14em] text-muted">{line.name}</span>
              <p key={line.lang} lang={line.lang} dir={line.rtl ? "rtl" : "ltr"} className="mt-2 animate-voice motion-reduce:animate-none text-[22px] leading-snug text-ink">
                {line.text}
              </p>
            </>
          )
        )}
      </div>
      {typeof at === "number" && (
        <div className="mt-6 flex items-center gap-1">
          <button onClick={() => pick(at - 1)} disabled={at === 0} aria-label="The line before" className="px-2 text-[18px] text-muted hover:text-ink disabled:opacity-30">
            ‹
          </button>
          {WATCHER_VOICE.map((s, i) => (
            <button key={s.lang} onClick={() => pick(i)} aria-label={s.name} aria-current={i === at} className="group p-1">
              <span className={`block size-1.5 rounded-full transition-transform group-hover:scale-150 ${i === at ? "scale-150 bg-other" : "bg-track"}`} />
            </button>
          ))}
          <button
            onClick={() => pick(at + 1)}
            disabled={at === WATCHER_VOICE.length - 1}
            aria-label="The line after"
            className="px-2 text-[18px] text-muted hover:text-ink disabled:opacity-30"
          >
            ›
          </button>
        </div>
      )}
      {done && (
        <div className="mt-6 flex gap-4 text-[13px]">
          <button onClick={again} className="text-other hover:underline">
            Hear it again
          </button>
          <button onClick={onClose} className="text-ink hover:underline">
            Back to what we know ›
          </button>
        </div>
      )}
    </div>,
    document.body,
  );
}
