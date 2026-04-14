<script setup>
import { ref } from 'vue'
import SkillsViz from '../charts/SkillsViz.vue'

const activeSkillId = ref(null)
</script>

<template>
  <section id="skills" class="skills-section">
    <div class="skills-section__header">
      <p class="section-label">Skills</p>
      <h2 class="section-title">What I work with</h2>
    </div>

    <SkillsViz :active-skill-id="activeSkillId" mode="full" />
  </section>
</template>

<style scoped>
.skills-section {
  min-height: 100vh;
  padding: var(--section-pad-y) var(--space-8);
  max-width: var(--max-width);
  margin: 0 auto;
}

.skills-section__header {
  margin-bottom: var(--space-12);
}

.section-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-visualization);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}
</style>
