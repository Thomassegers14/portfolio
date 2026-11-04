<script setup>
// Particle rendition of the hero headline. The real <h1> stays the source of
// truth (layout, a11y, fallback); a canvas samples its rendered glyphs and adds
// four behaviours on top: an intro gather, a cursor splash, a drift stream off
// the right edge, and mono trackers riding that stream. At rest the crisp text
// shows — particles only become visible while they are displaced.
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
const textHidden = ref(enabled) // h1 stays invisible until the gather hands over

// ── Tuning ────────────────────────────────────────────────────────────────
const PAD            = 120   // canvas bleed above/below the headline (px)
const INTRO_DELAY    = 200   // ms, lines up with the masthead rule
const INTRO_HOLD     = 1500  // ms until the crisp text takes over
const HANDOVER_MS    = 400
const SPRING         = 0.045
const DAMPING        = 0.86
const VISIBLE_AT     = 8     // px of displacement at which a particle is fully visible
const SPLASH_FORCE   = 5.5
const TRACKER_TICK   = 140   // ms between tracker label updates
const LABEL_W        = 170   // px reserved for a tracker label
const LABEL_H        = 18    // px of vertical clearance between labels

let ctx, raf, io, ro, resizeTimer
let W = 0, H = 0, dpr = 1, color = '#f1f2ef'
let running = false, inView = true, lastT = 0, startT = 0
let introAlpha = 1, introDone = false

// Glyph particles (structure of arrays)
let n = 0, hx, hy, px, py, vx, vy, pa, delay
let textLeft = 0, textRight = 0, textTop = 0, textBottom = 0
let edgeCandidates = new Int32Array(0)

// Drift pool
const DRIFT_MAX = 600
const dx = new Float32Array(DRIFT_MAX), dy = new Float32Array(DRIFT_MAX)
const dvx = new Float32Array(DRIFT_MAX), dvy = new Float32Array(DRIFT_MAX)
const dLife = new Float32Array(DRIFT_MAX), dMax = new Float32Array(DRIFT_MAX)
const dA = new Float32Array(DRIFT_MAX)
let driftCursor = 0, spawnDebt = 0

// Trackers ride drift particles
let trackers = []

// Pointer + cursor hole in the real text
const pointer = { x: -1e4, y: -1e4, active: false }
let holeR = 0, radius = 90

const isSmall = () => window.innerWidth < 640

