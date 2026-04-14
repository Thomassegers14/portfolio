<script setup>
/**
 * ScrollySection — generic scrollytelling wrapper.
 *
 * Layout: sticky graphic on the right, scrollable steps on the left.
 * The parent is responsible for:
 *   - Providing step content via the default slot (each step = a div.scrolly-step)
 *   - Providing the visualization via the `graphic` named slot
 *
 * Props:
 *   offset {number}  - Scrollama trigger offset (0–1). Default 0.5 (midscreen).
 */
import { ref } from 'vue'
import { useScrollytelling } from '../../composables/useScrollytelling.js'

const props = defineProps({
  offset: { type: Number, default: 0.5 },
})

const emit = defineEmits(['step-enter'])

const stepsRef = ref(null)
const { currentStepIndex, currentStepData, direction } = useScrollytelling(stepsRef, {
  offset: props.offset,
})

// Bubble step changes up so the parent can react (e.g. update activeSkillId).
import { watch } from 'vue'
watch(currentStepIndex, (index) => {
  emit('step-enter', { index, data: currentStepData.value, direction: direction.value })
})
</script>

<template>
  <div class="scrolly-section">
    <!-- Sticky graphic — stays in view while steps scroll past -->
    <div class="scrolly-section__graphic">
      <slot name="graphic" :step-index="currentStepIndex" :step-data="currentStepData" />
    </div>

    <!-- Scrollable step text -->
    <div ref="stepsRef" class="scrolly-section__steps">
      <slot :step-index="currentStepIndex" />
      <!-- Spacer at the end so the last step can trigger and still be read comfortably -->
      <div class="scrolly-section__end-spacer" aria-hidden="true" />
    </div>
  </div>
</template>

<style scoped>
.scrolly-section {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-12);
  align-items: start;
}

/* Sticky graphic occupies the right column */
.scrolly-section__graphic {
  position: sticky;
  top: calc(var(--nav-height) + var(--space-8));
  height: calc(100vh - var(--nav-height) - var(--space-16));
}

/* Steps scroll in the left column */
.scrolly-section__steps {
  padding-top: 30vh;
}

.scrolly-section__end-spacer {
  height: 40vh;
}
</style>
