<script setup>
import { ref, provide } from 'vue'
import NavBar          from './components/layout/NavBar.vue'
import HeroSection     from './components/sections/HeroSection.vue'
import SkillsSection   from './components/sections/SkillsSection.vue'
import ProjectsSection from './components/sections/ProjectsSection.vue'
import UnifiedViz      from './components/charts/UnifiedViz.vue'
import ForceGraph3D    from './components/charts/ForceGraph3D.vue'

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

  <!-- Fullscreen background viz -->
  <aside class="app-viz-bg" aria-hidden="true">
    <ForceGraph3D
      :mode="vizState.mode"
      :active-category="vizState.activeCategory"
      :active-project-id="vizState.activeProjectId"
    />
  </aside>

  <!-- Scrolling content overlaid on top -->
  <div class="app-scroll">
    <HeroSection />
    <SkillsSection />
    <ProjectsSection />
  </div>
</template>

<style>
/* ── Fullscreen fixed viz behind everything ───────────────────────────────── */
.app-viz-bg {
  position: fixed;
  inset: 0;
  z-index: 0;
}

/* ── Scroll content sits on top ──────────────────────────────────────────── */
.app-scroll {
  position: relative;
  z-index: 1;
  padding-top: var(--nav-height);
  pointer-events: none; /* let Three.js camera controls work through */
}

/* re-enable pointer events on interactive elements */
.app-scroll a,
.app-scroll button,
.app-scroll [data-step] {
  pointer-events: auto;
}
</style>
