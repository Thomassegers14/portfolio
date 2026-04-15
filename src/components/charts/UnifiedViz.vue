<script setup>
/**
 * UnifiedViz — single D3 canvas shared across the entire portfolio.
 *
 * Skills mode  — circle pack, skills grouped by category, pack positions held
 *                by forceX/Y. Labels centered inside circles.
 * Projects mode — force network. Pack forces released; forceRadial pushes
 *                 skills to an outer ring; projects pulled to centre.
 *                 Links visible between skill and project nodes.
 *
 * Mode morphs by adjusting force strengths on the live simulation — no SVG
 * teardown. Fully responsive: ResizeObserver drives first init and any resize.
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import skillsData   from '../../assets/data/skills.json'
import projectsData from '../../assets/data/projects.json'

const props = defineProps({
  mode:            { type: String, default: 'skills' },
  activeCategory:  { type: String, default: null },
  activeProjectId: { type: String, default: null },
})

const containerRef = ref(null)

// ── Color helpers ─────────────────────────────────────────────────────────────
const cssVar       = n  => getComputedStyle(document.documentElement).getPropertyValue(n).trim()
const catColor     = c  => cssVar(`--color-${c}`)
const TYPE_VAR     = { 'data-journalism': '--color-analysis', 'visual-storytelling': '--color-storytelling', 'experimental': '--color-web' }
const projColor    = t  => cssVar(TYPE_VAR[t] ?? '--color-text-muted')
const projectById  = Object.fromEntries(projectsData.map(p => [p.id, p]))

// ── Module-level D3 state (Vue never touches this directly) ───────────────────
let svgEl      = null
let simulation = null
let nodes      = []
let links      = []
let forceXPack = null
let forceYPack = null
let curW = 0
let curH = 0
let observer   = null

// ── Circle pack with strong category separation ───────────────────────────────
function computePackPositions(w, h) {
  // 90 % of canvas — leaves a visible margin so labels near edges don't clip.
  const margin = 0.05
  const pw = w * (1 - 2 * margin)
  const ph = h * (1 - 2 * margin)
  const ox = w * margin
  const oy = h * margin

  const root = d3.hierarchy({
    id: 'root',
    children: d3.groups(skillsData, d => d.category).map(([cat, skills]) => ({
      id: cat, children: skills,
    })),
  }).sum(d => d.weight ?? 0)

  d3.pack()
    .size([pw, ph])
    // depth-1 = category group → generous gap between clusters
    // depth-2 = skills within cluster → tight
    .padding(d => d.depth === 1 ? 20 : 3)(root)

  const pos = {}
  root.leaves().forEach(l => {
    pos[l.data.id] = {
      x: l.x + ox,
      y: l.y + oy,
      r: Math.max(9, Math.min(30, l.r)),   // clamp to readable range
    }
  })
  return pos
}

// ── Full init (first render and on significant resize) ────────────────────────
function init(w, h) {
  if (w < 10 || h < 10) return
  curW = w; curH = h

  simulation?.stop()
  d3.select(containerRef.value).select('svg').remove()

  svgEl = d3.select(containerRef.value)
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('aria-hidden', 'true')
    .node()

  const svg     = d3.select(svgEl)
  const packPos = computePackPositions(w, h)

  // ── Node data ───────────────────────────────────────────────────────────────
  nodes = [
    ...skillsData.map(s => ({
      ...s, nodeType: 'skill',
      x:     packPos[s.id].x,
      y:     packPos[s.id].y,
      packX: packPos[s.id].x,
      packY: packPos[s.id].y,
      packR: packPos[s.id].r,
    })),
    ...projectsData.map(p => ({
      ...p, nodeType: 'project',
      // Start projects near centre with a small random offset
      x: w / 2 + (Math.random() - 0.5) * 50,
      y: h / 2 + (Math.random() - 0.5) * 50,
    })),
  ]

  links = projectsData.flatMap(p =>
    p.skillIds.map(sid => ({ source: p.id, target: sid, projectId: p.id }))
  )

  // ── Layer groups (links behind nodes) ───────────────────────────────────────
  const gLinks = svg.append('g').attr('class', 'g-links')
  const gNodes = svg.append('g').attr('class', 'g-nodes')

  // ── Links ────────────────────────────────────────────────────────────────────
  gLinks.selectAll('line.link')
    .data(links)
    .join('line').attr('class', 'link')
    .attr('stroke',         d => projColor(projectById[d.projectId]?.type))
    .attr('stroke-width',   1.5)
    .attr('stroke-opacity', 0)

  // ── Skill nodes — g (translated) > circle + text ─────────────────────────────
  const skillG = gNodes.selectAll('g.skill-node')
    .data(nodes.filter(d => d.nodeType === 'skill'), d => d.id)
    .join('g').attr('class', 'skill-node')

  skillG.append('circle')
    .attr('r',              d => d.packR)
    .attr('fill',           d => catColor(d.category))
    .attr('fill-opacity',   0.18)
    .attr('stroke',         d => catColor(d.category))
    .attr('stroke-width',   1)
    .attr('stroke-opacity', 0.5)

  // Labels: centered inside circle; two lines for multi-word names in large circles
  skillG.each(function(d) {
    const r         = d.packR
    const fontSize  = Math.min(11, r * 0.34)
    const showLabel = r >= 15
    const words     = d.name.split(' ')

    const t = d3.select(this).append('text')
      .attr('font-family',  'var(--font-mono)')
      .attr('font-size',    fontSize)
      .attr('text-anchor',  'middle')
      .attr('fill',         catColor(d.category))
      .attr('fill-opacity', showLabel ? 0.85 : 0)
      .attr('pointer-events', 'none')

    if (words.length === 1 || r < 26) {
      t.attr('dominant-baseline', 'middle').text(d.name)
    } else {
      // Two-line layout for multi-word names in larger circles
      const mid = Math.ceil(words.length / 2)
      t.append('tspan').attr('x', 0).attr('dy', '-0.55em').text(words.slice(0, mid).join(' '))
      t.append('tspan').attr('x', 0).attr('dy', '1.15em').text(words.slice(mid).join(' '))
    }
  })

  // ── Project nodes — g (translated) > diamond rect + title label ──────────────
  const projG = gNodes.selectAll('g.proj-node')
    .data(nodes.filter(d => d.nodeType === 'project'), d => d.id)
    .join('g').attr('class', 'proj-node')

  projG.append('rect')
    .attr('width', 14).attr('height', 14)
    .attr('x', -7).attr('y', -7)
    .attr('transform',      'rotate(45)')
    .attr('fill',           d => projColor(d.type))
    .attr('fill-opacity',   0)
    .attr('stroke',         d => projColor(d.type))
    .attr('stroke-width',   1.5)
    .attr('stroke-opacity', 0)

  projG.append('text')
    .attr('x', 12).attr('y', 4)
    .attr('fill',         d => projColor(d.type))
    .attr('font-family',  'var(--font-mono)')
    .attr('font-size',    '10px')
    .attr('fill-opacity', 0)
    .text(d => d.title)

  // ── Forces ───────────────────────────────────────────────────────────────────
  forceXPack = d3.forceX(d => d.packX).strength(0.5)
  forceYPack = d3.forceY(d => d.packY).strength(0.5)

  simulation = d3.forceSimulation(nodes)
    .force('link',    d3.forceLink(links).id(d => d.id).distance(90).strength(0.06))
    .force('charge',  d3.forceManyBody().strength(-30))
    .force('collide', d3.forceCollide(d => d.nodeType === 'project' ? 24 : (d.packR ?? 10) + 2))
    .force('xPack',   forceXPack)
    .force('yPack',   forceYPack)
    .alphaDecay(0.016)
    .velocityDecay(0.45)
    .on('tick', tick)

  applyMode(props.mode, false)
  applyHighlight(props.mode, props.activeCategory, props.activeProjectId, false)
}

// ── Tick ──────────────────────────────────────────────────────────────────────
function tick() {
  if (!svgEl) return
  const svg = d3.select(svgEl)

  svg.selectAll('line.link')
    .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x).attr('y2', d => d.target.y)

  svg.selectAll('g.skill-node').attr('transform', d => `translate(${d.x},${d.y})`)
  svg.selectAll('g.proj-node').attr('transform',  d => `translate(${d.x},${d.y})`)
}

// ── Mode switch: circle pack ↔ force network ──────────────────────────────────
function applyMode(mode, animate = true) {
  if (!svgEl) return
  const svg = d3.select(svgEl)
  const dur = animate ? 650 : 0

  if (mode === 'skills') {
    // Remove projects-mode forces
    simulation
      .force('skillRadial', null)
      .force('projCenterX', null)
      .force('projCenterY', null)

    // Restore pack attraction
    forceXPack.strength(0.5)
    forceYPack.strength(0.5)
    simulation.force('link').strength(0.06)
    simulation.alpha(0.5).restart()

    // Hide project elements
    svg.selectAll('line.link').transition().duration(dur).attr('stroke-opacity', 0)
    svg.selectAll('g.proj-node rect').transition().duration(dur)
      .attr('fill-opacity', 0).attr('stroke-opacity', 0)
    svg.selectAll('g.proj-node text').transition().duration(dur).attr('fill-opacity', 0)

  } else if (mode === 'projects') {
    // Release pack forces
    forceXPack.strength(0)
    forceYPack.strength(0)

    // Skills → outer ring; projects → centre
    const outerR = Math.min(curW, curH) * 0.36
    simulation
      .force('skillRadial',
        d3.forceRadial(outerR, curW / 2, curH / 2)
          .strength(d => d.nodeType === 'skill' ? 0.42 : 0))
      .force('projCenterX',
        d3.forceX(curW / 2).strength(d => d.nodeType === 'project' ? 0.28 : 0))
      .force('projCenterY',
        d3.forceY(curH / 2).strength(d => d.nodeType === 'project' ? 0.28 : 0))

    simulation.force('link').strength(0.18)
    simulation.alpha(0.75).restart()

    // Reveal project diamonds after a short delay
    svg.selectAll('g.proj-node rect').transition().duration(dur).delay(dur * 0.35)
      .attr('stroke-opacity', 0.5)
  }
}

// ── Highlight: dim/brighten on active category or project ─────────────────────
function applyHighlight(mode, activeCategory, activeProjectId, animate = true) {
  if (!svgEl) return
  const svg = d3.select(svgEl)
  const dur = animate ? 420 : 0

  if (mode === 'skills') {
    const hasCat = !!activeCategory

    svg.selectAll('g.skill-node circle')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity',   d => !hasCat ? 0.18 : d.category === activeCategory ? 0.55 : 0.05)
      .attr('stroke-opacity', d => !hasCat ? 0.50 : d.category === activeCategory ? 1.00 : 0.08)

    svg.selectAll('g.skill-node text')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity', d => {
        if (d.packR < 15) return 0
        if (!hasCat)      return 0.85
        return d.category === activeCategory ? 1.0 : 0.04
      })

  } else if (mode === 'projects') {
    const proj         = projectById[activeProjectId]
    const activeSkills = new Set(proj?.skillIds ?? [])
    const hasActive    = !!activeProjectId

    svg.selectAll('line.link')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('stroke-opacity', d =>
        !hasActive ? 0 : d.projectId === activeProjectId ? 0.65 : 0.04)

    svg.selectAll('g.skill-node circle')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity',   d => !hasActive ? 0.15 : activeSkills.has(d.id) ? 0.55 : 0.05)
      .attr('stroke-opacity', d => !hasActive ? 0.35 : activeSkills.has(d.id) ? 1.00 : 0.08)

    svg.selectAll('g.skill-node text')
      .transition().duration(dur)
      .attr('fill-opacity', d => {
        if (d.packR < 15) return 0
        return !hasActive ? 0.4 : activeSkills.has(d.id) ? 0.9 : 0.04
      })

    svg.selectAll('g.proj-node rect')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity',   d => !hasActive ? 0 : d.id === activeProjectId ? 0.75 : 0.05)
      .attr('stroke-opacity', d => !hasActive ? 0.5 : d.id === activeProjectId ? 1.00 : 0.15)

    svg.selectAll('g.proj-node text')
      .transition().duration(dur)
      .attr('fill-opacity', d => d.id === activeProjectId ? 0.92 : 0)
  }
}

// ── Vue lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  const el = containerRef.value
  if (!el) return

  observer = new ResizeObserver(entries => {
    const { inlineSize: w, blockSize: h } = entries[0].contentBoxSize[0]
    if (w < 10 || h < 10) return

    if (!svgEl) {
      init(w, h)         // first render
      return
    }

    if (Math.abs(w - curW) < 10 && Math.abs(h - curH) < 10) return

    init(w, h)           // resize: full reinit keeps pack + ring radii consistent
  })

  observer.observe(el)
})

onUnmounted(() => {
  observer?.disconnect()
  simulation?.stop()
})

// ── Prop watchers ─────────────────────────────────────────────────────────────
watch(() => props.mode, newMode => {
  applyMode(newMode)
  applyHighlight(newMode, props.activeCategory, props.activeProjectId)
})

watch(
  () => [props.activeCategory, props.activeProjectId],
  ([cat, projId]) => applyHighlight(props.mode, cat, projId)
)
</script>

<template>
  <div ref="containerRef" class="unified-viz" />
</template>

<style scoped>
.unified-viz {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
