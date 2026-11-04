# VOORTGANG.md

## Last Session

**Date:** 2026-11-04
**Session:** 11
**What was done:**
- Portfolio omgebouwd naar het **Studio Mono** design system (Figma `D5rkjzHGo8vYrj4StDlLWT`), op branch `feature/studio-mono`
- Structuur overgenomen van het Figma-voorbeeld: Introduction → Selected work → About → Contact + colofon
- Tokens 1-op-1 uit Figma: kleuren (dark mode), Newsreader / Geist / Geist Mono, spacing 0–48, radius none/full
- Globale componenten: `.btn` (primary/secondary/ghost), `.icon-btn`, `.badge`, tekststijlen
- Nieuwe componenten: `ChapterRegister`, `StatusBar`, `ProjectFrame`, `WorkSection`, `AboutSection`, `ContactSection`
- Alle copy in `site.json`
- 3D-viz, UnifiedViz, scrollytelling + deps (`d3`, `scrollama`, `3d-force-graph`) verwijderd; 3D bewaard op `feature/3d-force-graph` (labeltweak lokaal gecommit, niet gepusht)
- Visueel gecheckt op 1440px en 390px
- Volle-breedte hairlines, fixed masthead, sticky chapter registers
- Motion "drukproef": openingssequentie (rule draw, headline line-mask, frame uncover), `v-reveal` directive (rule / frame / row), glyph-nudge hover; reduced-motion = statisch

**Stopped at:**
Re-skin staat, build groen. Nog niet gemerged naar `main`. Content bevat placeholders.

---

## TODO Next Session

- [ ] **10 dummy-projecten uit `projects.json` halen** (toegevoegd in S10 voor de 3D-graph) — staan nu in de archieflijst
- [ ] `site.json` invullen: e-mail (staat op `hello@example.com`), locatie, beschikbaarheid, LinkedIn
- [ ] Featured projects (`featuredProjectIds`) en spotlight bevestigen
- [ ] Projectbeelden + portret toevoegen (`ProjectFrame` accepteert `src`); eventueel `url` per project voor de ↗-knoppen
- [ ] Final copy nalezen (hero, about, contact)
- [ ] Trackers in de hero: later echte data tonen i.p.v. abstracte coördinaten (`ParticleHeadline.vue` → `updateTrackers`)
- [ ] ParticleHeadline testen op echte devices (iPhone, oudere laptop) — enkel headless gemeten
- [ ] `feature/studio-mono` mergen naar `main` en deployen
- [ ] Beslissen: `feature/3d-force-graph` behouden, inpassen of archiveren

---

## Backlog

- [x] Domeinnaam koppelen aan Vercel (DNS configureren bij registrar)
- [ ] Final copy en persoonlijke content
- [ ] Responsive: verdere mobile polish na QA
- [ ] Morph verfijnen indien nodig na QA

---

## Completed

- [x] (S11) Studio Mono re-skin + editorial structuur

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
