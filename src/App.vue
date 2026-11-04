<script setup>
import NavBar         from './components/layout/NavBar.vue'
import HeroSection    from './components/sections/HeroSection.vue'
import WorkSection    from './components/sections/WorkSection.vue'
import AboutSection   from './components/sections/AboutSection.vue'
import ContactSection from './components/sections/ContactSection.vue'
import IntroOverlay   from './components/layout/IntroOverlay.vue'
import { introPlays } from './utils/intro.js'
</script>

<template>
  <IntroOverlay v-if="introPlays" />
  <NavBar />
  <main>
    <HeroSection />
    <WorkSection />
    <AboutSection />
    <ContactSection />
  </main>
</template>