// ── Sampling ──────────────────────────────────────────────────────────────
function sample({ intro }) {
  const root = rootEl.value, h1 = h1El.value, canvas = canvasEl.value
  const rootRect = root.getBoundingClientRect()
  const style = getComputedStyle(h1)

  W = document.documentElement.clientWidth
  H = Math.ceil(rootRect.height + PAD * 2)
  dpr = Math.min(window.devicePixelRatio || 1, 2)
  color = style.color

  // Canvas spans the viewport width so the drift can travel to the edge
  canvas.style.left   = `${-rootRect.left}px`
  canvas.style.top    = `${-PAD}px`
  canvas.style.width  = `${W}px`
  canvas.style.height = `${H}px`
  canvas.width  = Math.round(W * dpr)
  canvas.height = Math.round(H * dpr)
  ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Draw the headline exactly where the DOM renders it, at 1 css px resolution
  const off = document.createElement('canvas')
  off.width = W; off.height = H
  const o = off.getContext('2d', { willReadFrequently: true })
  const fontSize = parseFloat(style.fontSize)
  o.font = `${style.fontWeight} ${fontSize}px ${style.fontFamily}`
  if ('letterSpacing' in o) o.letterSpacing = style.letterSpacing
  o.fillStyle = '#fff'
  o.textBaseline = 'alphabetic'

  const m = o.measureText('M')
  const asc  = m.fontBoundingBoxAscent  ?? fontSize * 0.8
  const desc = m.fontBoundingBoxDescent ?? fontSize * 0.2
  const upper = style.textTransform === 'uppercase'

  textLeft = Infinity; textRight = -Infinity; textTop = Infinity; textBottom = -Infinity
  const lineBoxes = []
  for (const span of h1.querySelectorAll('.particle-headline__line > span')) {
    const r = span.getBoundingClientRect()
    const x = r.left
    const top = r.top - rootRect.top + PAD
    const baseline = top + (r.height - (asc + desc)) / 2 + asc
    const text = upper ? span.textContent.toUpperCase() : span.textContent
    o.fillText(text, x, baseline)
    const width = o.measureText(text).width
    lineBoxes.push({ left: x, right: x + width })
    textLeft = Math.min(textLeft, x); textRight = Math.max(textRight, x + width)
    textTop = Math.min(textTop, top); textBottom = Math.max(textBottom, top + r.height)
  }

  const data = o.getImageData(0, 0, W, H).data

  // Pick a sampling step that keeps the particle count within budget
  const budget = isSmall() ? 5000 : 12000
  let ink = 0
  for (let i = 3; i < data.length; i += 16) if (data[i] > 60) ink++
  ink *= 4
  const step = Math.max(1.5, Math.sqrt(ink / budget))

  const xs = [], ys = [], as = []
  for (let y = 0; y < H; y += step) {
    for (let x = 0; x < W; x += step) {
      const jx = x + (Math.random() - 0.5) * step * 0.6
      const jy = y + (Math.random() - 0.5) * step * 0.6
      const a = data[((Math.round(jy) * W + Math.round(jx)) << 2) + 3]
      if (a > 60) { xs.push(jx); ys.push(jy); as.push(a / 255) }
    }
  }

  n = xs.length
  hx = Float32Array.from(xs); hy = Float32Array.from(ys); pa = Float32Array.from(as)
  px = new Float32Array(n); py = new Float32Array(n)
  vx = new Float32Array(n); vy = new Float32Array(n); delay = new Float32Array(n)

  const span = Math.max(1, textRight - textLeft)
  const edges = []
  for (let i = 0; i < n; i++) {
    if (intro) {
      // Smeared to the right with some vertical shear, gathering left → right
      const r = Math.random()
      px[i] = hx[i] + r * r * r * span * 0.6 + (Math.random() - 0.5) * 24
      py[i] = hy[i] + (Math.random() - 0.5) * 40 * r
      delay[i] = ((hx[i] - textLeft) / span) * 520 + Math.random() * 160
    } else {
      px[i] = hx[i]; py[i] = hy[i]
    }
    // Drift is emitted from the trailing third of each line
    const line = lineBoxes.find(l => hx[i] >= l.left - 2 && hx[i] <= l.right + 2)
    if (line && hx[i] > line.left + (line.right - line.left) * 0.66) edges.push(i)
  }
  edgeCandidates = Int32Array.from(edges)
  radius = isSmall() ? 64 : 90
  trackers = Array.from({ length: isSmall() ? 3 : 7 }, (_, i) => ({ id: i + 1, p: -1, label: '', next: 0 }))
}

// ── Simulation ────────────────────────────────────────────────────────────
function spawnDrift(count) {
  if (!edgeCandidates.length) return
  for (let k = 0; k < count; k++) {
    const i = edgeCandidates[(Math.random() * edgeCandidates.length) | 0]
    const d = driftCursor
    driftCursor = (driftCursor + 1) % DRIFT_MAX
    dx[d] = hx[i]; dy[d] = hy[i]
    dvx[d] = 0.35 + Math.random() * 1.4
    dvy[d] = (Math.random() - 0.5) * 0.35
    dLife[d] = 0
    dMax[d] = 1800 + Math.random() * 3200
    dA[d] = pa[i]
  }
}

function step(t) {
  const dt = Math.min(50, t - lastT || 16.7)
  lastT = t
  const f = dt / 16.7
  const elapsed = t - startT

  // Hand the headline over from particles to crisp text after the gather
  if (!introDone && elapsed > INTRO_DELAY + INTRO_HOLD) {
    introDone = true
    textHidden.value = false
  }
  if (introDone && introAlpha > 0) introAlpha = Math.max(0, introAlpha - dt / HANDOVER_MS)

  // Glyph particles: spring home, scatter around the pointer
  const R = radius, R2 = R * R
  const near = pointer.active
  const damp = Math.pow(DAMPING, f)
  for (let i = 0; i < n; i++) {
    if (elapsed < INTRO_DELAY + delay[i]) continue
    let ax = (hx[i] - px[i]) * SPRING
    let ay = (hy[i] - py[i]) * SPRING
    if (near) {
      const ox = px[i] - pointer.x, oy = py[i] - pointer.y
      const d2 = ox * ox + oy * oy
      if (d2 < R2 && d2 > 0.01) {
        const d = Math.sqrt(d2)
        const s = (1 - d / R) ** 2 * SPLASH_FORCE
        ax += (ox / d) * s + (Math.random() - 0.5) * s * 0.8
        ay += (oy / d) * s - Math.random() * s * 0.5
      }
    }
    vx[i] = (vx[i] + ax * f) * damp
    vy[i] = (vy[i] + ay * f) * damp
    px[i] += vx[i] * f
    py[i] += vy[i] * f
  }

  // Drift stream, a little denser while the pointer stirs the text
  if (introDone || elapsed > INTRO_DELAY + 600) {
    spawnDebt += (dt / 1000) * (isSmall() ? 60 : 130) * (near ? 1.6 : 1)
    const whole = spawnDebt | 0
    spawnDebt -= whole
    spawnDrift(whole)
  }
  for (let d = 0; d < DRIFT_MAX; d++) {
    if (dLife[d] >= dMax[d]) continue
    dLife[d] += dt
    dvy[d] += Math.sin(t * 0.0012 + dx[d] * 0.012) * 0.006 * f
    dx[d] += dvx[d] * f
    dy[d] += dvy[d] * f
  }

  // Cursor hole in the crisp text follows the splash
  const target = near ? R * 0.8 : 0
  holeR += (target - holeR) * Math.min(1, 0.12 * f)
  applyHole()

  updateTrackers(t)
}

