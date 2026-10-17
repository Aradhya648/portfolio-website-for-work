"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { STUDIO } from "@/lib/studio";

/**
 * Fixed HUD frame: corner brackets, a hairline scroll-progress bar, the studio
 * mark, the current chapter and the booking CTA. Colours come from the themed
 * wrapper's CSS variables, so the frame recolours with each project chapter.
 */
export function Hud({ chapter }: { chapter: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => gsap.set(bar.current, { scaleX: self.progress }),
    });
  });

  return (
    <div className="pointer-events-none fixed inset-0 z-40 text-[var(--fg)] transition-colors duration-700">
      {/* Backing so the mark and CTA stay legible over scrolling headlines.
          A theme-coloured fade, not mix-blend-mode (which broke rendering on
          the Pretty Dan Good build). */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[var(--bg)] via-[var(--bg)]/80 to-transparent" />
      <div className="absolute inset-x-5 top-4 h-px sm:inset-x-8">
        <div className="absolute inset-0 bg-[var(--muted)] opacity-40" />
        <div ref={bar} className="absolute inset-0 origin-left scale-x-0 bg-[var(--fg)]" />
      </div>

      <div className="pointer-events-auto absolute inset-x-5 top-7 flex items-center justify-between sm:inset-x-8">
        <a href="#top" className="display text-xl sm:text-2xl">
          {STUDIO.name}
        </a>
        <span className="hud-label hidden text-[var(--muted)] sm:block">{chapter}</span>
        <a
          href={STUDIO.calUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="hud-label rounded-full bg-[var(--fg)] px-4 py-2.5 text-[var(--bg)] transition-transform hover:scale-[1.04]"
        >
          Book a call
        </a>
      </div>

      {[
        "left-5 top-20 border-l border-t sm:left-8",
        "right-5 top-20 border-r border-t sm:right-8",
        "bottom-5 left-5 border-b border-l sm:bottom-8 sm:left-8",
        "bottom-5 right-5 border-b border-r sm:bottom-8 sm:right-8",
      ].map((pos) => (
        <span key={pos} className={`absolute h-3 w-3 border-[var(--muted)] ${pos}`} />
      ))}

    </div>
  );
}
