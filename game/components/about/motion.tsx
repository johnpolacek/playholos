"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, use, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { charsRise, fontsReady, gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

// The about pages' motion: light and quick. The bar drops in once. Each page's items rise as they come into view, its
// title's letters rise behind masks, and its figures count up. A link out plays the items on screen away first, then
// navigates. Back and forward only enter. The boot script in the layout keeps items hidden until this takes over, or
// shows them if it never does.

/** A page's items: marked ones, and each block of a rendered doc. */
const ITEMS = "[data-a], .doc > :not(ul), .doc > ul > li";

const Go = createContext<(href: string) => void>(() => {});

const boot = () => document.documentElement.dataset.aboutBoot;
/** Hands the page from the boot gate to the motion, which has already set its start values. */
const release = () => {
  if (boot() === "pending") document.documentElement.dataset.aboutBoot = "running";
};
/** Motion is off: reduced, or the boot gate gave up and showed the page as it is. */
const still = () => prefersReducedMotion() || boot() === "recovered";

function countUp(el: HTMLElement) {
  const end = Number(el.dataset.count);
  const n = { v: 0 };
  gsap.to(n, {
    v: end,
    duration: 0.9,
    ease: "power2.out",
    onUpdate: () => (el.textContent = Math.round(n.v).toLocaleString("en-US")),
  });
}

export function AboutMotion({ nav, children }: { nav: React.ReactNode; children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  const route = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();
  const leaving = useRef<gsap.core.Tween | null>(null);

  // The bar, once.
  useGSAP(
    () => {
      if (still()) return;
      gsap.fromTo(
        "[data-a-nav]",
        { autoAlpha: 0, y: -8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.4,
          ease: "power3.out",
          stagger: 0.05,
          clearProps: "transform,opacity,visibility",
        },
      );
    },
    { scope: root },
  );

  // Each page, on every route.
  useGSAP(
    (_, safe) => {
      // A new page releases the last link's lock, and stops its outro from navigating twice.
      leaving.current?.kill();
      leaving.current = null;
      const page = route.current!;
      if (still()) return release();

      const items = gsap.utils.toArray<HTMLElement>(ITEMS, page);
      const title = page.querySelector<HTMLElement>("[data-a-title]");
      const counts = gsap.utils.toArray<HTMLElement>("[data-count]", page);
      gsap.set(items, { opacity: 0, y: 14 });
      if (title) gsap.set(title, { autoAlpha: 0 });
      for (const el of counts) el.textContent = "0";
      release();

      const shown = new WeakSet<Element>();
      const reveal = (els: Element[]) => {
        const fresh = els.filter((el) => !shown.has(el));
        if (!fresh.length) return;
        for (const el of fresh) shown.add(el);
        gsap.to(fresh, {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power3.out",
          stagger: 0.04,
          overwrite: "auto",
          clearProps: "transform,opacity",
        });
        for (const el of counts) if (fresh.some((f) => f.contains(el))) countUp(el);
      };
      // From above too: a jump to a heading passes items that enter on the way back up.
      ScrollTrigger.batch(items, {
        start: "top 96%",
        onEnter: reveal,
        onEnterBack: reveal,
        interval: 0.05,
        batchMax: 14,
      });

      let live = true;
      if (title)
        fontsReady().then(
          safe!(() => {
            if (live) charsRise(gsap.timeline(), title, 0.05);
          }),
        );
      return () => {
        live = false;
        for (const el of counts) el.textContent = Number(el.dataset.count).toLocaleString("en-US");
      };
    },
    { scope: route, dependencies: [pathname] },
  );

  const { contextSafe } = useGSAP({ scope: root });

  // A link out: what is on screen lifts away, then the router moves. The first link wins until the next page enters.
  const go = (href: string) =>
    contextSafe(() => {
      if (leaving.current) return;
      const page = route.current!;
      const on = gsap.utils.toArray<HTMLElement>(`${ITEMS}, [data-a-title], [data-a-out]`, page).filter((el) => {
        const r = el.getBoundingClientRect();
        return r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
      });
      const push = () => router.push(href);
      if (!on.length || prefersReducedMotion()) return push();
      leaving.current = gsap.to(on, {
        autoAlpha: 0,
        y: -10,
        duration: 0.22,
        ease: "power2.in",
        stagger: { amount: 0.12 },
        overwrite: true,
        onComplete: push,
      });
    })();

  // Plain anchors: the contents, the docs' links, and the method's jumps. A jump within the page goes through the
  // router's history, since the router ignores an entry the browser made on its own, and back to it would leave the
  // next page on screen. A doc link to another about page takes the same way out as a Link.
  const onClick = (e: React.MouseEvent) => {
    const a = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
    if (!a || a.target || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
      return;
    const url = new URL(a.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname) {
      if (!url.hash) return;
      e.preventDefault();
      history.pushState(null, "", url.hash);
      document.getElementById(decodeURIComponent(url.hash.slice(1)))?.scrollIntoView();
      return;
    }
    if (!a.closest(".doc")) return;
    e.preventDefault();
    go(url.pathname + url.search + url.hash);
  };

  return (
    <div ref={root} className="about min-h-dvh bg-page">
      <Go value={go}>
        {nav}
        <div ref={route} onClick={onClick}>
          {children}
        </div>
      </Go>
    </div>
  );
}

/** A next/link that plays the page out before it navigates. Same-page and new-tab clicks stay native. */
export function AboutLink(props: React.ComponentProps<typeof Link>) {
  const go = use(Go);
  return (
    <Link
      {...props}
      onNavigate={(e) => {
        const href = String(props.href);
        if (href.split("#")[0] === location.pathname) return;
        e.preventDefault();
        go(href);
      }}
    />
  );
}
