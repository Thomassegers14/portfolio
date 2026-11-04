/**
 * v-reveal="'rule' | 'frame' | 'row'" — plays a one-time entrance when the
 * element scrolls into view. Pass null to opt out. Elements that enter in the
 * same frame are staggered; nothing starts before the opening sequence ends.
 */
const OPENING_MS  = 1100
const RUN_MS      = 1300
const STAGGER_MS  = 40
const MAX_STAGGER = 8

let observer

function reveal(el, delay) {
  // Elements in view at load can intersect before their hidden state was ever
  // styled; force that style so the transition has a starting point
  void el.offsetWidth
  el.style.setProperty('--reveal-delay', `${delay}ms`)
  el.classList.add('reveal-run')
  el.classList.remove('reveal-pending')
  // Drop the transition class afterwards so hover transitions behave normally
  setTimeout(() => {
    el.classList.remove('reveal-run')
    el.style.removeProperty('--reveal-delay')
  }, RUN_MS + delay)
}

function onIntersect(entries) {
  const bootDelay = Math.max(0, OPENING_MS - performance.now())
  let batch = 0
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    observer.unobserve(entry.target)
    reveal(entry.target, bootDelay + Math.min(batch++, MAX_STAGGER) * STAGGER_MS)
  }
}

export const vReveal = {
  mounted(el, { value = 'row' }) {
    if (!value) return
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    observer ??= new IntersectionObserver(onIntersect, { rootMargin: '0px 0px -8% 0px' })
    el.dataset.reveal = value
    el.classList.add('reveal-pending')
    observer.observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  },
}
