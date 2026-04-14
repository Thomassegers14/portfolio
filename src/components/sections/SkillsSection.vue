<script setup>
import { ref, inject, watch } from 'vue'
import { useScrollytelling } from '../../composables/useScrollytelling.js'

const updateViz = inject('updateViz')

const steps = [
  {
    category: null,
    label: 'Skills',
    heading: 'What I work with',
    body: 'Six domains — from raw data to finished story. Scroll to explore each cluster.',
  },
  {
    category: 'analysis',
    label: 'Data Analysis',
    heading: 'Making sense of data',
    body: 'R is my primary tool for statistical computing, modeling, and data wrangling. SQL, Python, and Excel round out the analytical toolkit.',
  },
  {
    category: 'visualization',
    label: 'Data Visualization',
    heading: 'Drawing with data',
    body: 'D3.js for custom interactive SVGs, ggplot2 for publication-quality charts, and scrollytelling to guide the reader step by step.',
  },
  {
    category: 'geospatial',
    label: 'Geospatial',
    heading: 'Where data lives',
    body: 'QGIS for geographic processing and map production. Mapbox for interactive web maps with custom tile layers.',
  },
  {
    category: 'web',
    label: 'Web Development',
    heading: 'Building for the browser',
    body: 'JavaScript, Vue.js, and HTML & CSS — the stack behind every interactive piece I build, including this portfolio.',
  },
  {
    category: 'design',
    label: 'Design',
    heading: 'Craft and polish',
    body: 'Illustrator for vector graphics, InDesign for editorial layout, After Effects for motion — tools for the last mile of any data story.',
  },
  {
    category: 'storytelling',
    label: 'Storytelling',
    heading: 'The whole point',
    body: 'Data journalism, information design, and visual narrative. The skills that turn an analysis into something people actually read.',
  },
]

const stepsRef = ref(null)
const { currentStepIndex } = useScrollytelling(stepsRef)

watch(currentStepIndex, index => {
  if (index === -1) return // still in hero / scrolled back above
  const step = steps[index] ?? steps[0]
  updateViz({ mode: 'skills', activeCategory: step.category, activeProjectId: null })
})
</script>

<template>
  <section id="skills" class="skills-section">
    <div ref="stepsRef">
      <div
        v-for="(step, i) in steps"
        :key="i"
        class="scrolly-step"
        :data-step="i"
      >
        <div class="step-card" :class="step.category ? `step-card--${step.category}` : ''">
          <p class="step-card__label">{{ step.label }}</p>
          <h2 class="step-card__heading">{{ step.heading }}</h2>
          <p class="step-card__body">{{ step.body }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.skills-section {
  padding-top: var(--space-24);
  padding-bottom: var(--space-24);
}

/* ── Step spacing ─────────────────────────────────────────────────────────── */
.scrolly-step {
  padding: 30vh 0;
}

.scrolly-step:first-child { padding-top: 10vh; }
.scrolly-step:last-child  { padding-bottom: 40vh; }

/* ── Step cards ───────────────────────────────────────────────────────────── */
.step-card {
  max-width: 380px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-left: 3px solid var(--color-border);
}

.step-card--analysis     { border-left-color: var(--color-analysis);     }
.step-card--visualization{ border-left-color: var(--color-visualization);}
.step-card--geospatial   { border-left-color: var(--color-geospatial);   }
.step-card--web          { border-left-color: var(--color-web);          }
.step-card--design       { border-left-color: var(--color-design);       }
.step-card--storytelling { border-left-color: var(--color-storytelling); }

.step-card__label {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-bottom: var(--space-3);
}

.step-card--analysis     .step-card__label { color: var(--color-analysis);     }
.step-card--visualization .step-card__label{ color: var(--color-visualization);}
.step-card--geospatial   .step-card__label { color: var(--color-geospatial);   }
.step-card--web          .step-card__label { color: var(--color-web);          }
.step-card--design       .step-card__label { color: var(--color-design);       }
.step-card--storytelling .step-card__label { color: var(--color-storytelling); }

.step-card__heading {
  font-size: var(--text-2xl);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: var(--space-4);
}

.step-card__body {
  font-size: var(--text-base);
  color: var(--color-text-muted);
  line-height: 1.7;
}
</style>
