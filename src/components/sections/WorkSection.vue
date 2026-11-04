<script setup>
import site from '../../assets/data/site.json'
import ChapterRegister from '../layout/ChapterRegister.vue'
import ProjectFrame from '../ui/ProjectFrame.vue'
import { featuredProjects, archiveProjects } from '../../utils/projects.js'

const [lead, ...pair] = featuredProjects
</script>

<template>
  <section id="work" class="work page">
    <ChapterRegister label="01 / Selected work" :note="site.work.note" />

    <!-- ── Featured project ──────────────────────────────────────────────── -->
    <article v-if="lead" class="work__lead">
      <div class="work__story">
        <p class="mono-data text-secondary">{{ lead.ref }} / {{ lead.year }}</p>
        <div class="work__story-title">
          <h3 class="title-l">{{ lead.title }}</h3>
          <p class="title-m">{{ lead.client }}</p>
        </div>
        <p class="body-m text-secondary">{{ lead.description }}</p>
        <a v-if="lead.url" :href="lead.url" class="btn" target="_blank" rel="noopener">
          Explore the project <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div class="work__publication">
        <ProjectFrame :badge="`${lead.title} · ${lead.client}`" ratio="944 / 540" />
        <div class="work__caption mono-data text-secondary">
          <span>{{ lead.typeLabel }} / {{ lead.year }}</span>
          <span>{{ lead.skills.join(' / ') }}</span>
        </div>
      </div>
    </article>

    <!-- ── Project pair ──────────────────────────────────────────────────── -->
    <div v-if="pair.length" class="work__pair">
      <article
        v-for="(project, i) in pair"
        :key="project.id"
        class="work__card"
        :class="{ 'work__card--offset': i === 1 }"
      >
        <ProjectFrame :badge="project.ref" :ratio="i === 0 ? '736 / 484' : '512 / 356'" />
        <div class="work__details">
          <div class="work__caption mono-data text-secondary">
            <span>{{ project.typeLabel }} / {{ project.client }}</span>
            <span>{{ project.year }}</span>
          </div>
          <div class="work__heading">
            <h3 class="title-l">{{ project.title }}</h3>
            <a
              v-if="project.url"
              :href="project.url"
              class="icon-btn"
              target="_blank"
              rel="noopener"
              :aria-label="`Open ${project.title}`"
            >↗</a>
          </div>
          <p class="body-m text-secondary">{{ project.description }}</p>
        </div>
      </article>
    </div>

    <!-- ── Archive index ─────────────────────────────────────────────────── -->
    <div v-if="archiveProjects.length" class="work__archive">
      <div class="work__row work__row--head mono-data text-tertiary">
        <span>No.</span>
        <span>Project</span>
        <span class="work__col-type">Discipline</span>
        <span class="work__col-client">Client</span>
        <span class="work__col-year">Year</span>
      </div>
      <div v-for="project in archiveProjects" :key="project.id" class="work__row">
        <span class="mono-data text-secondary">{{ project.ref }}</span>
        <span class="title-m">{{ project.title }}</span>
        <span class="mono-data text-secondary work__col-type">{{ project.typeLabel }}</span>
        <span class="body-s text-secondary work__col-client">{{ project.client }}</span>
        <span class="mono-data work__col-year">{{ project.year }}</span>
      </div>
    </div>

    <!-- ── Closing note ──────────────────────────────────────────────────── -->
    <div class="work__closing rule-top">
      <p class="mono-data text-secondary">{{ site.work.closingNote }}</p>
      <a href="#contact" class="btn btn--ghost">More work on request <span aria-hidden="true">↗</span></a>
    </div>
  </section>
</template>

<style scoped>
.work {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding-bottom: 96px;
}

/* ── Featured project ────────────────────────────────────────────────────── */
.work__lead {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: var(--spacing-8);
  align-items: start;
}

.work__story {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-6);
  padding-top: var(--spacing-3);
}

.work__story-title {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.work__publication {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.work__caption {
  display: flex;
  justify-content: space-between;
  gap: var(--spacing-5);
}

/* ── Project pair ────────────────────────────────────────────────────────── */
.work__pair {
  display: grid;
  grid-template-columns: minmax(0, 736fr) minmax(0, 512fr);
  gap: 64px;
  align-items: start;
  padding-top: 40px;
}

.work__card {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-6);
}

.work__card--offset { padding-top: 128px; }

.work__details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
}

.work__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-5);
}

/* ── Archive index ───────────────────────────────────────────────────────── */
.work__archive {
  padding-top: 40px;
}

.work__row {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) 200px 160px 48px;
  gap: var(--spacing-6);
  align-items: baseline;
  padding: var(--spacing-5) 0;
  border-top: var(--border-width) solid var(--color-border-subtle);
  transition: background-color var(--transition-fast) var(--easing-smooth);
}

.work__row:not(.work__row--head):hover { background: var(--color-bg-hover); }

.work__row--head {
  padding: var(--spacing-4) 0;
  border-top: none;
}

.work__col-year { text-align: right; }

/* ── Closing note ────────────────────────────────────────────────────────── */
.work__closing {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-5);
  padding-top: var(--spacing-6);
  --rule-color: var(--color-border-subtle);
}

.work__closing .btn { padding-right: 0; }

/* ── Responsive ──────────────────────────────────────────────────────────── */
@media (max-width: 1100px) {
  .work__lead { grid-template-columns: 1fr; }
  .work__story { max-width: 560px; }
}

@media (max-width: 900px) {
  .work__pair { grid-template-columns: 1fr; gap: var(--spacing-8); }
  .work__card--offset { padding-top: 0; }
  .work__row { grid-template-columns: 56px minmax(0, 1fr) 140px 48px; }
  .work__col-client { display: none; }
}

@media (max-width: 640px) {
  .work { padding-bottom: 64px; }
  .work__caption { flex-direction: column; gap: var(--spacing-2); }
  .work__row { grid-template-columns: 48px minmax(0, 1fr) 40px; gap: var(--spacing-4); }
  .work__col-type { display: none; }
  .work__closing { flex-direction: column; align-items: flex-start; }
  .work__closing .btn { padding-left: 0; }
}
</style>
