# VOORTGANG.md

## Last Session

**Date:** 2026-04-14
**Session:** 2
**What was done:**
- Initialized Vite + Vue 3 project (manual scaffold, no interactive CLI needed)
- Installed dependencies: `d3`, `scrollama`, `@vitejs/plugin-vue`
- Created `variables.css` with full design token set (colors, typography, spacing, transitions)
  - 6 category colors map 1-to-1 with skill categories in `skills.json`
  - Dark theme: bg `#0a0a0f`, accents per category
- Created `base.css` with CSS reset and base styles
- Created `skills.json` (22 skills, 6 categories) and `projects.json` (11 projects with skill links)
- Built `NavBar.vue` — fixed, frosted-glass, anchor links to #home / #skills / #projects
- Built `HeroSection.vue` — full-height, name + tagline + CTA, placeholder for background viz
- Built `SkillsSection.vue` and `ProjectsSection.vue` — placeholder with dashed border
- Verified dev server runs (`npm run dev` → http://localhost:5174)

**Stopped at:**
Full skeleton running in the browser. Next step: build `SkillsViz.vue` with D3 circle pack or force layout using `skills.json`.

---

## TODO Next Session

- [ ] Build `useD3.js` composable (resize observer + SVG setup helper)
- [ ] Build `SkillsViz.vue` — D3 circle pack layout, colored by category
- [ ] Wire `SkillsViz.vue` into `SkillsSection.vue`
- [ ] Decide: circle pack vs force layout (can prototype both quickly)
- [ ] Add `SkillsViz` as semi-transparent background in `HeroSection.vue`

---

## Backlog

- [ ] `ScrollySection.vue` — generic scrollytelling wrapper (sticky graphic + steps)
- [ ] `SkillsSection.vue` scroll steps — highlight individual skills on scroll
- [ ] `ProjectNetwork.vue` — D3 network visualization (skills ↔ projects)
- [ ] `ProjectsSection.vue` scroll steps — reveal project connections on scroll
- [ ] `useScrollytelling.js` composable — Scrollama integration
- [ ] `d3.js` utils — shared color scale from CSS vars, layout helpers
- [ ] Morph/transition between skills layout and project network
- [ ] Responsive behavior (mobile fallback for complex SVGs)
- [ ] Final copy and personal content
- [ ] Deploy (Netlify / Vercel)

---

## Completed

- [x] (S1) Define project concept, tech stack, folder structure, documentation
- [x] (S2) Vite + Vue 3 scaffold + npm install
- [x] (S2) Design tokens: `variables.css`, `base.css`
- [x] (S2) Data files: `skills.json`, `projects.json`
- [x] (S2) `NavBar.vue` — fixed nav with anchor links
- [x] (S2) `HeroSection.vue` — skeleton
- [x] (S2) `SkillsSection.vue`, `ProjectsSection.vue` — placeholders
