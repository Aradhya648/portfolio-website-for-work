"use client";

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

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  const [chapter, setChapter] = useState("00 / Index");

  useGSAP(
    () => {
      const el = root.current!;
      const setTheme = (t: Theme, label: string) => {
        gsap.to(el, { ...vars(t), duration: 0.9, ease: "power2.out", overwrite: "auto" });
        setChapter(label);
      };

      // Hero headline: characters rise in on load.
      const heroSplit = SplitText.create(".hero-line", { type: "chars", mask: "chars" });
      gsap.from(heroSplit.chars, {
        yPercent: 110,
        duration: 1.1,
        ease: "expo.out",
        stagger: 0.025,
        delay: 0.15,
      });

      // Back to the studio's own palette whenever the hero or the close is on screen.
      ScrollTrigger.create({
        trigger: ".hero",
        start: "top top",
        end: "bottom 45%",
        onEnterBack: () => setTheme(BASE_THEME, "00 / Index"),
      });
      ScrollTrigger.create({
        trigger: ".close",
        start: "top 55%",
        onEnter: () => setTheme(BASE_THEME, "04 / Contact"),
        onLeaveBack: () => {
          const last = PROJECTS[PROJECTS.length - 1];
          setTheme(last.theme, `03 / ${last.name}`);
        },
      });

      gsap.utils.toArray<HTMLElement>(".chapter").forEach((section, i) => {
        const p = PROJECTS[i];
        const label = `0${i + 1} / ${p.name}`;

        // Each chapter repaints the whole page in that project's own palette.
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom 55%",
          onEnter: () => setTheme(p.theme, label),
          onEnterBack: () => setTheme(p.theme, label),
        });

        // Name: masked character reveal, triggered (not scrubbed) for reliability.
        const split = SplitText.create(section.querySelector(".chapter-name"), {
          type: "chars",
          mask: "chars",
        });
        gsap.from(split.chars, {
          yPercent: 105,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.03,
          scrollTrigger: { trigger: section, start: "top 70%" },
        });

        // Preview frame opens up as it scrolls in: whole-element scrub only.
        gsap.fromTo(
          section.querySelector(".chapter-frame"),
          { clipPath: "inset(12% 10% 12% 10% round 18px)", scale: 1.08 },
          {
            clipPath: "inset(0% 0% 0% 0% round 18px)",
            scale: 1,
            ease: "none",
            scrollTrigger: { trigger: section, start: "top 85%", end: "top 25%", scrub: true },
          }
        );

        gsap.from(section.querySelectorAll(".chapter-meta"), {
          opacity: 0,
          y: 24,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: section, start: "top 65%" },
        });
      });
    },
    { scope: root }
  );

  return (
    <div ref={root} id="top" className="themed min-h-svh" style={vars(BASE_THEME) as React.CSSProperties}>
      <Hud chapter={chapter} />

      <section className="hero relative flex min-h-svh flex-col justify-end px-5 pb-20 pt-32 sm:px-8 sm:pb-24">
        <p className="hud-label mb-6 text-[var(--muted)]">Independent web studio, {STUDIO.location}</p>
        <h1 className="display text-[19vw] sm:text-[13vw]">
          <span className="hero-line block">Websites</span>
          <span className="hero-line block text-[var(--muted)]">nobody else has.</span>
        </h1>
        <div className="mt-10 flex flex-wrap items-end justify-between gap-6">
          <p className="max-w-md text-lg leading-relaxed text-[var(--muted)]">
            Three recent builds, three completely different looks. Scroll, and the
            page turns into each one.
          </p>
          <span className="hud-label text-[var(--muted)]">Scroll ↓</span>
        </div>
      </section>

      {PROJECTS.map((p, i) => (
        <section
          key={p.slug}
          className="chapter relative grid min-h-svh items-center gap-10 px-5 py-28 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14"
        >
          <div>
            <div className="chapter-meta mb-6 flex flex-wrap items-center gap-3">
              <span className="hud-label text-[var(--muted)]">0{i + 1}</span>
              <span className="hud-label rounded-full border border-[var(--muted)] px-3 py-1.5">
                {p.role}
              </span>
            </div>
            <p className="chapter-meta hud-label mb-4 text-[var(--muted)] line-through decoration-[var(--accent)] decoration-2">
              {p.before}
            </p>
            <h2 className="chapter-name display text-[16vw] sm:text-[10vw] lg:text-[7.5vw]">{p.name}</h2>
            <p className="chapter-meta mt-6 max-w-md text-lg leading-relaxed text-[var(--fg)]/80">
              {p.summary}
            </p>
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

          <div className="chapter-frame relative aspect-[16/10] w-full overflow-hidden rounded-[18px] bg-black/20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]">
            <WorkVideo src={p.video} poster={p.poster} label={`Scrolling through ${p.name}`} />
          </div>
        </section>
      ))}

      <section className="close relative flex min-h-svh flex-col justify-center px-5 py-28 sm:px-8">
        <p className="hud-label mb-6 text-[var(--muted)]">Next could be yours</p>
        <h2 className="display text-[17vw] sm:text-[11vw]">
          Let&rsquo;s build
          <br />
          <span className="text-[var(--muted)]">something loud.</span>
        </h2>
        <a
          href={STUDIO.calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hud-label mt-12 inline-flex w-fit items-center gap-3 rounded-full bg-[var(--fg)] px-7 py-4 text-[var(--bg)] transition-transform hover:scale-[1.03]"
        >
          Book a call ↗
        </a>
      </section>
    </div>
  );
}
