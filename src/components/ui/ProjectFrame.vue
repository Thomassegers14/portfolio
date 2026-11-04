<script setup>
// Image slot for a project. Until real imagery exists it renders the Studio
// Mono grid scaffold; pass `src` to show a photograph instead.
defineProps({
  badge: { type: String, default: '' },
  src:   { type: String, default: '' },
  alt:   { type: String, default: '' },
  ratio: { type: String, default: '4 / 3' },
})
</script>

<template>
  <figure class="project-frame" :style="{ aspectRatio: ratio }">
    <img v-if="src" :src="src" :alt="alt" class="project-frame__img">
    <span v-else class="project-frame__pending mono-data text-tertiary">Image pending</span>
    <span v-if="badge" class="badge project-frame__badge">{{ badge }}</span>
  </figure>
</template>

<style scoped>
.project-frame {
  position: relative;
  width: 100%;
  overflow: hidden;
  background-color: var(--color-bg-raised);
  background-image:
    linear-gradient(var(--color-grid-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px);
  background-size: 40px 40px;
}

.project-frame__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.project-frame__pending {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

.project-frame__badge {
  position: absolute;
  top: var(--spacing-5);
  left: var(--spacing-5);
}
</style>
