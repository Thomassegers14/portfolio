<script setup>
import site from '../../assets/data/site.json'
import ChapterRegister from '../layout/ChapterRegister.vue'
import ProjectFrame from '../ui/ProjectFrame.vue'
import { skillCategories } from '../../utils/projects.js'
</script>

<template>
  <section id="about" class="about">
    <div class="about__inner page">
      <ChapterRegister label="02 / A point of view" :note="site.about.note" />

      <div class="about__perspective">
        <div class="about__portrait">
          <ProjectFrame ratio="320 / 392" />
          <div class="about__caption mono-data text-secondary">
            <span>{{ site.name }}</span>
            <span>{{ new Date().getFullYear() }}</span>
          </div>
        </div>

        <div class="about__view">
          <p class="headline headline--statement">
            <template v-for="(line, i) in site.about.statement" :key="i">{{ line }}<br v-if="i < site.about.statement.length - 1"></template>
          </p>

          <div class="about__bio body-m text-secondary">
            <p>{{ site.about.approach }}</p>
            <p>{{ site.about.philosophy }}</p>
          </div>

          <div class="about__practice">
            <p class="mono-data text-secondary">The practice</p>
            <ul class="about__capabilities">
              <li v-for="group in skillCategories" :key="group.category" class="about__capability">
                <span class="body-s">{{ group.label }}</span>
                <span class="mono-data text-tertiary">{{ group.skills.join(' / ') }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about {
  background: var(--color-bg-sunken);
}

.about__inner {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding-top: var(--spacing-7);
  padding-bottom: 96px;
}

.about__perspective {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 96px;
  align-items: start;
}

.about__portrait {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  padding-top: var(--spacing-3);
}

.about__caption {
  display: flex;
  justify-content: space-between;
}

.about__view {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-7);
}

.about__bio {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.about__practice {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  padding-top: var(--spacing-6);
  border-top: var(--border-width) solid var(--color-border-default);
}

.about__capabilities {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: var(--spacing-6);
  list-style: none;
}

.about__capability {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

@media (max-width: 1100px) {
  .about__perspective { grid-template-columns: 240px minmax(0, 1fr); gap: var(--spacing-8); }
  .about__capabilities { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (max-width: 768px) {
  .about__perspective { grid-template-columns: 1fr; }
  .about__portrait { max-width: 320px; }
  .about__bio { grid-template-columns: 1fr; gap: var(--spacing-5); }
  .about__capabilities { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
</style>
