<script setup>
import { ref } from 'vue'
import ProjectNetwork from '../charts/ProjectNetwork.vue'
import ScrollySection from '../layout/ScrollySection.vue'
import projectsData from '../../assets/data/projects.json'

const activeProjectId = ref(null)

// Steps: intro + one per project
const steps = [
  {
    projectId: null,
    label: 'Projects',
    heading: "What I've built",
    body: 'Eleven projects — each one a skill in action. Scroll to follow the connections.',
    typeClass: '',
  },
  ...projectsData.map(p => ({
    projectId: p.id,
    label: p.typeLabel,
    heading: p.title,
    body: p.description,
    year: p.year,
    client: p.client,
    typeClass: `step-card--${p.type}`,
  })),
]

function onStepEnter({ index }) {
  const step = steps[index] ?? null
  activeProjectId.value = step?.projectId ?? null
}
</script>

<template>
  <section id="projects" class="projects-section">
    <ScrollySection @step-enter="onStepEnter">

      <!-- Sticky network visualization -->
      <template #graphic>
        <ProjectNetwork :active-project-id="activeProjectId" />
      </template>

      <!-- Scroll steps -->
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="scrolly-step"
        :data-step="i"
      >
        <div class="step-card" :class="step.typeClass">
          <p class="step-card__label">{{ step.label }}</p>
          <h2 class="step-card__heading">{{ step.heading }}</h2>
          <p class="step-card__body">{{ step.body }}</p>
          <div v-if="step.year" class="step-card__meta">
            <span>{{ step.year }}</span>
            <span class="step-card__sep">·</span>
            <span>{{ step.client }}</span>
          </div>
        </div>
      </div>

    </ScrollySection>
  </section>
</template>

<style scoped>
.projects-section {
  padding: var(--section-pad-y) var(--space-8);
  max-width: var(--max-width);
  margin: 0 auto;
}

/* ── Step cards ───────────────────────────────────────────────────────────── */
.step-card {
  max-width: 360px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border);
}

.step-card--data-journalism     { border-left-color: var(--color-analysis);     }
.step-card--visual-storytelling { border-left-color: var(--color-storytelling); }
.step-card--experimental        { border-left-color: var(--color-web);          }

.step-card__label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.step-card--data-journalism     .step-card__label { color: var(--color-analysis);     }
.step-card--visual-storytelling .step-card__label { color: var(--color-storytelling); }
.step-card--experimental        .step-card__label { color: var(--color-web);          }

.step-card__heading {
  font-size: var(--text-xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.3;
  margin-bottom: var(--space-4);
}

.step-card__body {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  line-height: 1.7;
  margin-bottom: var(--space-4);
}

.step-card__meta {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  display: flex;
  gap: var(--space-2);
}

.step-card__sep {
  opacity: 0.4;
}
</style>
