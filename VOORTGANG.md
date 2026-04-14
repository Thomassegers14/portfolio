# VOORTGANG.md

## Last Session

**Date:** 2026-04-14
**Session:** 4
**What was done:**
- Built `useScrollytelling.js` — Scrollama wrapper, exports `currentStepIndex`, `currentStepData`, `direction`
- Built `ScrollySection.vue` — sticky graphic (right) + scrollable steps (left), emits `step-enter`
- Wired 7 scroll steps into `SkillsSection.vue` (1 intro + 6 categories)
- Added `activeCategory` prop to `SkillsViz.vue` — active category lights up, rest dims
- Build confirmed clean (no errors)

**Stopped at:**
Skills scrollytelling fully wired. Next: `ProjectNetwork.vue` — D3 force-directed network linking skills to projects.

---

## TODO Next Session

- [ ] Build `ProjectNetwork.vue` — D3 force-directed network (skills ↔ projects nodes + edges)
- [ ] Wire `ProjectNetwork.vue` into `ProjectsSection.vue` with scroll steps
- [ ] Define project scroll steps: reveal connections per project on scroll

---

## Backlog

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
- [x] (S4) `useScrollytelling.js` — Scrollama composable
- [x] (S4) `ScrollySection.vue` — sticky graphic + scrollable steps wrapper
- [x] (S4) `SkillsSection.vue` — 7 scroll steps, activeCategory drives SkillsViz highlight