function updateTrackers(t) {
  trackers.forEach((tr, idx) => {
    // Drifting particles can converge; the later tracker yields
    const alive = tr.p >= 0 && dLife[tr.p] < dMax[tr.p] * 0.85 && dx[tr.p] + LABEL_W < W
      && hasRoom(tr.p, tr, trackers.slice(0, idx))
    if (!alive) {
      // Bind to a drift particle that has travelled clear of the letters
      tr.p = -1
      for (let tries = 0; tries < 32; tries++) {
        const d = (Math.random() * DRIFT_MAX) | 0
        if (dLife[d] < dMax[d] * 0.5 && dx[d] > textRight + 30 && dx[d] + LABEL_W < W && hasRoom(d, tr)) { tr.p = d; break }
      }
      tr.next = 0
    }
    if (tr.p >= 0 && t >= tr.next) {
      const d = tr.p
      const fmt = v => (v < 0 ? '−' : '+') + Math.abs(v).toFixed(2)
      const nx = (dx[d] - textRight) / Math.max(1, W - textRight)
      const ny = (dy[d] - (textTop + textBottom) / 2) / Math.max(1, textBottom - textTop)
      tr.label = `${String(tr.id).padStart(2, '0')}  ${fmt(nx)} ${fmt(ny)} ${fmt(dvx[d] / 2)}`
      tr.next = t + TRACKER_TICK
    }
  })
}

// A tracker needs clearance so labels never stack on top of each other
function hasRoom(d, self, others = trackers) {
  return others.every(o => {
    if (o === self || o.p < 0) return true
    const ox = Math.abs(dx[o.p] - dx[d]), oy = Math.abs(dy[o.p] - dy[d])
    return !(ox < LABEL_W && oy < LABEL_H) && ox * ox + oy * oy > 56 * 56
  })
}

function applyHole() {
  const h1 = h1El.value
  if (holeR < 1) {
    if (h1.style.maskImage) { h1.style.maskImage = ''; h1.style.webkitMaskImage = '' }
    return
  }
  // Pointer is in canvas space; the canvas starts at viewport x = 0, PAD above the root
  const r = h1.getBoundingClientRect(), root = rootEl.value.getBoundingClientRect()
  const cx = pointer.x - r.left
  const cy = pointer.y + root.top - PAD - r.top
  const mask = `radial-gradient(circle at ${cx}px ${cy}px, transparent ${holeR * 0.55}px, #000 ${holeR}px)`
  h1.style.maskImage = mask
  h1.style.webkitMaskImage = mask
}

// ── Rendering ─────────────────────────────────────────────────────────────
const BUCKETS = 5
const bucketLists = Array.from({ length: BUCKETS }, () => [])

function draw() {
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = color

  for (const list of bucketLists) list.length = 0
  for (let i = 0; i < n; i++) {
    const ox = px[i] - hx[i], oy = py[i] - hy[i]
    const disp = Math.abs(ox) + Math.abs(oy)
    const vis = Math.max(introAlpha, Math.min(1, disp / VISIBLE_AT))
    const a = pa[i] * vis
    if (a < 0.04) continue
    bucketLists[Math.min(BUCKETS - 1, (a * BUCKETS) | 0)].push(i)
  }
  const size = 1.15
  for (let b = 0; b < BUCKETS; b++) {
    const list = bucketLists[b]
    if (!list.length) continue
    ctx.globalAlpha = (b + 1) / BUCKETS
    for (const i of list) ctx.fillRect(px[i], py[i], size, size)
  }

  // Drift
  for (let d = 0; d < DRIFT_MAX; d++) {
    if (dLife[d] >= dMax[d]) continue
    const life = dLife[d] / dMax[d]
    const a = dA[d] * (1 - life) ** 1.5 * 0.85
    if (a < 0.03) continue
    ctx.globalAlpha = a
    ctx.fillRect(dx[d], dy[d], 1.1, 1.1)
  }

  drawTrackers()
  ctx.globalAlpha = 1
}

