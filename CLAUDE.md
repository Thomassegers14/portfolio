# CLAUDE.md — Portfolio Website

## Project Context

**What:** A personal portfolio website for a data designer and data analyst.
**Why:** Showcase skills and projects in a visually compelling, data-driven way that reflects professional identity.
**For whom:** Potential employers, clients, and collaborators in the data space.

The site is built as a **single-page scrollytelling experience**. Visualizations are central — not decorative. The narrative unfolds through scroll-driven D3 animations that connect skills to projects.

---

## Tech Stack

| Tool | Role |
|---|---|
| Vue 3 (Composition API + `<script setup>`) | UI framework, reactivity, component structure |
| D3.js | All data visualizations (SVG-based) |
| Scrollama.js | Scroll step detection for scrollytelling |
| Vite | Build tool |

**D3 integration principle:** D3 owns the SVG and handles all rendering. Vue owns data flow and triggers D3 updates via watchers or composables. Never let Vue's reactivity system directly mutate D3-managed DOM nodes.

---

## Conventions

- **Language:** English — code, comments, documentation, commit messages
- **File naming:** `PascalCase` for Vue components, `camelCase` for composables and utils
- **Git commit style:** Conventional Commits
  - `feat:` new functionality
  - `fix:` bug fixes
  - `style:` visual/CSS changes
  - `refactor:` code restructuring without behavior change
  - `chore:` config, dependencies, tooling
  - `data:` changes to JSON data files

---

## Site Structure

| Section | Route anchor | Description |
|---|---|---|
| Hero | `#home` | Short intro, D3 visualization already visible in background |
| Skills | `#skills` | Circle pack or force layout of skills; scroll-driven annotations |
| Projects | `#projects` | Network visualization linking skills to projects |

Navigation bar links to each anchor section.

---

## Key Files and Their Role

```
src/
├── assets/data/
│   ├── skills.json          # Skills with category, weight, and unique ID
│   └── projects.json        # Projects with title, description, and linked skill IDs
├── components/
│   ├── charts/
│   │   ├── SkillsViz.vue    # D3 circle pack / force layout for skills (section 1)
│   │   └── ProjectNetwork.vue  # D3 network: skills ↔ projects (section 2)
│   ├── layout/
│   │   ├── NavBar.vue       # Fixed navigation with anchor links
│   │   └── ScrollySection.vue  # Generic scrollytelling wrapper (sticky graphic + steps)
│   └── sections/
│       ├── HeroSection.vue  # Short intro with background visualization
│       ├── SkillsSection.vue   # Wraps SkillsViz + scroll step definitions
│       └── ProjectsSection.vue # Wraps ProjectNetwork + scroll step definitions
├── composables/
│   ├── useScrollytelling.js # Scroll progress tracking and step detection via Scrollama
│   └── useD3.js             # D3 lifecycle helpers: resize observer, cleanup on unmount
└── utils/
    └── d3.js                # Shared: color scales, layout presets, data transformation helpers
```

---

## Session Workflow

### At the START of each session:
1. Read `VOORTGANG.md` to understand where we left off
2. Check the current git status
3. Confirm the goal for this session before starting

### At the END of each session (proactively, without waiting to be asked):
1. Update `VOORTGANG.md` — last session summary, TODO for next session
2. Append a new entry to `Sessie Archief.md` with date, what was done, and any decisions made
3. Commit all changes with a meaningful commit message

---

## Design Principles

- **Data-first:** Visualizations lead the narrative, copy supports them
- **Smooth transitions:** D3 transitions should feel fluid (300–600ms, easing applied)
- **Consistent visual language:** Shared color palette and typography across all charts
- **Performance:** Keep SVG node count low; prefer canvas for large datasets if needed
