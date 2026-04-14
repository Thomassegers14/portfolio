<script setup>
const links = [
  { label: 'Home',     href: '#home'     },
  { label: 'Skills',   href: '#skills'   },
  { label: 'Projects', href: '#projects' },
]
</script>

<template>
  <nav class="navbar">
    <span class="navbar__name">Thomas Segers</span>
    <ul class="navbar__links">
      <li v-for="link in links" :key="link.href">
        <a :href="link.href">{{ link.label }}</a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  height: var(--nav-height);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-8);
  background: color-mix(in srgb, var(--color-bg) 80%, transparent);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.navbar__name {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.navbar__links {
  display: flex;
  gap: var(--space-8);
  list-style: none;
}

.navbar__links a {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  transition: color var(--transition-fast) var(--easing-smooth);
}

.navbar__links a:hover {
  color: var(--color-text);
}
</style>