function drawTrackers() {
  const live = trackers.filter(tr => tr.p >= 0)
  if (!live.length) return
  ctx.lineWidth = 1

  // Hairline links between consecutive trackers
  ctx.globalAlpha = 0.18
  ctx.strokeStyle = color
  ctx.beginPath()
  live.forEach((tr, i) => {
    const x = dx[tr.p], y = dy[tr.p]
    i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)
  })
  ctx.stroke()

  ctx.font = '400 10px "Geist Mono", ui-monospace, monospace'
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0.4px'
  ctx.textBaseline = 'middle'
  for (const tr of live) {
    const d = tr.p
    const fade = Math.min(1, (1 - dLife[d] / dMax[d]) * 2.2) * Math.min(1, dLife[d] / 300)
    const x = Math.round(dx[d]) + 0.5, y = Math.round(dy[d]) + 0.5
    const s = 6, c = 3
    ctx.globalAlpha = 0.72 * fade
    ctx.beginPath()
    // Corner brackets around the tracked particle
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
      ctx.moveTo(x + sx * s, y + sy * (s - c))
      ctx.lineTo(x + sx * s, y + sy * s)
      ctx.lineTo(x + sx * (s - c), y + sy * s)
    }
    ctx.stroke()
    ctx.globalAlpha = 0.6 * fade
    ctx.fillText(tr.label, x + s + 6, y)
  }
}

// ── Loop & lifecycle ──────────────────────────────────────────────────────
function frame(t) {
  if (!running) return
  step(t)
  draw()
  raf = requestAnimationFrame(frame)
}

function setRunning(next) {
  if (next === running) return
  running = next
  if (running) { lastT = performance.now(); raf = requestAnimationFrame(frame) }
  else cancelAnimationFrame(raf)
}

const syncRunning = () => setRunning(inView && !document.hidden)

function onPointerMove(e) {
  const c = canvasEl.value.getBoundingClientRect()
  pointer.x = e.clientX - c.left
  pointer.y = e.clientY - c.top
  // Only stir when the pointer is near the letters
  pointer.active = pointer.x > textLeft - radius && pointer.x < textRight + radius
    && pointer.y > textTop - radius && pointer.y < textBottom + radius
}

function onPointerLeave() { pointer.active = false }

function onResize() {
  clearTimeout(resizeTimer)
  resizeTimer = setTimeout(() => { if (ctx) sample({ intro: false }) }, 150)
}

function fail() {
  textHidden.value = false
  setRunning(false)
}

onMounted(async () => {
  if (!enabled) return
  // Never keep the headline hidden if fonts or canvas misbehave
  const safety = setTimeout(fail, 3000)
  try {
    const size = parseFloat(getComputedStyle(h1El.value).fontSize)
    await Promise.all([
      document.fonts.load(`500 ${size}px Newsreader`),
      document.fonts.load('400 10px "Geist Mono"'),
    ])
    clearTimeout(safety)
    sample({ intro: true })
    startT = performance.now()

    io = new IntersectionObserver(([entry]) => { inView = entry.isIntersecting; syncRunning() })
    io.observe(rootEl.value)
    ro = new ResizeObserver(onResize)
    ro.observe(rootEl.value)
    document.addEventListener('visibilitychange', syncRunning)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    syncRunning()
  } catch {
    clearTimeout(safety)
    fail()
  }
})

onUnmounted(() => {
  setRunning(false)
  clearTimeout(resizeTimer)
  io?.disconnect()
  ro?.disconnect()
  document.removeEventListener('visibilitychange', syncRunning)
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

.particle-headline__text {
  transition: opacity 400ms var(--ease-out-expo);
}

.particle-headline__text.is-hidden { opacity: 0; }

.particle-headline__line { display: block; }

.particle-headline__canvas {
  position: absolute;
  z-index: 2; /* drift and trackers pass over the spotlight frame */
  pointer-events: none;
}
</style>
