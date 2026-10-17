import type { Metadata } from "next";
import { AboutHero } from "@/components/about/hero";
import { AboutLink } from "@/components/about/motion";
import { sectionCount, sourceCount } from "@/lib/about/docs";
import log from "@/data/build-log.json";

export const metadata: Metadata = { title: { absolute: "About · Holos" } };

const KICK = "font-mono text-[10.5px] tracking-[.1em] text-muted";
const H2 = "mt-3 max-w-[22ch] text-[28px] leading-[1.15] font-semibold text-balance wide:text-[34px]";
const BODY = "mt-4 max-w-[60ch] text-[16px] leading-[1.6] text-page-ink2";

function Fact({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <div data-a className="border-t border-rowline pt-4">
      <div className="font-mono text-[26px] leading-none tabular-nums">{value}</div>
      <p className="mt-2.5 text-[14px] leading-[1.5] text-muted">{children}</p>
    </div>
  );
}

const out = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noreferrer" className="text-you underline decoration-you/40 underline-offset-2">
    {label}
  </a>
);

export default function About() {
  const changes = log.parts.reduce((n, p) => n + p.items.length, 0);
  const pages: [href: string, kicker: string, title: string, text: string, stat: string][] = [
    [
      "/about/research",
      "THE RESEARCH",
      "Every source the game rests on",
      "What each found, why it matters to the game, and where the design uses it.",
      `${sourceCount()} sources`,
    ],
    [
      "/about/design",
      "THE DESIGN",
      "The rules, one question at a time",
      "The design document as it stands today, every answer dated.",
      `${sectionCount("HOLOS_GAME_CONCEPT.md")} sections`,
    ],
    [
      "/about/building",
      "HOW IT IS BUILT",
      "Evidence, then rules, then the game",
      "The method step by step, and every change so far, by the part of the work it touched.",
      `${changes} changes`,
    ],
  ];

  return (
    <main>
      <AboutHero />

      <div className="mx-auto max-w-[1180px] px-4">
        <section className="py-20 wide:py-28">
          <div data-a className={KICK}>
            A TEST OF THE FERMI PARADOX
          </div>
          <h2 data-a className={H2}>
            If the galaxy can be crossed, why is the sky quiet?
          </h2>
          <p data-a className={BODY}>
            Holos sets no rule to keep it quiet. Earth, and anyone else out there, may do anything physics allows, at
            its real price. So if the sky stays quiet, that comes from what others choose, what things cost, and what
            can actually be seen from here. Every game starts from the real sky: nothing heard from anyone by 2040.
          </p>
          <figure data-a className="mt-12 max-w-[52ch] border-l border-you/60 pl-5">
            <blockquote className="text-[22px] leading-[1.35] text-balance wide:text-[26px]">
              &ldquo;&hellip;a large hot tub or small swimming pool to that of the Earth&rsquo;s oceans.&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-[14px] leading-[1.5] text-muted">
              All the radio searching done so far, against everywhere a signal could be. Jason Wright, director of the
              Penn State Extraterrestrial Intelligence Center, with Kanodia and Lubar, 2018.{" "}
              {out("https://arxiv.org/abs/1809.07252", "Read it")}
            </figcaption>
          </figure>
          <div className="mt-12 grid gap-8 wide:grid-cols-3">
            <Fact value="1,327">
              Nearby stars searched by Breakthrough Listen, about 15 minutes each, for steady tones.{" "}
              {out("https://arxiv.org/abs/1906.07750", "Price et al. 2020")}
            </Fact>
            <Fact value="4 ly">
              How far our best radio telescopes could hear a copy of Earth&rsquo;s phone networks. The nearest star is
              4.2. {out("https://arxiv.org/abs/2502.02614", "Sheikh et al. 2025")}
            </Fact>
            <Fact value="66 years">
              Of listening since Project Ozma in 1960, without one confirmed signal.{" "}
              {out("https://www.seti.org/research/seti-101/project-ozma/", "SETI Institute")}
            </Fact>
          </div>
        </section>

        <section className="border-t border-rowline py-20 wide:py-28">
          <div data-a className={KICK}>
            EVIDENCE FIRST
          </div>
          <h2 data-a className={H2}>
            Improbable is fine. Contradicted is not.
          </h2>
          <p data-a className={BODY}>
            Everything starts from real data and the newest published research. Only then comes speculation, from the
            best evidence there is. Earth&rsquo;s history is real to 2026, then follows the most probable path to 2040.
            Where forecasts split, each game rolls a branch, weighted by its odds.
          </p>
          <div className="mt-12 grid gap-8 wide:grid-cols-3">
            <Fact value="9,494">
              Stars and companions within 100 light-years, from Gaia&rsquo;s census of the Sun&rsquo;s neighborhood and
              Hipparcos.
            </Fact>
            <Fact value="9.2 billion">People on Earth at Year 0, from the UN&rsquo;s 2024 projections.</Fact>
            <Fact value="5 minutes">
              One game Year. Light is the one rule nothing bends: a star is seen as it was, and a message can take
              decades. The clock runs even while you&rsquo;re away.
            </Fact>
          </div>
        </section>

        <section className="border-t border-rowline py-20 wide:py-28">
          <div data-a className={KICK}>
            TWO WHAT-IFS
          </div>
          <h2 data-a className={H2}>
            What the game assumes and can&rsquo;t prove
          </h2>
          <div className="mt-10 grid gap-10 wide:grid-cols-2">
            <div data-a>
              <div className="font-mono text-[26px] leading-none">1</div>
              <h3 className="mt-3 text-[18px] font-semibold">If we aren&rsquo;t alone, the others woke when we did</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-page-ink2">
                Two civilizations like ours, placed at random in the galaxy, would overhear each other about one time in
                ten million ({out("https://arxiv.org/abs/1007.0850", "Forgan and Nichol 2010")}). So the game supposes
                that anyone near enough to find woke in the same century as us.
              </p>
            </div>
            <div data-a>
              <div className="font-mono text-[26px] leading-none">2</div>
              <h3 className="mt-3 text-[18px] font-semibold">Humanity crosses the singularity by 2040</h3>
              <p className="mt-2 text-[15px] leading-[1.6] text-page-ink2">
                Forecasters put general AI near 2031, and the most probable 2040 has several rival AIs. The game goes
                further: Earth&rsquo;s people and machines become one Mind, and life is solved. No one ages, and every
                mind is linked.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-rowline py-20 wide:py-28">
          <div data-a className={KICK}>
            READ ON
          </div>
          <h2 data-a className={H2}>
            Everything behind the game
          </h2>
          <div className="mt-10 grid gap-4 wide:grid-cols-3">
            {pages.map(([href, kicker, title, text, stat]) => (
              <AboutLink
                key={href}
                data-a
                href={href}
                className="group flex flex-col rounded-2xl border border-rowline bg-panel p-6 transition-colors hover:border-faint"
              >
                <div className={KICK}>{kicker}</div>
                <h3 className="mt-3 text-[20px] leading-[1.2] font-semibold">{title}</h3>
                <p className="mt-2 grow text-[14px] leading-[1.5] text-muted">{text}</p>
                <div className="mt-6 flex items-center justify-between font-mono text-[10.5px] tracking-[.1em]">
                  <span className="text-ink tabular-nums">{stat.toUpperCase()}</span>
                  <span className="text-you transition-transform group-hover:translate-x-1">→</span>
                </div>
              </AboutLink>
            ))}
          </div>
        </section>
      </div>

      <footer className="border-t border-rowline">
        <div
          data-a
          className="mx-auto flex max-w-[1180px] items-center justify-between px-4 py-8 font-mono text-[10.5px] tracking-[.1em] text-muted"
        >
          <span>HOLOS</span>
          <AboutLink href="/" className="text-ink">
            PLAY →
          </AboutLink>
        </div>
      </footer>
    </main>
  );
}
