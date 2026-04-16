# VOORTGANG.md

## Last Session

**Date:** 2026-04-16
**Session:** 9
**What was done:**
- Ongebruikte bestanden verwijderd: `SkillsViz.vue`, `ProjectNetwork.vue`, `ScrollySection.vue`, `useD3.js` (532 regels weg, build groen)
- Hero sectie volledig herschreven op basis van referentiedesign (13g.fr):
  - Crimson Pro als display-font (serif), DM Sans vervangt Inter als sans-serif
  - Grote serif headline met cursief groen accent-woord
  - Eyebrow label met groene streep prefix
  - Subtekst in twee lagen (body + muted)
- Design tokens uitgebreid in `variables.css`:
  - `--font-serif: 'Crimson Pro'`, `--font-sans: 'DM Sans'`
  - `--color-primary: #8EDD8E`, `--color-border-2`, `--color-shadow`
  - `--text-display: clamp(3.2rem, 6vw, 5.5rem)`
- Google Fonts geladen in `index.html`: Crimson Pro, DM Sans, JetBrains Mono
- Globale `.btn-pill` stijl aangemaakt in `base.css`:
  - Donkere achtergrond, `border-radius: 0.56rem`, border, shadow bij hover
  - Gebruikt door hero CTA én alle navbar-links incl. Contact-knop
- NavBar: Contact-knop toegevoegd, alle links (incl. Contact) gebruiken `.btn-pill`

**Stopped at:**
Site live op Vercel. Vercel CLI niet gebruikt — deploy via dashboard na GitHub push. Volgende stap: QA, simulatie freeze, verdere polish.

---

## TODO Next Session

- [ ] Browser QA op mobile (echte device of DevTools)
- [ ] Simulatie freeze na warmup (stopSimulation zodra alpha < minAlpha)
- [ ] Deploy (Netlify / Vercel)
- [ ] Final copy — lorem ipsum in hero vervangen door echte tekst

---

## Backlog

- [ ] Domeinnaam koppelen aan Vercel (DNS configureren bij registrar)
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
