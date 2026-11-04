# CLAUDE.md — Portfolio Website

## Project Context

**What:** A personal portfolio website for a data designer and data analyst.
**Why:** Showcase skills and projects in a visually compelling, data-driven way that reflects professional identity.
**For whom:** Potential employers, clients, and collaborators in the data space.

The site is a **single-page editorial portfolio** built on the **Studio Mono** design system (Figma: `D5rkjzHGo8vYrj4StDlLWT`, page "Example" → "Ellis Rowe — Light editorial landing page"). Monochrome ink-and-paper, hairline borders, square corners.

The earlier D3 / 3D force-graph scrollytelling lives on branch `feature/3d-force-graph` and is not part of the current site.

---

## Tech Stack

| Tool | Role |
|---|---|
| Vue 3 (Composition API + `<script setup>`) | UI framework, component structure |
| Vite | Build tool |

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
| Introduction | `#home` | Masthead, edition register, hero headline, spotlight project, intro note |
| Selected work | `#work` | Featured project, staggered project pair, archive index of all other projects |
| About | `#about` | Statement, two-column bio, capabilities from `skills.json` |
| Contact | `#contact` | Invitation, email, socials, colophon status bar |

---

## Key Files and Their Role

```
src/
├── assets/
│   ├── data/
│   │   ├── site.json        # All copy & config: name, role, location, email, socials, featured project IDs
│   │   ├── skills.json      # Skills with category and unique ID
│   │   └── projects.json    # Projects with title, description, and linked skill IDs
│   └── icons/               # Status dot SVGs exported from Figma
├── components/
│   ├── layout/
│   │   ├── NavBar.vue           # Masthead: identity + nav
│   │   ├── ChapterRegister.vue  # "01 / Selected work" section header with hairline
│   │   └── StatusBar.vue        # Colophon footer
│   ├── ui/
│   │   └── ProjectFrame.vue     # Image slot with badge; grid-scaffold placeholder until imagery exists
│   └── sections/
│       ├── HeroSection.vue
│       ├── WorkSection.vue
│       ├── AboutSection.vue
│       └── ContactSection.vue
├── styles/
│   ├── variables.css        # Studio Mono tokens (color, type, spacing, radius)
│   └── base.css             # Reset, text styles (.title-l, .label-m, .mono-data…), .btn, .icon-btn, .badge
└── utils/
    └── projects.js          # Project ordering, A—NN references, skill lookups
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

- **Studio Mono only:** use tokens from `variables.css` and text-style classes from `base.css`; no hard-coded colors or fonts
- **Monochrome:** no accent colors — hierarchy through text alpha (primary / secondary / tertiary) and hairlines
- **Square corners:** `radius-full` only for icon buttons and status dots
- **Content in data:** copy lives in `site.json`, not in components
