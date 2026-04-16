# Sessie Archief

Chronological log of all work sessions.

---

## Session 1 — 2026-04-14

**Goal:** Project setup and structure definition

**Done:**
- Defined project concept: single-page scrollytelling portfolio for a data designer/analyst
- Confirmed tech stack: Vue 3 (Composition API), D3.js, Scrollama.js, Vite
- Confirmed site structure: Hero → Skills (circle pack/force layout) → Projects (network)
- Set up full folder structure under `src/`
- Created `CLAUDE.md` with project context, conventions, key files, and session workflow
- Created `VOORTGANG.md` with session log and backlog
- Created `Sessie Archief.md`

**Decisions made:**
- D3 owns the SVG; Vue owns data flow — no mixing of reactive systems
- Scrollama.js for scroll step detection (lightweight, purpose-built)
- English for all code, comments, and documentation
- Conventional Commits for git history
- Hero section is short but the skills visualization is already visible in the background

**Next session starts with:** Vite project init + dependencies + first data files

---

## Session 2 — 2026-04-14

**Goal:** Vite scaffold, data files, CSS tokens, and component skeletons

**Done:**
- Scraped current portfolio site to extract projects and skills
- Created `skills.json` (22 skills across 6 categories: analysis, visualization, geospatial, web, design, storytelling)
- Created `projects.json` (11 projects, each linked to relevant skill IDs)
- Manual Vite + Vue 3 scaffold: `package.json`, `vite.config.js`, `index.html`, `src/main.js`, `src/App.vue`
- Installed `d3`, `scrollama`, `@vitejs/plugin-vue`
- `variables.css`: full design token set — dark theme, 6 category accent colors, typography, spacing, transition vars
- `base.css`: CSS reset + base styles
- `NavBar.vue`: fixed, frosted-glass backdrop, anchor links (#home, #skills, #projects)
- `HeroSection.vue`: full-height hero with name, tagline, CTA, radial gradient background placeholder for viz
- `SkillsSection.vue` and `ProjectsSection.vue`: placeholder sections with dashed-border viz slot
- Verified dev server runs at http://localhost:5174

**Decisions made:**
- Dark color theme (`#0a0a0f` background) — makes D3 visualizations pop
- 6 CSS custom properties for category colors (`--color-analysis`, etc.) — will be read by D3 color scale
- Skeleton-first approach: all sections exist as placeholders before D3 is added

**Next session starts with:** `useD3.js` composable + `SkillsViz.vue` circle pack

---

## Session 3 — 2026-04-14

**Goal:** `useD3.js` composable + `SkillsViz.vue` circle pack

**Done:**
- Built `useD3.js` composable — `ResizeObserver` driven, appends SVG on mount, calls `renderFn(svg, width, height)` on resize, cleans up on unmount
- Built `SkillsViz.vue` — D3 circle pack over 22 skills in 6 categories
  - Bubble size proportional to `weight`, colors from CSS custom properties
  - Labels rendered for circles with r > 22px
  - Hover interaction: circle scale + opacity
  - `activeSkillId` prop for scroll-driven external highlighting
  - `mode` prop: `'full'` (labels, hover, pointer events) vs `'background'` (transparent, static)
- Wired `SkillsViz mode="full"` into `SkillsSection.vue`
- Wired `SkillsViz mode="background"` into `HeroSection.vue` (positioned absolute, fills section)
- Dev server confirmed running (http://localhost:5177)

**Decisions made:**
- Circle pack chosen over force layout — cleaner grouping by category, works better as background element
- Colors read at render time via `getComputedStyle` — single source of truth in CSS vars
- D3 update pattern (enter/update/exit) in place from the start — ready for scroll-driven transitions

**Next session starts with:** `useScrollytelling.js` + `ScrollySection.vue` + first scroll steps in SkillsSection

---

## Session 4 — 2026-04-14

**Goal:** Scrollytelling infrastructure + scroll steps for SkillsSection

**Done:**
- `useScrollytelling.js`: Scrollama wrapper with Vue lifecycle, exports `currentStepIndex`, `currentStepData`, `direction`, resets on scroll back past step 0
- `ScrollySection.vue`: sticky graphic (right column) + scrollable steps (left column), emits `step-enter` with index and data
- `SkillsSection.vue`: 7 scroll steps (1 intro + 1 per skill category), each with label, heading, and body copy
- `SkillsViz.vue`: added `activeCategory` prop — active category circles light up (fill-opacity 0.5), inactive dim (0.06), labels follow
- Build confirmed clean

**Decisions made:**
- Category-level highlighting chosen over per-skill for the first pass — cleaner read, less noise
- Steps left column, graphic right column — standard scrollytelling layout, keeps viz always visible

**Next session starts with:** `ProjectNetwork.vue` — D3 force-directed network (skills ↔ projects)

---

## Session 5 — 2026-04-14

**Goal:** `ProjectNetwork.vue` + `ProjectsSection.vue` scroll steps

**Done:**
- `ProjectNetwork.vue`: D3 force simulation with 34 nodes (23 skills + 11 projects) and ~40 links
  - Skill nodes: circles, colored by category CSS var, sized by weight
  - Project nodes: diamonds (rotated rect), colored by type (data-journalism/visual-storytelling/experimental)
  - `activeProjectId` prop: connected skills light up (fill 0.5, stroke 1), unconnected dim (0.05); active project diamond fills; label appears
  - `applyHighlight()` called both from watch and after re-render (handles resize during active step)
  - Simulation stops on unmount
- `ProjectsSection.vue`: 12 scroll steps wired to `ProjectNetwork` via `ScrollySection`
  - Steps include project title, description, year, client
  - Card left-border color follows project type
- Build confirmed clean (607 modules, no errors)

**Decisions made:**
- Project type → color mapped to existing CSS vars (data-journalism = analysis/indigo, visual-storytelling = violet, experimental = amber)
- Force sim parameters: charge -90, link distance 85, collide based on node type
- Labels only appear for the active project — keeps viz readable at 11 nodes

**Next session starts with:** Visual polish pass + simulation warmup freeze + browser QA

---

## Session 6 — 2026-04-14

**Goal:** Unify skills en projects in één gedeelde visualisatie

**Done:**
- `UnifiedViz.vue`: één D3 canvas met twee modi
  - Skills mode: forceX/Y trekken elke skill-node naar zijn circle-pack-positie (sterk, 0.5)
  - Projects mode: pack-forces vrijgelaten (strength → 0), force-network neemt over
  - Morph via krachtenverandering op lopende simulatie — nodes driften organisch van pakking naar netwerk
  - `applyMode()` + `applyHighlight()` gescheiden zodat beide onafhankelijk aanroepbaar zijn
  - ResizeObserver herberekent packX/packY in-place; force-accessor leest van node-datum
- `App.vue`: twee-kolom grid (1fr 1fr), `aside.app-layout__viz` sticky op `top: nav-height`
- `provide('updateViz')` — secties injecteren en roepen aan op step-enter
- `SkillsSection.vue`, `ProjectsSection.vue`: alleen steps + useScrollytelling + inject
- `HeroSection.vue`: tekst-only, geen achtergrondviz
- Build clean (603 modules, 141kB JS)

**Decisions made:**
- `SkillsViz.vue` en `ProjectNetwork.vue` zijn niet verwijderd maar worden niet meer gebruikt — ze worden volgende sessie opgeruimd of bewaard als referentie
- Pack-krachten aanpak (forceX/Y) boven full re-init bij mode-switch — vloeiendere morph
- `provide/inject` boven custom events — vermijdt prop-drilling door HeroSection heen

**Next session starts with:** Browser QA, skill labels in viz, simulatie freeze na warmup

---

## Session 7 — 2026-04-15

**Goal:** Viz verbeteren: labels, ring-layout, mobile responsive

**Done:**
- `UnifiedViz.vue` volledig herschreven:
  - Skill nodes: `circle` → `g` (circle + text), labels gecentreerd, tspan voor multi-word namen
  - Font-size: `min(11px, packR × 0.34)`, verborgen voor r < 15
  - Pack padding depth-1 = 20px: duidelijke visuele categorieclusters
  - Projects mode: `forceRadial(36% × min(w,h))` voor skills op buitenste ring; `forceX/Y` voor projecten naar centrum
  - ResizeObserver doet volledige init op eerste geldige grootte (race condition opgelost)
  - `100dvh` voor correcte viewport height op mobile browsers
- Bugfix: project nodes naar linksboven — `forceXPack/Y` met scalar strength 0.5 trekt project nodes (zonder packX/Y) naar x=0, y=0. Fix: strength-functie `d => d.nodeType === 'skill' ? 0.5 : 0`
- Mobile layout (Optie A na overleg):
  - Viz `position: sticky` bovenaan (45vw, min 220px, max 360px)
  - Step-padding: 30vh → 10vh op ≤768px
  - Scrollama offset: automatisch 0.65 op mobile (triggert in zichtbaar tekstgebied)

**Decisions made:**
- Optie A gekozen voor mobile na overleg (sticky-top viz + scrollytelling bewaard) boven statische banner of aparte layout
- Labels auto-hidden op mobile (cirkels te klein) — geen expliciete mobile-only logica nodig

**Next session starts with:** Browser QA op mobile, simulatie freeze, deployment voorbereiden

---

## Session 8 — 2026-04-16

**Goal:** Opkuis ongebruikte code + hero restyling op basis van referentiedesign

**Done:**
- Verwijderd: `SkillsViz.vue`, `ProjectNetwork.vue`, `ScrollySection.vue`, `useD3.js` — allemaal vervangen door `UnifiedViz.vue` in sessie 6, nergens meer geïmporteerd (532 regels weg)
- Hero volledig herschreven naar referentiedesign (13g.fr stijl):
  - Crimson Pro serif als display-font voor de headline
  - Groot italic groen accentwoord in de titel
  - Eyebrow label met decoratieve groene lijn
- Fonts: DM Sans vervangt Inter als `--font-sans`; Crimson Pro toegevoegd als `--font-serif`
- Nieuwe design tokens: `--color-primary`, `--color-border-2`, `--color-shadow`, `--text-display`
- Globale `.btn-pill` stijl in `base.css`: donkere achtergrond, afgeronde hoeken, border, shadow-hover
- NavBar: Contact-knop toegevoegd; alle nav-links en Contact gebruiken `.btn-pill`

**Decisions made:**
- `.btn-pill` globaal in `base.css` — één definitie, herbruikbaar via class overal in de site
- DM Sans boven Inter — betere pairing met Crimson Pro, iets geometrischer karakter
- Crimson Pro italic voor het accentwoord in de headline — verwijzing naar editorial/journalistiek werk

**Next session starts with:** Browser QA op mobile, simulatie freeze, deployment (Netlify/Vercel)

---

## Session 9 — 2026-04-16

**Goal:** Eerste deployment naar Vercel

**Done:**
- 2 openstaande commits gepusht naar `Thomassegers14/portfolio` op GitHub
- Site gedeployed via Vercel dashboard (import van GitHub repo)
- Vercel detecteert Vite automatisch: build `vite build`, output `dist`

**Decisions made:**
- Vercel dashboard boven CLI — snelste weg voor een eerste deploy, geen config nodig
- Elke push naar `main` triggert automatisch een nieuwe Vercel deploy

**Next session starts with:** Browser QA op live URL, simulatie freeze, final copy

---
