<script setup>
// Particle rendition of the hero headline. The real <h1> stays in the DOM for
// layout, a11y and fallback; a canvas renders the same glyphs at device
// resolution and cuts them into tiny tiles. At rest the tiles rebuild the text
// pixel for pixel; on load they gather from a smear, and the pointer brushes
// them aside like grain — each tile carries its own piece of letterform.
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  lines: { type: Array, required: true },
})

const rootEl   = ref(null)
const h1El     = ref(null)
const canvasEl = ref(null)

// The canvas only runs when motion is welcome; otherwise the static h1 remains
const enabled = typeof window !== 'undefined'
  && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
const textHidden = ref(enabled) // canvas draws the text while it is active

// ── Tuning ────────────────────────────────────────────────────────────────
const PAD         = 80     // canvas bleed around the headline (css px)
const INTRO_DELAY = 200    // ms, lines up with the masthead rule
const INTRO_SPAN  = 560    // ms of left → right stagger in the gather
const DAMPING     = 0.88
const REST_EPS    = 0.35   // device px; closer than this snaps home
const RADIAL      = 1.6    // push away from the pointer
const WAKE        = 0.42   // push along the pointer's direction of travel
const MAX_SPEED   = 28     // device px per frame

let ctx, layer, raf, io, ro, resizeTimer
let W = 0, H = 0, dpr = 1, tile = 2
let running = false, inView = true, lastT = 0, startT = 0, introDone = false

// Tiles (structure of arrays, device px)
let n = 0, hx, hy, px, py, vx, vy, mass, spring, delay
let textLeft = 0, textRight = 0

// Pointer in canvas device px, with smoothed velocity
const pointer = { x: -1e5, y: -1e5, vx: 0, vy: 0, t: 0, near: false }
let reach = 0 // influence radius, device px

const isSmall = () => window.innerWidth < 640

// ── Sampling ──────────────────────────────────────────────────────────────
function sample({ intro }) {
  const root = rootEl.value, h1 = h1El.value, canvas = canvasEl.value
  const rootRect = root.getBoundingClientRect()
  const style = getComputedStyle(h1)

  dpr = Math.min(window.devicePixelRatio || 1, 2)
  const cssW = rootRect.width + PAD * 2
  const cssH = rootRect.height + PAD * 2
  W = Math.round(cssW * dpr)
  H = Math.round(cssH * dpr)

  canvas.style.left   = `${-PAD}px`
  canvas.style.top    = `${-PAD}px`
  canvas.style.width  = `${cssW}px`
  canvas.style.height = `${cssH}px`
  canvas.width = W
  canvas.height = H
  ctx = canvas.getContext('2d')

  // Render the headline exactly where the DOM puts it, at device resolution
  layer = document.createElement('canvas')
  layer.width = W; layer.height = H
  const o = layer.getContext('2d', { willReadFrequently: true })
  o.scale(dpr, dpr)
  const fontSize = parseFloat(style.fontSize)
  o.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
  if ('letterSpacing' in o) o.letterSpacing = style.letterSpacing
  o.fillStyle = style.color
  o.textBaseline = 'alphabetic'

  const m = o.measureText('M')
  const asc  = m.fontBoundingBoxAscent  ?? fontSize * 0.8
  const desc = m.fontBoundingBoxDescent ?? fontSize * 0.2
  const upper = style.textTransform === 'uppercase'

  textLeft = Infinity; textRight = -Infinity
  for (const span of h1.querySelectorAll('.particle-headline__line > span')) {
    const r = span.getBoundingClientRect()
    const x = r.left - rootRect.left + PAD
    const top = r.top - rootRect.top + PAD
    const baseline = top + (r.height - (asc + desc)) / 2 + asc
    // Canvas and DOM disagree slightly on word spaces, so each word is placed
    // at the x the browser actually renders it
    const node = span.firstChild
    const range = document.createRange()
    for (const match of span.textContent.matchAll(/\S+/g)) {
      range.setStart(node, match.index)
      range.setEnd(node, match.index + match[0].length)
      const wx = range.getBoundingClientRect().left - rootRect.left + PAD
      const word = upper ? match[0].toUpperCase() : match[0]
      o.fillText(word, wx, baseline)
      textRight = Math.max(textRight, (wx + o.measureText(word).width) * dpr)
    }
    textLeft = Math.min(textLeft, x * dpr)
  }

  // Tile size in whole device px, chosen to stay within the particle budget
  const data = o.getImageData(0, 0, W, H).data
  let ink = 0
  for (let i = 3; i < data.length; i += 4) if (data[i] > 8) ink++
  const budget = isSmall() ? 6000 : 16000
  tile = Math.max(Math.round(1.5 * dpr), Math.ceil(Math.sqrt(ink / budget)))

  const xs = [], ys = []
  for (let ty = 0; ty < H; ty += tile) {
    for (let tx = 0; tx < W; tx += tile) {
      let hit = false
      for (let y = ty; y < Math.min(ty + tile, H) && !hit; y++) {
        for (let x = tx; x < Math.min(tx + tile, W); x++) {
          if (data[((y * W + x) << 2) + 3] > 8) { hit = true; break }
        }
      }
      if (hit) { xs.push(tx); ys.push(ty) }
    }
  }

  n = xs.length
  hx = Float32Array.from(xs); hy = Float32Array.from(ys)
  px = Float32Array.from(xs); py = Float32Array.from(ys)
  vx = new Float32Array(n); vy = new Float32Array(n)
  mass = new Float32Array(n); spring = new Float32Array(n); delay = new Float32Array(n)

  const span = Math.max(1, textRight - textLeft)
  for (let i = 0; i < n; i++) {
    mass[i]   = 0.6 + Math.random() * 0.9
    spring[i] = 0.028 + Math.random() * 0.04
    if (intro) {
      // Smeared to the right with a little shear; gathers left → right
      const r = Math.random()
      px[i] = hx[i] + r * r * r * span * 0.55 + (Math.random() - 0.5) * 20 * dpr
      py[i] = hy[i] + (Math.random() - 0.5) * 36 * dpr * r
      delay[i] = ((hx[i] - textLeft) / span) * INTRO_SPAN + Math.random() * 160
    }
  }

  introDone = !intro
  reach = (isSmall() ? 60 : 85) * dpr
}

