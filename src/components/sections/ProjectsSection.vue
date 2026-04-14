<script setup>
// ProjectNetwork + scroll steps will be wired here
</script>

<template>
  <section id="projects" class="projects-section">
    <div class="projects-section__header">
      <p class="section-label">Projects</p>
      <h2 class="section-title">What I've built</h2>
    </div>
    <!-- ProjectNetwork and ScrollySection will be placed here -->
    <div class="projects-section__viz-placeholder">
      <span>Project network visualization — coming soon</span>
    </div>
  </section>
</template>

<style scoped>
.projects-section {
  min-height: 100vh;
}

.projects-section__header {
  margin-bottom: var(--space-12);
}

.section-label {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--color-storytelling);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: var(--text-4xl);
  font-weight: 700;
  letter-spacing: -0.02em;
}

.projects-section__viz-placeholder {
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
