<script setup>
import site from '../../assets/data/site.json'
import ChapterRegister from '../layout/ChapterRegister.vue'
import StatusBar from '../layout/StatusBar.vue'

const year = new Date().getFullYear()
</script>

<template>
  <section id="contact" class="contact page">
    <ChapterRegister label="03 / The next chapter" :note="site.contact.note" />

    <div class="contact__invitation">
      <div class="contact__main">
        <h2 class="headline headline--statement">
          <template v-for="(line, i) in site.contact.headline" :key="i">{{ line }}<br v-if="i < site.contact.headline.length - 1"></template>
        </h2>
        <a :href="`mailto:${site.email}`" class="contact__email">
          <span class="title-l">{{ site.email }}</span>
          <span class="icon-btn" aria-hidden="true">↗</span>
        </a>
      </div>

      <div class="contact__details">
        <p class="body-m text-secondary">{{ site.contact.intro }}</p>
        <div class="contact__socials">
          <a
            v-for="(social, i) in site.socials"
            :key="social.url"
            :href="social.url"
            class="btn"
            :class="{ 'btn--ghost': i > 0 }"
            target="_blank"
            rel="noopener"
          >{{ social.label }} <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </div>

    <StatusBar
      :status="`© ${year} ${site.name}`"
      :center="site.contact.colophon"
      :right="site.location"
    />
  </section>
</template>

<style scoped>
.contact {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-8);
  padding-top: 64px;
}

.contact__invitation {
  display: grid;
  grid-template-columns: minmax(0, 800fr) minmax(0, 416fr);
  gap: 96px;
  align-items: end;
  padding: var(--spacing-3) 0 var(--spacing-7);
}

.contact__main {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-7);
}

.contact__email {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-6);
  align-self: flex-start;
  overflow-wrap: anywhere;
}

.contact__email:hover .icon-btn {
  border-color: var(--color-border-strong);
  background: var(--color-bg-hover);
}

.contact__details {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--spacing-6);
}

.contact__socials {
  display: flex;
  gap: var(--spacing-3);
}

@media (max-width: 900px) {
  .contact__invitation { grid-template-columns: 1fr; gap: var(--spacing-8); }
}

@media (max-width: 640px) {
  .contact__email .title-l { font-size: 22px; line-height: 28px; }
}
</style>
