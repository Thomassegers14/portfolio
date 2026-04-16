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
    <div class="navbar__right">
      <ul class="navbar__links">
        <li v-for="link in links" :key="link.href">
          <a :href="link.href" class="btn-pill">{{ link.label }}</a>
        </li>
      </ul>
      <a href="#contact" class="btn-pill">Contact</a>
    </div>
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
  /* background: color-mix(in srgb, var(--color-bg) 60%, transparent); */
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-border);
}

.navbar__name {
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  color: var(--color-text-muted);
  letter-spacing: 0.05em;
}

.navbar__right {
  display: flex;
  align-items: center;
  gap: var(--space-8);
}

.navbar__links {
  display: flex;
  gap: var(--space-2);
  list-style: none;
}


</style>
