<script setup>
import { ref, provide } from 'vue'
import NavBar          from './components/layout/NavBar.vue'
import HeroSection     from './components/sections/HeroSection.vue'
import SkillsSection   from './components/sections/SkillsSection.vue'
import ProjectsSection from './components/sections/ProjectsSection.vue'
import UnifiedViz      from './components/charts/UnifiedViz.vue'

// ── Shared viz state ──────────────────────────────────────────────────────────
// Sections inject `updateViz` and call it when their scroll step changes.
const vizState = ref({
  mode:            'skills',
  activeCategory:  null,
  activeProjectId: null,
})

function updateViz(patch) {
  vizState.value = { ...vizState.value, ...patch }
}

provide('updateViz', updateViz)
</script>

<template>
  <NavBar />

  <div class="app-layout">
    <!-- Left: scrolling text content -->
    <div class="app-layout__scroll">
      <HeroSection />
      <SkillsSection />
      <ProjectsSection />
    </div>

    <!-- Right: sticky visualization pane -->
    <aside class="app-layout__viz" aria-hidden="true">
      <UnifiedViz
        :mode="vizState.mode"
        :active-category="vizState.activeCategory"
        :active-project-id="vizState.activeProjectId"
      />
    </aside>
  </div>
</template>

<style>
.app-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  min-height: 100dvh;
  padding-top: var(--nav-height);
}

.app-layout__scroll {
  min-width: 0; /* prevent grid blowout */
}

.app-layout__viz {
  position: sticky;
  top: var(--nav-height);
  /* 100dvh accounts for mobile browser chrome correctly */
  height: calc(100dvh - var(--nav-height));
  overflow: hidden;
}

/* Mobile: single column, viz sticky at top, text scrolls below */
@media (max-width: 768px) {
  .app-layout {
    grid-template-columns: 1fr;
  }

  .app-layout__viz {
    order: -1;                        /* viz above text */
    position: sticky;
    top: var(--nav-height);
    height: 45vw;
    min-height: 220px;
    max-height: 360px;
    z-index: 10;                      /* stay above scrolling cards */
  }
}
</style>