// ── Simulation ────────────────────────────────────────────────────────────
// Returns whether anything is still moving
function step(t) {
  const dt = Math.min(50, t - lastT || 16.7)
  lastT = t
  const f = dt / 16.7
  const elapsed = t - startT
  const damp = Math.pow(DAMPING, f)

  // Pointer velocity fades when the pointer rests
  pointer.vx *= Math.pow(0.82, f)
  pointer.vy *= Math.pow(0.82, f)
  const speed = Math.hypot(pointer.vx, pointer.vy)
  const stir = pointer.near
  const sigma2 = 2 * (reach * 0.5) ** 2
  const cut2 = reach * reach * 2.25

  let moving = false
  for (let i = 0; i < n; i++) {
    if (elapsed < INTRO_DELAY + delay[i]) { moving = true; continue }

    let ax = (hx[i] - px[i]) * spring[i]
    let ay = (hy[i] - py[i]) * spring[i]

    if (stir) {
      const ox = px[i] - pointer.x, oy = py[i] - pointer.y
      const d2 = ox * ox + oy * oy
      if (d2 < cut2) {
        // Gaussian falloff: a soft brush, never a hard circle
        const w = Math.exp(-d2 / sigma2) / mass[i]
        const d = Math.sqrt(d2) || 1
        const lift = RADIAL * (0.25 + Math.min(1, speed / 12))
        ax += w * ((ox / d) * lift + pointer.vx * WAKE + (Math.random() - 0.5) * 1.4)
        ay += w * ((oy / d) * lift + pointer.vy * WAKE + (Math.random() - 0.5) * 1.4)
      }
    }

    vx[i] = (vx[i] + ax * f) * damp
    vy[i] = (vy[i] + ay * f) * damp
    const sp = Math.abs(vx[i]) + Math.abs(vy[i])
    if (sp > MAX_SPEED) { vx[i] *= MAX_SPEED / sp; vy[i] *= MAX_SPEED / sp }
    px[i] += vx[i] * f
    py[i] += vy[i] * f

    const ox = px[i] - hx[i], oy = py[i] - hy[i]
    if (Math.abs(ox) + Math.abs(oy) < REST_EPS && sp < 0.05) {
      px[i] = hx[i]; py[i] = hy[i]; vx[i] = 0; vy[i] = 0
    } else {
      moving = true
    }
  }

  if (!introDone && !moving) introDone = true
  return moving || stir
}

