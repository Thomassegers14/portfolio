<script setup>
import site from '../../assets/data/site.json'
import dotUrl from '../../assets/icons/status-dot.svg'
import ProjectFrame from '../ui/ProjectFrame.vue'
import ParticleHeadline from '../ui/ParticleHeadline.vue'
import { projectById, yearRange } from '../../utils/projects.js'

const spotlight = projectById(site.hero.spotlightProjectId)
</script>

<template>
  <section id="home" class="intro page">

    <div class="intro__register mono-data text-secondary">
      <p>Portfolio / Selected work {{ yearRange }}</p>
      <p>{{ site.location }}</p>
    </div>

    <div class="intro__hero">
      <ParticleHeadline :lines="site.hero.headline" />

      <aside v-if="spotlight" class="intro__spotlight">
        <div class="intro__caption-row mono-data text-secondary">
          <span>Latest work / {{ spotlight.typeLabel }}</span>
          <span>{{ spotlight.ref }}</span>
        </div>
        <ProjectFrame ratio="432 / 296" :reveal="false" />
        <div class="intro__caption-row">
          <span class="mono-data">{{ spotlight.title }} / {{ spotlight.year }}</span>
          <a href="#work" class="icon-btn" :aria-label="`Go to ${spotlight.title}`"><span aria-hidden="true">↗</span></a>
        </div>
      </aside>
    </div>

    <div class="intro__note">
      <a href="#work" class="intro__invitation">
        <span class="icon-btn icon-btn--down" aria-hidden="true"><span>↓</span></span>
        <span class="label-m">Selected work below</span>
      </a>
      <p class="body-m text-secondary intro__description">{{ site.hero.intro }}</p>
      <div class="intro__availability">
        <img :src="dotUrl" alt="" class="status-dot" width="5" height="5">
        <p class="mono-data">
          <template v-for="(line, i) in site.hero.availability" :key="i">{{ line }}<br v-if="i < site.hero.availability.length - 1"></template>
        </p>
      </div>
    </div>

  </section>
</template>

<style scoped>
/* ── Edition register ────────────────────────────────────────────────────── */
.intro__register {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-5);
  padding: 28px 0 52px;
}

/* ── Editorial hero ──────────────────────────────────────────────────────── */
.intro__hero {
  display: grid;
  grid-template-columns: minmax(0, 816fr) minmax(0, 432fr);
  gap: 64px;
  align-items: end;
}

.intro__spotlight {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  padding-bottom: var(--spacing-3);
}

.intro__caption-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-5);
}

/* ── Introduction note ───────────────────────────────────────────────────── */
.intro__note {
  display: grid;
  grid-template-columns: 320px minmax(0, 496px) minmax(0, 1fr);
  gap: 64px;
  align-items: end;
  padding: 44px 0 56px;
}

.intro__invitation {
  display: flex;
  align-items: center;
  gap: var(--spacing-5);
}

.intro__invitation:hover .icon-btn {
  border-color: var(--color-border-strong);
  background: var(--color-bg-hover);
}

.intro__availability {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
}

/* ── Opening sequence ────────────────────────────────────────────────────
   Masthead rule draws (NavBar) → headline gathers from particles
   (ParticleHeadline) → spotlight frame uncovers → registers settle in. */
@media (prefers-reduced-motion: no-preference) {
  .intro__register {
    animation: fade-in 500ms var(--ease-out-expo) 250ms both;
  }

  .intro__spotlight > .project-frame {
    animation: frame-uncover 900ms var(--ease-out-expo) 400ms both;
  }

  .intro__caption-row {
    animation: fade-in 500ms var(--ease-out-expo) 700ms both;
  }

  .intro__note {
    animation: fade-in 600ms var(--ease-out-expo) 800ms both;
  }
}

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .intro__note {
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-7) var(--spacing-8);
  }

  .intro__invitation { grid-column: 1 / -1; order: 1; }
}

@media (max-width: 900px) {
  .intro__hero {
    grid-template-columns: 1fr;
    gap: var(--spacing-8);
  }
}

@media (max-width: 640px) {
  .intro__register {
    flex-direction: column;
    gap: var(--spacing-3);
    padding: var(--spacing-6) 0 var(--spacing-8);
  }

  .intro__note { grid-template-columns: 1fr; }
}
</style>
