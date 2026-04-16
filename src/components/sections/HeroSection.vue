<script setup>
// No viz here — UnifiedViz lives in the sticky right pane (App.vue)
</script>

<template>
  <section id="home" class="hero">
    <div class="hero__inner">

      <p class="hero__eyebrow">Data Designer &amp; Data Analyst</p>

      <h1 class="hero__title">
        Turning<br>
        data into<br>
        stories.
      </h1>

      <p class="hero__sub">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Quas eaque id odio pariatur! Obcaecati cum eius enim accusamus ad molestias deserunt sed officiis hic ea aliquid excepturi illum, laborum sapiente.
      </p>

      <p class="hero__sub hero__sub--muted">
        Journalism, visualization, and design —<br>
        three lenses on the same truth.
      </p>

      <a href="#skills" class="hero__cta btn-pill">Explore my work</a>

    </div>
  </section>
</template>

<style scoped>
.hero {
  min-height: calc(100dvh - var(--nav-height));
  display: flex;
  align-items: center;
  padding: var(--space-16) var(--space-12);
}

.hero__inner {
  max-width: 520px;
}

/* ── Eyebrow ─────────────────────────────────────────────────────────────── */
.hero__eyebrow {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  color: var(--color-primary);
  margin-bottom: var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.hero__eyebrow::before {
  content: '';
  display: inline-block;
  width: 28px;
  height: 1px;
  background: var(--color-primary);
  flex-shrink: 0;
}

/* ── Display title ───────────────────────────────────────────────────────── */
.hero__title {
  font-family: var(--font-serif);
  font-size: var(--text-display);
  font-weight: 200;
  line-height: 0.8;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin-bottom: var(--space-8);
}

.hero__title em {
  font-style: italic;
  color: var(--color-primary);
}

/* ── Sub copy ────────────────────────────────────────────────────────────── */
.hero__sub {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  font-weight: 300;
  color: var(--color-text);
  line-height: 1.65;
  margin-bottom: var(--space-12);
}

.hero__sub--muted {
  color: var(--color-text-muted);
}

/* ── Mobile ──────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .hero {
    padding: var(--space-8) var(--space-6);
    align-items: flex-start;
    padding-top: var(--space-12);
  }

  .hero__title {
    font-size: clamp(2.4rem, 10vw, 3.2rem);
  }

  .hero__sub {
    font-size: var(--text-lg);
  }
}
</style>