// ── Rendering ─────────────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H)

  // Settled tiles are the text itself; punch out the ones in flight
  if (introDone) {
    ctx.drawImage(layer, 0, 0)
    for (let i = 0; i < n; i++) {
      if (px[i] !== hx[i] || py[i] !== hy[i]) ctx.clearRect(hx[i], hy[i], tile, tile)
    }
  }

  for (let i = 0; i < n; i++) {
    const at = px[i] === hx[i] && py[i] === hy[i]
    if (introDone && at) continue
    // Grain thins out slightly the further it is carried
    const disp = Math.abs(px[i] - hx[i]) + Math.abs(py[i] - hy[i])
    ctx.globalAlpha = 1 - Math.min(0.55, disp / (220 * dpr))
    ctx.drawImage(layer, hx[i], hy[i], tile, tile, px[i], py[i], tile, tile)
  }
  ctx.globalAlpha = 1
}

// ── Loop & lifecycle ──────────────────────────────────────────────────────
function frame(t) {
  if (!running) return
  const busy = step(t)
  draw()
  // Sleep once everything has settled; the pointer wakes the loop again
  if (busy) raf = requestAnimationFrame(frame)
  else running = false
}

function wake() {
  if (running || !inView || document.hidden || !ctx) return
  running = true
  lastT = performance.now()
  raf = requestAnimationFrame(frame)
}

function sleep() {
  running = false
  cancelAnimationFrame(raf)
}

const syncVisibility = () => (inView && !document.hidden ? wake() : sleep())

function onPointerMove(e) {
  if (!ctx) return
  const c = canvasEl.value.getBoundingClientRect()
  const x = (e.clientX - c.left) * dpr
  const y = (e.clientY - c.top) * dpr
  const now = performance.now()
  const dt = Math.max(8, now - pointer.t)
  if (pointer.t && now - pointer.t < 100) {
    // Smoothed velocity in device px per frame
    pointer.vx = pointer.vx * 0.5 + ((x - pointer.x) / dt) * 16.7 * 0.5
    pointer.vy = pointer.vy * 0.5 + ((y - pointer.y) / dt) * 16.7 * 0.5
  }
  pointer.x = x; pointer.y = y; pointer.t = now
  pointer.near = x > textLeft - reach && x < textRight + reach && y > 0 && y < H
  if (pointer.near) wake()
}

function onPointerLeave() {
  pointer.near = false
}

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => {
    if (!ctx) return
    sample({ intro: false })
    draw()
  }, 150)
}

function fail() {
  textHidden.value = false
  sleep()
}

onMounted(async () => {
  if (!enabled) return
  // Never keep the headline hidden if fonts or canvas misbehave
  const safety = setTimeout(fail, 3000)
  try {
    const size = parseFloat(getComputedStyle(h1El.value).fontSize)
    await document.fonts.load(`500 ${size}px Newsreader`)
    clearTimeout(safety)
    sample({ intro: true })
    draw()
    startT = performance.now()

    io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncVisibility() })
    io.observe(rootEl.value)
    ro = new ResizeObserver(onResize)
    ro.observe(rootEl.value)
    document.addEventListener('visibilitychange', syncVisibility)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    wake()
  } catch {
    clearTimeout(safety)
    fail()
  }
})

onUnmounted(() => {
  sleep()
  clearTimeout(resizeTimer)
  io?.disconnect()
  ro?.disconnect()
  document.removeEventListener('visibilitychange', syncVisibility)
  window.removeEventListener('pointermove', onPointerMove)
  document.documentElement.removeEventListener('pointerleave', onPointerLeave)
})
</script>

<template>
  <div ref="rootEl" class="particle-headline">
    <h1
      ref="h1El"
      class="headline headline--hero particle-headline__text"
      :class="{ 'is-hidden': textHidden }"
      :aria-label="props.lines.join(' ')"
    >
      <span
        v-for="(line, i) in props.lines"
        :key="i"
        class="particle-headline__line"
        aria-hidden="true"
      ><span>{{ line }}</span></span>
    </h1>
    <canvas v-if="enabled" ref="canvasEl" class="particle-headline__canvas" aria-hidden="true" />
  </div>
</template>

<style scoped>
.particle-headline {
  position: relative;
}

.particle-headline__text.is-hidden { opacity: 0; }

.particle-headline__line { display: block; }

.particle-headline__canvas {
  position: absolute;
  z-index: 1;
  pointer-events: none;
}
</style>
