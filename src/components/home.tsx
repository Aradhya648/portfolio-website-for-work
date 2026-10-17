"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { BASE_THEME, PROJECTS, type Theme } from "@/lib/work";
import { STUDIO } from "@/lib/studio";
import { Hud } from "./hud";
import { WorkVideo } from "./work-video";

const vars = (t: Theme) => ({ "--bg": t.bg, "--fg": t.fg, "--accent": t.accent, "--muted": t.muted });

// The wordmark is cut along this diagonal. The two layers are 116% wide (8%
// overhang each side) so sliding them sideways never exposes the edges; the SVG
// cut line is drawn on the matching viewport-space diagonal.
const CUT_TOP = "polygon(0% 0%, 100% 0%, 100% 40%, 0% 60%)";
const CUT_BOTTOM = "polygon(0% 60%, 100% 40%, 100% 100%, 0% 100%)";
const LINE_Y1 = 60 - (20 * 8) / 116;
const LINE_Y2 = 60 - (20 * 108) / 116;

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState("00 / Index");

  useGSAP(
    () => {
      const el = root.current!;
      ScrollTrigger.config({ ignoreMobileResize: true });

      // The HUD and hero read the wrapper's variables; chapters carry their own.
      const setTheme = (t: Theme, label: string) => {
        gsap.to(el, { ...vars(t), duration: 0.6, ease: "power2.out", overwrite: "auto" });
        setChapter(label);
      };

      // HUD handoff when a chapter's top edge passes under the HUD bar.
      // refreshPriority -1: these are created before the pins below, and
      // ScrollTrigger refreshes in creation order, so without it they'd measure
      // positions that ignore the pin spacing and fire screens too early.
      const chapters = gsap.utils.toArray<HTMLElement>(".chapter");
      chapters.forEach((section, i) => {
        const p = PROJECTS[i];
        const prev = i === 0 ? null : PROJECTS[i - 1];
        ScrollTrigger.create({
          trigger: section,
          start: "top 12%",
          refreshPriority: -1,
          onEnter: () => setTheme(p.theme, `0${i + 1} / ${p.name}`),
          onLeaveBack: () =>
            prev ? setTheme(prev.theme, `0${i} / ${prev.name}`) : setTheme(BASE_THEME, "00 / Index"),
        });
      });
      const last = PROJECTS[PROJECTS.length - 1];
      ScrollTrigger.create({
        trigger: ".close",
        start: "top 12%",
        refreshPriority: -1,
        onEnter: () => setTheme(BASE_THEME, "04 / Contact"),
        onLeaveBack: () => setTheme(last.theme, `0${PROJECTS.length} / ${last.name}`),
      });

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(".cut-top", { yPercent: -20 });
        gsap.set(".cut-bottom", { yPercent: 20 });
        gsap.set([".cut-line"], { opacity: 0 });
        gsap.set(".reel-label", { opacity: 1 });
      });

      mm.add(
        {
          desktop: "(min-width: 1024px) and (prefers-reduced-motion: no-preference)",
          mobile: "(max-width: 1023px) and (prefers-reduced-motion: no-preference)",
        },
        (ctx) => {
          const { desktop } = ctx.conditions as { desktop: boolean };
          // words+chars: chars animate, but lines can only break between words.
          const split = (target: Element | string) =>
            SplitText.create(target, { type: "words,chars", mask: "chars" }).chars;

          // ── Hero intro: wordmark rises, then the cut is drawn across it.
          const intro = gsap.timeline({ delay: 0.15 });
          gsap.utils.toArray<HTMLElement>(".wordmark").forEach((m) =>
            intro.from(split(m), { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.04 }, 0)
          );
          intro
            .fromTo(".cut-line", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.9, ease: "power3.inOut" }, 0.75)
            .from(".hero-meta", { opacity: 0, y: 16, duration: 0.8, ease: "power3.out", stagger: 0.08 }, 0.95);

          // ── Hero scroll: the halves part along the cut until the work fills the frame.
          gsap
            .timeline({
              scrollTrigger: {
                trigger: ".hero",
                start: "top top",
                end: desktop ? "+=140%" : "+=100%",
                pin: true,
                scrub: true,
              },
            })
            .to(".cut-top", { yPercent: -66, xPercent: -3, ease: "power1.in" }, 0)
            .to(".cut-bottom", { yPercent: 66, xPercent: 3, ease: "power1.in" }, 0)
            .to(".cut-line", { opacity: 0, ease: "none", duration: 0.2 }, 0)
            .to(".hero-meta", { opacity: 0, ease: "none", duration: 0.25 }, 0)
            .fromTo(".hero-reel", { scale: 1.16 }, { scale: 1, ease: "none" }, 0)
            .from(".reel-label", { opacity: 0, y: 12, stagger: 0.05, duration: 0.25, ease: "none" }, 0.7);

          chapters.forEach((section) => {
            const frame = section.querySelector(".chapter-frame");
            gsap.from(split(section.querySelector(".chapter-name")!), {
              yPercent: 105,
              duration: 0.9,
              ease: "expo.out",
              stagger: 0.025,
              scrollTrigger: { trigger: section, start: "top 55%" },
            });
            gsap.from(section.querySelectorAll(".chapter-meta"), {
              opacity: 0,
              y: 24,
              duration: 0.8,
              ease: "power3.out",
              stagger: 0.07,
              scrollTrigger: { trigger: section, start: "top 50%" },
            });

            if (desktop) {
              const hold = () => window.innerHeight * 0.5;
              // Preview opens as the chapter rises into view.
              gsap.fromTo(
                frame,
                { clipPath: "inset(14% 12% 14% 12% round 22px)", scale: 1.1 },
                {
                  clipPath: "inset(0% 0% 0% 0% round 18px)",
                  scale: 1,
                  ease: "none",
                  scrollTrigger: { trigger: section, start: "top bottom", end: "top top", scrub: true },
                }
              );
              // Pinned without spacing: it holds for half a screen, then the
              // next chapter (stacked above it) slides up over the top.
              ScrollTrigger.create({
                trigger: section,
                start: "top top",
                end: () => `+=${section.offsetHeight + hold()}`,
                pin: true,
                pinSpacing: false,
                invalidateOnRefresh: true,
              });
              // While it's being covered, it sinks back and darkens.
              const sink = {
                trigger: section,
                start: () => `top top-=${hold()}`,
                end: () => `+=${section.offsetHeight}`,
                scrub: true,
                invalidateOnRefresh: true,
              };
              gsap.to(section.querySelector(".chapter-body"), { scale: 0.9, yPercent: -5, ease: "none", scrollTrigger: sink });
              gsap.to(section.querySelector(".chapter-shade"), { opacity: 0.65, ease: "none", scrollTrigger: sink });
            } else {
              gsap.fromTo(
                frame,
                { clipPath: "inset(8% 6% 8% 6% round 16px)" },
                {
                  clipPath: "inset(0% 0% 0% 0% round 14px)",
                  ease: "none",
                  scrollTrigger: { trigger: frame, start: "top 90%", end: "top 40%", scrub: true },
                }
              );
            }
          });

          gsap.from(".close-line", {
            yPercent: 105,
            duration: 1,
            ease: "expo.out",
            stagger: 0.08,
            scrollTrigger: { trigger: ".close", start: "top 55%" },
          });
        }
      );
    },
    { scope: root }
  );

  return (
    <div ref={root} id="top" className="themed min-h-svh" style={vars(BASE_THEME) as React.CSSProperties}>
      <Hud chapter={chapter} />

      {/* ── Hero: the wordmark, cut in two, with the work behind it. */}
      <section
        className="hero relative z-[1] h-svh overflow-hidden"
        aria-label={`${STUDIO.name}, independent web studio`}
      >
        <div className="hero-reel absolute inset-0 grid grid-cols-3">
          {PROJECTS.map((p, i) => (
            <div key={p.slug} className="relative overflow-hidden border-r border-black/30 last:border-r-0">
              <Image
                src={p.mobile}
                alt=""
                fill
                fetchPriority="high"
                loading="eager"
                sizes="34vw"
                className="object-cover object-top"
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />
              <span className="reel-label hud-label absolute bottom-6 left-4 text-white sm:left-6">
                0{i + 1}
                {/* Columns are ~130px wide on phones, so the name only shows from sm up. */}
                <span className="hidden sm:inline"> · {p.name}</span>
              </span>
            </div>
          ))}
        </div>

        {[
          { cls: "cut-top", clip: CUT_TOP, hidden: false },
          { cls: "cut-bottom", clip: CUT_BOTTOM, hidden: true },
        ].map(({ cls, clip, hidden }) => (
          <div
            key={cls}
            className={`${cls} absolute inset-y-0 -left-[8%] -right-[8%] flex items-center justify-center bg-[var(--bg)] will-change-transform`}
            style={{ clipPath: clip }}
            aria-hidden={hidden || undefined}
          >
            {/* Same wordmark in both halves so they read as one until they part.
                Only the top copy is the page's h1. */}
            {hidden ? (
              <p className="wordmark display text-[27vw] leading-none lg:text-[24vw]">{STUDIO.name}</p>
            ) : (
              <h1 className="wordmark display text-[27vw] leading-none lg:text-[24vw]">{STUDIO.name}</h1>
            )}
          </div>
        ))}

        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <line
            className="cut-line"
            x1="0"
            y1={LINE_Y1}
            x2="100"
            y2={LINE_Y2}
            pathLength={1}
            strokeDasharray="1"
            stroke="var(--fg)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        <div className="pointer-events-none absolute inset-x-5 bottom-14 flex flex-wrap items-end justify-between gap-6 sm:inset-x-8 sm:bottom-16">
          <div className="hero-meta max-w-md">
            <p className="hud-label mb-3 text-[var(--muted)]">Independent web studio · {STUDIO.location}</p>
            <p className="text-xl leading-snug sm:text-2xl">
              Every site cut from scratch.
              <span className="text-[var(--muted)]"> Here are three offcuts.</span>
            </p>
          </div>
          <span className="hero-meta hud-label text-[var(--muted)]">Scroll ↓</span>
        </div>
      </section>

      {/* ── Work: stacked chapters, each painted in its project's own palette. */}
      {PROJECTS.map((p, i) => (
        <div key={p.slug}>
          <section
            id={p.slug}
            className="chapter relative min-h-svh overflow-hidden"
            style={{ ...vars(p.theme), background: p.theme.bg, color: p.theme.fg, zIndex: i + 2 } as React.CSSProperties}
          >
            <div className="chapter-body grid min-h-svh origin-top items-center gap-10 px-5 pb-20 pt-28 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:py-24">
              <div>
                <div className="chapter-meta mb-6 flex flex-wrap items-center gap-3">
                  <span className="hud-label text-[var(--muted)]">
                    0{i + 1} / 0{PROJECTS.length}
                  </span>
                  <span className="hud-label rounded-full border border-[var(--muted)] px-3 py-1.5">{p.role}</span>
                </div>
                <p className="chapter-meta hud-label mb-4 text-[var(--muted)] line-through decoration-[var(--accent)] decoration-2">
                  {p.before}
                </p>
                <h2 className="chapter-name display text-[17vw] sm:text-[11vw] lg:text-[7vw]">{p.name}</h2>
                <p className="chapter-meta mt-6 max-w-md text-lg leading-relaxed opacity-85">{p.summary}</p>
                <div className="chapter-meta mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                  <span className="hud-label text-[var(--muted)]">
                    {p.kind} · {p.year}
                  </span>
                  <span className="hud-label text-[var(--muted)]">{p.stack.join(" / ")}</span>
                </div>
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="chapter-meta hud-label mt-8 inline-flex items-center gap-2 border-b border-[var(--accent)] pb-1 text-[var(--accent)]"
                >
                  Visit live site ↗
                </a>
              </div>

              <div className="chapter-frame relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-black/20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)] will-change-transform">
                <WorkVideo src={p.video} poster={p.poster} label={`Scrolling through ${p.name}`} />
              </div>
            </div>
            <div className="chapter-shade pointer-events-none absolute inset-0 bg-black opacity-0" />
          </section>
          {/* Desktop-only hold: transparent, so the pinned chapter stays in
              view for half a screen before the next one covers it. */}
          <div aria-hidden className="hidden h-[50svh] lg:block" />
        </div>
      ))}

      {/* ── Close: slides over the last chapter in the studio's own palette. */}
      <section
        className="close relative z-10 flex min-h-svh flex-col justify-center px-5 pb-28 pt-32 sm:px-8"
        style={{ ...vars(BASE_THEME), background: BASE_THEME.bg, color: BASE_THEME.fg } as React.CSSProperties}
      >
        <p className="hud-label mb-6 text-[var(--muted)]">The next offcut could be yours</p>
        <h2 className="display text-[16vw] sm:text-[11vw]">
          <span className="block overflow-hidden">
            <span className="close-line block">Let&rsquo;s cut</span>
          </span>
          <span className="block overflow-hidden">
            <span className="close-line block text-[var(--muted)]">something new.</span>
          </span>
        </h2>
        <a
          href={STUDIO.calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hud-label mt-12 inline-flex w-fit items-center gap-3 rounded-full bg-[var(--fg)] px-7 py-4 text-[var(--bg)] transition-transform hover:scale-[1.03]"
        >
          Book a call ↗
        </a>

        <footer className="absolute inset-x-5 bottom-8 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--muted)]/30 pt-5 sm:inset-x-8">
          <span className="hud-label text-[var(--muted)]">
            © {STUDIO.name} · {STUDIO.location}
          </span>
          <nav className="flex flex-wrap gap-5">
            {PROJECTS.map((p) => (
              <a
                key={p.slug}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="hud-label text-[var(--muted)] hover:text-[var(--fg)]"
              >
                {p.name} ↗
              </a>
            ))}
          </nav>
        </footer>
      </section>
    </div>
  );
}
