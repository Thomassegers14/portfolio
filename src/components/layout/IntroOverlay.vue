<script setup>
// First-visit intro: the name is set large in the middle of an empty page,
// then shrinks into its exact place in the masthead (FLIP) while the page
// appears underneath. Timings line up with INTRO_LAND_MS in utils/intro.js.
import { ref, onMounted } from 'vue'
import site from '../../assets/data/site.json'
import { INTRO_LAND_MS } from '../../utils/intro.js'

const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
const FLIP_MS = 600
const FLIP_AT = INTRO_LAND_MS - FLIP_MS

const visible = ref(true)
const bgEl    = ref(null)
const wrapEl  = ref(null)
const nameEl  = ref(null)
const ruleEl  = ref(null)

onMounted(async () => {
  const start = performance.now()

  nameEl.value.animate(
    [{ clipPath: 'inset(0 0 100% 0)', transform: 'translateY(40%)' },
     { clipPath: 'inset(0 0 0 0)',    transform: 'translateY(0)' }],
    { duration: 600, delay: 150, easing: EASE, fill: 'both' },
  )
  ruleEl.value.animate(
    [{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }],
    { duration: 700, delay: 300, easing: EASE, fill: 'both' },
  )
  ruleEl.value.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 200, delay: FLIP_AT, easing: 'linear', fill: 'forwards' },
  )
  bgEl.value.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 500, delay: FLIP_AT + 100, easing: EASE, fill: 'forwards' },
  )

  // Measure for the FLIP once the display face is in, so both ends share metrics
  try {
    await Promise.race([
      document.fonts.load('500 20px Newsreader'),
      new Promise(r => setTimeout(r, 800)),
    ])
  } catch { /* measure with whatever is rendered */ }

  const target = document.querySelector('.masthead__identity .title-m')
  if (target) {
    // The name itself is mid-rise (transformed), so measure the untransformed
    // wrap for position and the layout width for scale
    const from  = wrapEl.value.getBoundingClientRect()
    const to    = target.getBoundingClientRect()
    const scale = to.width / nameEl.value.offsetWidth
    wrapEl.value.animate(
      [{ transform: 'translate(0, 0) scale(1)' },
       { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${scale})` }],
      { duration: FLIP_MS, delay: Math.max(0, FLIP_AT - (performance.now() - start)), easing: EASE, fill: 'forwards' },
    )
  }

  // The masthead name fades in beneath the landed copy; then the overlay goes
  setTimeout(() => { visible.value = false }, INTRO_LAND_MS + 500)
})
</script>

<template>
  <div v-if="visible" class="intro-overlay" aria-hidden="true">
    <div ref="bgEl" class="intro-overlay__bg" />
    <div ref="wrapEl" class="intro-overlay__wrap">
      <span ref="nameEl" class="intro-overlay__name">{{ site.name }}</span>
      <span ref="ruleEl" class="intro-overlay__rule" />
    </div>
  </div>
</template>

<style scoped>
.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.intro-overlay__bg {
  position: absolute;
  inset: 0;
  background: var(--color-bg-base);
}

.intro-overlay__wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-5);
  transform-origin: top left; /* the name sits at the wrap's top-left corner */
}

/* Same face, case and tracking as .title-m, so the FLIP scales uniformly */
.intro-overlay__name {
  font-family: var(--font-family-display);
  font-weight: 500;
  font-size: clamp(26px, 7.5vw, 104px);
  line-height: 1.2;
  letter-spacing: 0.035em;
  text-transform: uppercase;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.intro-overlay__rule {
  height: var(--border-width);
  background: var(--color-border-default);
  transform-origin: left;
}
</style>
