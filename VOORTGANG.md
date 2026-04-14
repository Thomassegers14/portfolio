# VOORTGANG.md

## Last Session

**Date:** 2026-04-14
**Session:** 6
**What was done:**
- Architectural refactor: één gedeelde visualisatie i.p.v. twee aparte
- Built `UnifiedViz.vue` — één D3 canvas, twee modes:
  - `skills`: circle pack layout, forceX/Y trekken nodes naar pack-positie
  - `projects`: pack-forces vrijgelaten, force-network neemt over
  - Morph tussen modes via krachtenverandering op lopende simulatie
- `App.vue` refactored: twee kolommen — links scrollend, rechts sticky viz pane
- `provide/inject` voor `updateViz` — secties communiceren via gedeelde state
- `SkillsSection.vue` vereenvoudigd — pure text steps, inject updateViz
- `ProjectsSection.vue` vereenvoudigd — pure text steps, inject updateViz
- `HeroSection.vue` vereenvoudigd — geen achtergrondviz meer
- Build confirmed clean (603 modules)

**Stopped at:**
Één gedeelde visualisatie live in sticky rechterkolom. De vizualisatie morpht van circle pack naar force network bij scrollen van Skills naar Projects sectie.

---

## TODO Next Session

- [ ] Browser QA: scrollgedrag testen, morph visueel bekijken
- [ ] Skill labels toevoegen aan UnifiedViz (tekst op de cirkels, zichtbaar in skills mode)
- [ ] Simulatie freezing: simulatie pauzeren zodra alpha < minAlpha
- [ ] Visuele polish: paddings, kleuren, kaartdesign finetunen
- [ ] Responsive check op kleinere viewports

---

## Backlog

- [ ] Morph verfijnen indien nodig na QA
- [ ] Responsive behavior (mobile fallback)
- [ ] Final copy en persoonlijke content
- [ ] Deploy (Netlify / Vercel)

---

## Completed

- [x] (S1) Define project concept, tech stack, folder structure, documentation
- [x] (S2) Vite + Vue 3 scaffold + npm install
- [x] (S2) Design tokens: `variables.css`, `base.css`
- [x] (S2) Data files: `skills.json`, `projects.json`
- [x] (S2) `NavBar.vue` — fixed nav with anchor links
- [x] (S2) `HeroSection.vue`, `SkillsSection.vue`, `ProjectsSection.vue` — skeletons
- [x] (S3) `useD3.js` composable — resize observer + SVG setup
- [x] (S3) `SkillsViz.vue` — D3 circle pack (nu vervangen door UnifiedViz)
- [x] (S4) `useScrollytelling.js` — Scrollama composable
- [x] (S4) `ScrollySection.vue` — sticky graphic + steps wrapper (nu ontkoppeld van viz)
- [x] (S5) `ProjectNetwork.vue` — D3 force network (nu vervangen door UnifiedViz)
- [x] (S6) `UnifiedViz.vue` — één gedeeld canvas, circle pack ↔ force network morph
- [x] (S6) `App.vue` twee-kolom layout, sticky viz pane, provide/inject vizState
- [x] (S6) `SkillsSection.vue` + `ProjectsSection.vue` — pure text steps
