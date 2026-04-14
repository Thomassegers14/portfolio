# VOORTGANG.md

## Last Session

**Date:** 2026-04-14
**Session:** 3
**What was done:**
- Built `useD3.js` composable — `ResizeObserver` + SVG lifecycle (mount, resize, unmount)
- Built `SkillsViz.vue` — D3 circle pack, 22 skills, 6 categories, colored by CSS custom properties
  - Bubble size = `weight` field from skills.json
  - Labels for circles with radius > 22px
  - Hover: circle enlarges and brightens
  - Prop `activeSkillId` for scroll-driven highlighting (prepared for Scrollama)
  - Prop `mode: 'full' | 'background'` — background mode: transparent, no labels, no pointer events
- Wired `SkillsViz mode="full"` into `SkillsSection.vue`
- Wired `SkillsViz mode="background"` into `HeroSection.vue` (replaces placeholder)
- Dev server confirmed running at http://localhost:5177

**Stopped at:**
Circle pack visualization live in both Hero (background) and Skills section (full). Next step: scroll-driven behavior via Scrollama.

---

## TODO Next Session

- [ ] Build `useScrollytelling.js` composable — Scrollama integration, step detection
- [ ] Build `ScrollySection.vue` — sticky graphic + scrollable steps wrapper
- [ ] Wire `SkillsSection.vue` scroll steps — highlight individual skills as user scrolls
- [ ] Define scroll step content: which skill gets highlighted at which step

---

## Backlog

- [ ] `ProjectNetwork.vue` — D3 network visualization (skills ↔ projects)
- [ ] `ProjectsSection.vue` scroll steps — reveal project connections on scroll
- [ ] `d3.js` utils — shared color scale from CSS vars, layout helpers (if needed)
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
- [x] (S3) `useD3.js` composable — resize observer + SVG setup
- [x] (S3) `SkillsViz.vue` — D3 circle pack, category colors, hover, activeSkillId prop
- [x] (S3) `SkillsViz` wired into `SkillsSection` (full) and `HeroSection` (background)
