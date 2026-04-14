# VOORTGANG.md

## Last Session

**Date:** 2026-04-14
**Session:** 5
**What was done:**
- Built `ProjectNetwork.vue` — D3 force-directed network
  - 34 nodes: 23 skill circles (colored by category, sized by weight) + 11 project diamonds
  - ~40 links connecting skills to projects
  - `activeProjectId` prop: active project + connected skills light up, rest dims
  - Project labels appear on active project
  - Force simulation: forceLink + forceManyBody + forceCenter + forceCollide
- Built `ProjectsSection.vue` — 12 scroll steps (1 intro + 11 projects)
  - Each project step shows title, description, year, client
  - Step type reflected in card left-border color (data-journalism / visual-storytelling / experimental)
  - `activeProjectId` drives network highlight
- Build confirmed clean

**Stopped at:**
Full scrollytelling pipeline live for both Skills and Projects sections. Next: visual polish, transitions, and final content.

---

## TODO Next Session

- [ ] Visual polish pass: spacing, typography, overall feel in browser
- [ ] Smooth simulation warmup — freeze simulation after it settles (alphamin reached)
- [ ] Check scrollytelling behavior end-to-end in browser
- [ ] Decide: morph transition between SkillsViz and ProjectNetwork (or skip)
- [ ] Responsive: test on narrower viewport, add mobile fallback if needed

---

## Backlog

- [ ] `d3.js` utils — shared color scale from CSS vars (if needed)
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
- [x] (S5) `ProjectNetwork.vue` — D3 force network, activeProjectId highlight
- [x] (S5) `ProjectsSection.vue` — 12 scroll steps, fully wired to ProjectNetwork
