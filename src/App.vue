<script setup>
import NavBar         from './components/layout/NavBar.vue'
import HeroSection    from './components/sections/HeroSection.vue'
import WorkSection    from './components/sections/WorkSection.vue'
import AboutSection   from './components/sections/AboutSection.vue'
import ContactSection from './components/sections/ContactSection.vue'
</script>

<template>
  <NavBar />
  <main>
    <HeroSection />
    <WorkSection />
    <AboutSection />
    <ContactSection />
  </main>
</template>
