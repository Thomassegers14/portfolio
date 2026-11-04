<script setup>
import dotUrl from '../../assets/icons/status-dot-6.svg'

defineProps({
  status: { type: String, required: true },
  center: { type: String, default: '' },
  right:  { type: String, default: '' },
})
</script>

<template>
  <footer class="status-bar">
    <div class="status-bar__left">
      <img :src="dotUrl" alt="" class="status-dot" width="6" height="6">
      <span class="mono-data text-secondary">{{ status }}</span>
    </div>
    <span class="mono-data status-bar__center">{{ center }}</span>
    <span class="mono-data text-tertiary">{{ right }}</span>
  </footer>
</template>

<style scoped>
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-5);
  height: 32px;
  padding: 0 var(--spacing-5);
  background: var(--color-bg-base);
  border-top: var(--border-width) solid var(--color-border-subtle);
  white-space: nowrap;
}

.status-bar__left {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

@media (max-width: 768px) {
  .status-bar__center { display: none; }
}
</style>
