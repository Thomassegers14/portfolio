<script setup>
import { vReveal } from '../../directives/reveal.js'

defineProps({
  label: { type: String, required: true },
  note:  { type: String, default: '' },
})
</script>

<template>
  <header v-reveal="'rule'" class="chapter-register rule-top">
    <h2 class="label-m">{{ label }}</h2>
    <p v-if="note" class="mono-data text-secondary">{{ note }}</p>
  </header>
</template>

<style scoped>
.chapter-register {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-5);
  padding: var(--spacing-5) 0;

  /* Sticks under the masthead; -1px lets both hairlines overlap into one */
  position: sticky;
  top: calc(var(--masthead-height) - var(--border-width));
  z-index: 10;

  /* Full-bleed background so content doesn't show through the gutters */
  background: var(--section-bg, var(--color-bg-base));
  box-shadow: 0 0 0 100vmax var(--section-bg, var(--color-bg-base));
  clip-path: inset(0 -100vmax);
}

@media (max-width: 640px) {
  .chapter-register {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
}
</style>
