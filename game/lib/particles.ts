// A particle field: a canvas that reaches past a target element, its particles stepped on the GSAP ticker. Emitters run
// each frame while attached, and a particle may carry its own update. Tweens on the plain particle objects work too,
// since the ticker runs them before the field steps. It ticks only while it has something to draw. From animaxxing's
// particle field, with only the shapes the reactor and the about pages' Play draw.
import { gsap } from "@/lib/motion";

export type Shape = "dot" | "spark" | "square" | "star" | "outline";

export type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Radius for dots, half-width for squares, stroke width for sparks, ray length for stars, spread for outlines. */
  size: number;
  alpha: number;
  shape: Shape;
  rotation: number;
  /** Radians per second. */
  spin: number;
  /** Fraction of velocity kept after one second. 1 keeps it all. */
  drag: number;
  /** Pixels per second squared, downward positive. */
  gravity: number;
  /** Total seconds to live, or Infinity while a tween owns the particle. */
  life: number;
  age: number;
  /** Alpha falls to zero over the particle's life. */
  fade: boolean;
  /** Size falls to zero over the particle's life. */
  shrink: boolean;
  /** Sideways sway: amplitude in px/s and frequency in Hz. */
  wobble: number;
  wobbleFreq: number;
  phase: number;
  update?: (p: Particle) => void;
};

export type Box = { x: number; y: number; w: number; h: number };

const DEFAULTS: Omit<Particle, "x" | "y"> = {
  vx: 0,
  vy: 0,
  size: 2,
  alpha: 1,
  shape: "dot",
  rotation: 0,
  spin: 0,
  drag: 1,
  gravity: 0,
  life: 1,
  age: 0,
  fade: true,
  shrink: false,
  wobble: 0,
  wobbleFreq: 0,
  phase: 0,
};

/** Longest step the field takes, so a stalled tab does not fling everything off. */
const MAX_STEP = 0.05;

export class ParticleField {
  readonly particles: Particle[] = [];
  /** The target's rectangle, in canvas pixels. */
  readonly box: Box = { x: 0, y: 0, w: 0, h: 0 };
  /** The target's corner radius, at most half its height. */
  radius = 0;

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly target: HTMLElement;
  private readonly bleed: number;
  private readonly emitters = new Set<(dt: number) => void>();
  private color = "#fff";
  private time = 0;
  private width = 0;
  private height = 0;
  private running = false;

  constructor(canvas: HTMLCanvasElement, target: HTMLElement, bleed: number) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;
    this.target = target;
    this.bleed = bleed;
    this.sync();
  }

  /** Measures the target again and sizes the canvas around it, in the canvas's own text color. */
  sync() {
    const { offsetWidth: w, offsetHeight: h } = this.target;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = w + this.bleed * 2;
    this.height = h + this.bleed * 2;
    Object.assign(this.box, { x: this.bleed, y: this.bleed, w, h });
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.radius = Math.min(parseFloat(getComputedStyle(this.target).borderTopLeftRadius) || 0, w / 2, h / 2);
    this.color = getComputedStyle(this.canvas).color;
  }

  spawn(init: Partial<Particle> & { x: number; y: number }): Particle {
    const p: Particle = { ...DEFAULTS, ...init };
    this.particles.push(p);
    this.start();
    return p;
  }

  addEmitter(emitter: (dt: number) => void) {
    this.emitters.add(emitter);
    this.start();
  }

  removeEmitter(emitter: (dt: number) => void) {
    this.emitters.delete(emitter);
  }

  destroy() {
    this.stop();
    this.emitters.clear();
    this.particles.length = 0;
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  private start() {
    if (this.running) return;
    this.running = true;
    gsap.ticker.add(this.tick);
  }

  private stop() {
    this.running = false;
    gsap.ticker.remove(this.tick);
  }

  private readonly tick = (_time: number, deltaMs: number) => {
    const dt = Math.min(deltaMs / 1000, MAX_STEP);
    this.time += dt;
    for (const emitter of this.emitters) emitter(dt);
    this.step(dt);
    this.draw();
    if (!this.particles.length && !this.emitters.size) this.stop();
  };

  private step(dt: number) {
    const list = this.particles;
    let keep = 0;
    for (const p of list) {
      p.age += dt;
      if (p.age >= p.life) continue;
      if (p.drag !== 1) {
        const k = Math.pow(p.drag, dt);
        p.vx *= k;
        p.vy *= k;
      }
      p.vy += p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.wobble) p.x += Math.sin(this.time * p.wobbleFreq * Math.PI * 2 + p.phase) * p.wobble * dt;
      p.rotation += p.spin * dt;
      p.update?.(p);
      list[keep++] = p;
    }
    list.length = keep;
  }

  private draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    ctx.fillStyle = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineCap = "round";
    for (const p of this.particles) {
      const spent = p.life === Infinity ? 0 : p.age / p.life;
      const alpha = p.alpha * (p.fade ? 1 - spent : 1);
      const size = p.size * (p.shrink ? 1 - spent : 1);
      if (alpha <= 0.005 || size <= 0.05) continue;
      ctx.globalAlpha = Math.min(alpha, 1);
      const speed = Math.hypot(p.vx, p.vy);
      if (p.shape === "dot" || (p.shape === "spark" && speed < 1)) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === "spark") {
        // A streak trailing the direction of travel.
        const tail = Math.min(speed * 0.04, 18);
        ctx.lineWidth = size;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - (p.vx / speed) * tail, p.y - (p.vy / speed) * tail);
        ctx.stroke();
      } else if (p.shape === "square") {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillRect(-size, -size, size * 2, size * 2);
        ctx.restore();
      } else if (p.shape === "star") {
        // Four thin rays crossing at the center, like a glint off a lens.
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-size, 0);
        ctx.lineTo(size, 0);
        ctx.moveTo(0, -size);
        ctx.lineTo(0, size);
        ctx.stroke();
        ctx.restore();
      } else {
        // The target's outline, pushed out by the particle's size.
        const { x, y, w, h } = this.box;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x - size, y - size, w + size * 2, h + size * 2, this.radius + size);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  }
}

/** A point at `t` in [0, 1) on a rounded rectangle's outline, clockwise from the top left, with its outward normal. */
export function perimeterPoint(box: Box, radius: number, t: number) {
  const r = Math.min(radius, box.w / 2, box.h / 2);
  const { x, y, w, h } = box;
  const sw = w - 2 * r;
  const sh = h - 2 * r;
  const arc = (Math.PI * r) / 2;
  let d = (((t % 1) + 1) % 1) * (2 * sw + 2 * sh + 4 * arc);
  const corner = (cx: number, cy: number, a: number) => ({
    x: cx + Math.cos(a) * r,
    y: cy + Math.sin(a) * r,
    nx: Math.cos(a),
    ny: Math.sin(a),
  });

  if (d < sw) return { x: x + r + d, y, nx: 0, ny: -1 };
  d -= sw;
  if (d < arc) return corner(x + w - r, y + r, -Math.PI / 2 + d / r);
  d -= arc;
  if (d < sh) return { x: x + w, y: y + r + d, nx: 1, ny: 0 };
  d -= sh;
  if (d < arc) return corner(x + w - r, y + h - r, d / r);
  d -= arc;
  if (d < sw) return { x: x + w - r - d, y: y + h, nx: 0, ny: 1 };
  d -= sw;
  if (d < arc) return corner(x + r, y + h - r, Math.PI / 2 + d / r);
  d -= arc;
  if (d < sh) return { x, y: y + h - r - d, nx: -1, ny: 0 };
  d -= sh;
  return corner(x + r, y + r, Math.PI + d / r);
}
