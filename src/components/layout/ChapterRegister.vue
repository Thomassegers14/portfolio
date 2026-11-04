<script setup>
defineProps({
  label: { type: String, required: true },
  note:  { type: String, default: '' },
})
</script>

<template>
  <header class="chapter-register rule-top">
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
}

@media (max-width: 640px) {
  .chapter-register {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-3);
  }
}
</style>
