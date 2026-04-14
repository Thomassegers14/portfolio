<script setup>
// SkillsViz + scroll steps will be wired here
</script>

<template>
  <section id="skills" class="skills-section">
    <div class="skills-section__header">
      <p class="section-label">Skills</p>
      <h2 class="section-title">What I work with</h2>
    </div>
    <!-- SkillsViz and ScrollySection will be placed here -->
    <div class="skills-section__viz-placeholder">
      <span>Skills visualization — coming soon</span>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  min-height: 100vh;
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

.skills-section__viz-placeholder {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px dashed var(--color-border);
  color: var(--color-text-muted);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}
</style>
