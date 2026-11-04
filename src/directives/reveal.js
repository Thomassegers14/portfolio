/**
 * v-reveal="'rule' | 'frame' | 'row'" — plays an entrance every time the
 * element scrolls into view, in either direction. Once it has fully left the
 * viewport it silently resets, ready to play again. Pass null to opt out.
 * Elements that enter in the same frame are staggered; nothing starts before
 * the opening sequence ends.
 */
import { introOffset } from '../utils/intro.js'

const OPENING_MS  = 1100 + introOffset
const RUN_MS      = 1300
const STAGGER_MS  = 40
const MAX_STAGGER = 8

let enterObserver // fires once the element is ~8% into the viewport
let leaveObserver // fires once the element is completely out of it
const timers = new WeakMap()

function reveal(el, delay) {
  if (!el.classList.contains('reveal-pending')) return
  // Elements in view at load can intersect before their hidden state was ever
  // styled; force that style so the transition has a starting point
  void el.offsetWidth
  el.style.setProperty('--reveal-delay', `${delay}ms`)
  el.classList.add('reveal-run')
  el.classList.remove('reveal-pending')
  // Drop the transition class afterwards so hover transitions behave normally
  timers.set(el, setTimeout(() => {
    el.classList.remove('reveal-run')
    el.style.removeProperty('--reveal-delay')
  }, RUN_MS + delay))
}

function reset(el) {
  clearTimeout(timers.get(el))
  el.classList.remove('reveal-run')
  el.style.removeProperty('--reveal-delay')
  el.classList.add('reveal-pending') // no transition class, so it hides instantly
}

function onEnter(entries) {
  const bootDelay = Math.max(0, OPENING_MS - performance.now())
  let batch = 0
  for (const entry of entries) {
    if (!entry.isIntersecting) continue
    reveal(entry.target, bootDelay + Math.min(batch++, MAX_STAGGER) * STAGGER_MS)
  }
}

function onLeave(entries) {
  for (const entry of entries) {
    if (!entry.isIntersecting) reset(entry.target)
  }
}

export const vReveal = {
  mounted(el, { value = 'row' }) {
    if (!value) return
    if (!('IntersectionObserver' in window)) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    enterObserver ??= new IntersectionObserver(onEnter, { rootMargin: '0px 0px -8% 0px' })
    leaveObserver ??= new IntersectionObserver(onLeave)
    el.dataset.reveal = value
    el.classList.add('reveal-pending')
    enterObserver.observe(el)
    leaveObserver.observe(el)
  },
  unmounted(el) {
    clearTimeout(timers.get(el))
    enterObserver?.unobserve(el)
    leaveObserver?.unobserve(el)
  },
}
