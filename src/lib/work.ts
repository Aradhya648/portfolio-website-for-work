export type Theme = { bg: string; fg: string; accent: string; muted: string };

export type Project = {
  slug: string;
  name: string;
  url: string;
  /** Honest relationship to the work. Shown on every card and case study. */
  role: string;
  kind: string;
  year: string;
  summary: string;
  /** The "old way" this project replaced, shown struck through. */
  before: string;
  stack: string[];
  video: string;
  poster: string;
  /** 2x capture of the live site's mobile hero, used in the cut reel. */
  mobile: string;
  theme: Theme;
};

export const BASE_THEME: Theme = {
  bg: "#060606",
  fg: "#f2f0ec",
  accent: "#f2f0ec",
  muted: "rgba(242,240,236,0.5)",
};

export const PROJECTS: Project[] = [
  {
    slug: "prettydangood",
    name: "Pretty Dan Good",
    url: "https://prettydangood-website.vercel.app",
    role: "Pitch concept",
    kind: "Salon & academy, Bangalore",
    year: "2026",
    summary:
      "An unsolicited redesign for a Bangalore salon. The name is the founders' two names, Preeti and Danny, so the site resolves one into the other as you scroll.",
    before: "Stock WordPress theme",
    stack: ["Next.js", "Motion", "Tailwind"],
    video: "/work/prettydangood.mp4",
    poster: "/work/prettydangood-poster.jpg",
    mobile: "/work/prettydangood-mobile.jpg",
    theme: { bg: "#f3efe7", fg: "#131210", accent: "#7a1f36", muted: "rgba(19,18,16,0.5)" },
  },
  {
    slug: "lear",
    name: "Lear",
    url: "https://lear.drufiy.com",
    role: "Own product, co-founded",
    kind: "AI on-call engineer",
    year: "2026",
    summary:
      "Our own product, built with a co-founder. The site has to explain an autonomous agent to engineers at a glance, so the hero is the loop itself.",
    before: "Generic SaaS landing page",
    stack: ["Astro"],
    video: "/work/lear.mp4",
    poster: "/work/lear-poster.jpg",
    mobile: "/work/lear-mobile.jpg",
    theme: { bg: "#08060a", fg: "#f5eef4", accent: "#ff2d87", muted: "rgba(245,238,244,0.5)" },
  },
  {
    slug: "bitsnbytes",
    name: "bits&bytes",
    url: "https://gobitsnbytes.org",
    role: "Side project, contributor",
    kind: "Teen-led builder network",
    year: "2026",
    summary:
      "A side project we helped with: a loud, retro-brutalist home for a teen-run hackathon network that refuses to look like a school club.",
    before: "Beginner-locked event page",
    stack: ["Next.js", "Lenis", "Canvas"],
    video: "/work/bitsnbytes.mp4",
    poster: "/work/bitsnbytes-poster.jpg",
    mobile: "/work/bitsnbytes-mobile.jpg",
    theme: { bg: "#8f1a2d", fg: "#ffe8cf", accent: "#ff9a1f", muted: "rgba(255,232,207,0.6)" },
  },
];
