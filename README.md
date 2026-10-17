# portfolio-website-for-work

Studio portfolio. Each case study is a chapter that repaints the whole page in
that project's own palette, so visitors see the range instead of reading about it.

## Stack
- Next.js 16 (App Router) + React 19, TypeScript, Tailwind v4, pnpm
- GSAP 3.15 (ScrollTrigger, SplitText) via `@gsap/react` for scroll choreography
- Lenis smooth scroll, driven from the GSAP ticker (`options.autoRaf: false`)
- Motion for UI micro-interactions

## Notes
- Theme CSS variables live on the `.themed` page wrapper, never `:root`.
  With `cacheComponents`, Next hides old routes with `<Activity>` rather than
  unmounting them, so root-level variables would leak across pages.
- Project previews in `public/work/` are real scroll-throughs of the live sites,
  recorded frame by frame in headless Chrome and encoded with ffmpeg.
- Avoid `mix-blend-mode` on fixed overlays; it has broken compositing before.

## Develop
```bash
pnpm install
pnpm dev   # http://localhost:3005
```
