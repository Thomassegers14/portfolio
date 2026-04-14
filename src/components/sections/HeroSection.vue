<script setup>
import SkillsViz from '../charts/SkillsViz.vue'
</script>

<template>
  <section id="home" class="hero">
    <div class="hero__content">
      <p class="hero__label">Data Designer & Data Analyst</p>
      <h1 class="hero__title">Thomas Segers</h1>
      <p class="hero__sub">
        I turn data into stories — through journalism, visualization, and design.
      </p>
      <a href="#skills" class="hero__cta">Explore my skills</a>
    </div>

    <!-- Background visualization — semi-transparent circle pack -->
    <SkillsViz mode="background" />
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding-top: var(--nav-height);
  overflow: hidden;
}

.hero__content {
  position: relative;
  z-index: 2;
  max-width: 560px;
}

.hero__label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-visualization);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-4);
}

.hero__title {
  font-size: var(--text-5xl);
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-6);
}

.hero__sub {
  font-size: var(--text-lg);
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: var(--space-8);
}

.hero__cta {
  display: inline-block;
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-visualization);
  border: 1px solid var(--color-visualization);
  padding: var(--space-3) var(--space-6);
  letter-spacing: 0.06em;
  transition: background var(--transition-fast) var(--easing-smooth),
              color var(--transition-fast) var(--easing-smooth);
}

.hero__cta:hover {
  background: var(--color-visualization);
  color: var(--color-bg);
}
</style>
