# VOORTGANG.md

## Last Session

**Date:** 2026-04-15
**Session:** 7
**What was done:**
- Visuele verbeteringen aan `UnifiedViz.vue`:
  - Skill nodes omgezet van `circle` naar `g`-groepen (circle + label)
  - Labels gecentreerd in cirkels; `tspan` voor multi-word namen (2 regels)
  - Font-size schaalt met `packR`, verborgen voor r < 15
  - Pack padding: `depth === 1 → 20px` voor duidelijke categorieclustering
  - Projects mode: `forceRadial` trekt skills naar buitenste ring (36% min-dim), `forceX/Y` trekt projecten naar centrum
  - ResizeObserver doet volledige eerste init (geen race condition meer)
  - `100dvh` voor accurate viewport height
- Bugfix: project nodes werden naar linksboven getrokken — oorzaak: `forceXPack/Y` gebruikte strength 0.5 voor alle nodes, maar project nodes hebben geen `packX/Y` (→ target = 0). Fix: strength-functie die 0 teruggeeft voor project nodes.
- Mobile layout (Optie A):
  - Viz `position: sticky` bovenaan op mobile (45vw, min 220px)
  - Step-padding 30vh → 10vh op mobile
  - Scrollama offset 0.65 op mobile (triggert in tekstgebied onder de viz)

**Stopped at:**
Visualisatie werkt op desktop en mobile. Scrollytelling intact op beide. Volgende stap: verdere polish en deployment.

---

## TODO Next Session

- [ ] Browser QA op mobile (echte device of DevTools)
- [ ] Simulatie freeze na warmup (stopSimulation zodra alpha < minAlpha)
- [ ] Hero sectie verbeteren — momenteel leeg rechts; eventueel intro-animatie in viz
- [ ] Opruimen van ongebruikte bestanden: `SkillsViz.vue`, `ProjectNetwork.vue`, `ScrollySection.vue`
- [ ] Deploy (Netlify / Vercel)

---

## Backlog

- [ ] Final copy en persoonlijke content
- [ ] Responsive: verdere mobile polish na QA
- [ ] Morph verfijnen indien nodig na QA

---

## Completed

- [x] (S1) Define project concept, tech stack, folder structure, documentation
- [x] (S2) Vite + Vue 3 scaffold + npm install
- [x] (S2) Design tokens: `variables.css`, `base.css`
- [x] (S2) Data files: `skills.json`, `projects.json`
- [x] (S2) `NavBar.vue`, `HeroSection.vue`, section skeletons
- [x] (S3) `useD3.js`, `SkillsViz.vue` (vervangen)
- [x] (S4) `useScrollytelling.js`, `ScrollySection.vue`, skills scroll steps
- [x] (S5) `ProjectNetwork.vue` (vervangen), projects scroll steps
- [x] (S6) `UnifiedViz.vue` — één gedeeld canvas, circle pack ↔ force network morph
- [x] (S6) `App.vue` twee-kolom layout, sticky viz pane, provide/inject vizState
- [x] (S7) Labels in viz, category clustering, ring-layout voor projects mode
- [x] (S7) Bugfix: project nodes niet meer naar linksboven getrokken
- [x] (S7) Mobile layout: sticky viz top, compacte step-padding, offset aanpassing
