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
