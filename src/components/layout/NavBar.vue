<script setup>
import site from '../../assets/data/site.json'
import { projects } from '../../utils/projects.js'

const links = [
  { label: `Work (${String(projects.length).padStart(2, '0')})`, href: '#work'  },
  { label: 'About',                                               href: '#about' },
]
</script>

<template>
  <nav class="masthead page">
    <div class="masthead__inner">
      <a href="#home" class="masthead__identity">
        <span class="title-m">{{ site.name }}</span>
        <span class="mono-data text-secondary masthead__practice">
          <template v-for="(line, i) in site.role" :key="i">{{ line }}<br v-if="i < site.role.length - 1"></template>
        </span>
      </a>
      <div class="masthead__nav">
        <a v-for="link in links" :key="link.href" :href="link.href" class="label-m masthead__link">
          {{ link.label }}
        </a>
        <a href="#contact" class="btn btn--ghost">Get in touch <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.masthead__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 96px;
  border-bottom: var(--border-width) solid var(--color-border-default);
  white-space: nowrap;
}

.masthead__identity {
  display: flex;
  align-items: center;
  gap: var(--spacing-7);
}

.masthead__nav {
  display: flex;
  align-items: center;
  gap: var(--spacing-7);
}

.masthead__link {
  transition: color var(--transition-fast) var(--easing-smooth);
}

.masthead__link:hover { color: var(--color-text-secondary); }

@media (max-width: 768px) {
  .masthead__practice { display: none; }
  .masthead__nav      { gap: var(--spacing-5); }
}

@media (max-width: 640px) {
  .masthead__inner { height: 72px; }
  .masthead__link  { display: none; }
  .masthead__nav .btn { padding: 0; }
}
</style>
