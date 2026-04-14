<script setup>
/**
 * UnifiedViz — single D3 canvas for the entire portfolio.
 *
 * Two modes:
 *   'skills'   — circle pack layout; skills grouped by category; activeCategory dims/highlights clusters
 *   'projects' — force-directed network; project diamonds appear; links connect skills to projects
 *
 * Morph: switching mode changes force strengths on a live simulation.
 * In skills mode, forceX/forceY pull each skill node toward its pre-computed pack position.
 * In projects mode, those forces are released and the network layout takes over.
 */
import { ref, watch, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'
import skillsData  from '../../assets/data/skills.json'
import projectsData from '../../assets/data/projects.json'

const props = defineProps({
  mode:            { type: String, default: 'skills' }, // 'skills' | 'projects'
  activeCategory:  { type: String, default: null },
  activeProjectId: { type: String, default: null },
})

const containerRef = ref(null)

// ── Color helpers ─────────────────────────────────────────────────────────────
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
const categoryColor = cat => cssVar(`--color-${cat}`)
const TYPE_VAR = {
  'data-journalism':     '--color-analysis',
  'visual-storytelling': '--color-storytelling',
  'experimental':        '--color-web',
}
const projectColor = type => cssVar(TYPE_VAR[type] ?? '--color-text-muted')
const projectById  = Object.fromEntries(projectsData.map(p => [p.id, p]))
const skillR       = d => Math.max(7, Math.min(22, d.weight * 2.4))

// ── Module-level state (D3 owns this; Vue only triggers updates) ──────────────
let svgEl       = null
let simulation  = null
let nodes       = []
let links       = []
let forceXPack  = null
let forceYPack  = null
let curW = 0, curH = 0
let observer    = null

// ── Circle pack layout ────────────────────────────────────────────────────────
function computePackPositions(w, h) {
  const root = d3.hierarchy({
    id: 'root',
    children: d3.groups(skillsData, d => d.category).map(([cat, skills]) => ({
      id: cat, children: skills,
    })),
  }).sum(d => d.weight ?? 0)

  d3.pack().size([w, h]).padding(6)(root)

  const pos = {}
  root.leaves().forEach(l => { pos[l.data.id] = { x: l.x, y: l.y } })
  return pos
}

// ── Initialise / re-initialise SVG and simulation ────────────────────────────
function init(w, h) {
  curW = w; curH = h
  simulation?.stop()

  const container = d3.select(containerRef.value)
  container.select('svg').remove()

  svgEl = container
    .append('svg')
    .attr('width', w)
    .attr('height', h)
    .attr('aria-hidden', 'true')
    .node()

  const svg    = d3.select(svgEl)
  const packPos = computePackPositions(w, h)

  // ── Build node array ────────────────────────────────────────────────────────
  nodes = [
    ...skillsData.map(s => ({
      ...s, nodeType: 'skill',
      x: packPos[s.id].x,    y: packPos[s.id].y,
      packX: packPos[s.id].x, packY: packPos[s.id].y,
    })),
    ...projectsData.map(p => ({
      ...p, nodeType: 'project',
      x: w / 2 + (Math.random() - 0.5) * w * 0.35,
      y: h / 2 + (Math.random() - 0.5) * h * 0.35,
      packX: w / 2, packY: h / 2,
    })),
  ]

  links = projectsData.flatMap(p =>
    p.skillIds.map(sid => ({ source: p.id, target: sid, projectId: p.id }))
  )

  // ── SVG layers ──────────────────────────────────────────────────────────────
  const gLinks  = svg.append('g').attr('class', 'g-links')
  const gNodes  = svg.append('g').attr('class', 'g-nodes')

  // Links
  gLinks.selectAll('line.link')
    .data(links)
    .join('line')
    .attr('class', 'link')
    .attr('stroke', d => projectColor(projectById[d.projectId]?.type))
    .attr('stroke-width', 1.2)
    .attr('stroke-opacity', 0)

  // Skill circles
  gNodes.selectAll('circle.skill-node')
    .data(nodes.filter(d => d.nodeType === 'skill'), d => d.id)
    .join('circle')
    .attr('class', 'skill-node')
    .attr('r', skillR)
    .attr('fill', d => categoryColor(d.category))
    .attr('fill-opacity', 0.18)
    .attr('stroke', d => categoryColor(d.category))
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.5)

  // Project diamonds: g group (translate only) + rect (rotated inside) + label
  const projG = gNodes.selectAll('g.proj-node')
    .data(nodes.filter(d => d.nodeType === 'project'), d => d.id)
    .join('g')
    .attr('class', 'proj-node')

  projG.append('rect')
    .attr('width', 12).attr('height', 12)
    .attr('x', -6).attr('y', -6)
    .attr('transform', 'rotate(45)')   // fixed rotation on rect, not the group
    .attr('fill',         d => projectColor(d.type))
    .attr('fill-opacity', 0)
    .attr('stroke',         d => projectColor(d.type))
    .attr('stroke-width',   1.5)
    .attr('stroke-opacity', 0)

  projG.append('text')
    .attr('x', 10).attr('y', 4)
    .attr('fill',        d => projectColor(d.type))
    .attr('font-family', 'var(--font-mono)')
    .attr('font-size',   '10px')
    .attr('fill-opacity', 0)
    .text(d => d.title)

  // ── Forces ──────────────────────────────────────────────────────────────────
  forceXPack = d3.forceX(d => d.packX).strength(0.5)
  forceYPack = d3.forceY(d => d.packY).strength(0.5)

  simulation = d3.forceSimulation(nodes)
    .force('link',    d3.forceLink(links).id(d => d.id).distance(80).strength(0.3))
    .force('charge',  d3.forceManyBody().strength(-70))
    .force('center',  d3.forceCenter(w / 2, h / 2).strength(0.04))
    .force('collide', d3.forceCollide(d => d.nodeType === 'skill' ? skillR(d) + 4 : 18))
    .force('xPack',   forceXPack)
    .force('yPack',   forceYPack)
    .alphaDecay(0.018)
    .on('tick', tick)

  // Seed initial visual state without animation
  applyMode(props.mode, false)
  applyHighlight(props.mode, props.activeCategory, props.activeProjectId, false)
}

// ── Tick: update all element positions ───────────────────────────────────────
function tick() {
  if (!svgEl) return
  const svg = d3.select(svgEl)

  svg.selectAll('line.link')
    .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x).attr('y2', d => d.target.y)

  svg.selectAll('circle.skill-node')
    .attr('cx', d => d.x).attr('cy', d => d.y)

  // Group is translated only — rect has its own fixed rotate(45)
  svg.selectAll('g.proj-node')
    .attr('transform', d => `translate(${d.x},${d.y})`)
}

// ── Mode switch (circle pack ↔ force network) ─────────────────────────────────
function applyMode(mode, animate = true) {
  if (!svgEl) return
  const svg = d3.select(svgEl)
  const dur = animate ? 550 : 0

  if (mode === 'skills') {
    forceXPack.strength(0.5)
    forceYPack.strength(0.5)
    simulation.alpha(0.5).restart()

    svg.selectAll('line.link').transition().duration(dur).attr('stroke-opacity', 0)
    svg.selectAll('g.proj-node rect').transition().duration(dur)
      .attr('fill-opacity', 0).attr('stroke-opacity', 0)
    svg.selectAll('g.proj-node text').transition().duration(dur).attr('fill-opacity', 0)

    // Reset skill nodes to base state (highlight logic will refine further)
    svg.selectAll('circle.skill-node').transition().duration(dur)
      .attr('fill-opacity', 0.18).attr('stroke-opacity', 0.5)

  } else if (mode === 'projects') {
    forceXPack.strength(0)
    forceYPack.strength(0)
    simulation.alpha(0.65).restart()

    // Project nodes fade in subtly (highlight logic drives active state)
    svg.selectAll('g.proj-node rect').transition().duration(dur).delay(dur * 0.4)
      .attr('stroke-opacity', 0.45)

    // Skills settle at dimmer base
    svg.selectAll('circle.skill-node').transition().duration(dur)
      .attr('fill-opacity', 0.15).attr('stroke-opacity', 0.35)
  }
}

// ── Highlight: dim/brighten based on active category or project ───────────────
function applyHighlight(mode, activeCategory, activeProjectId, animate = true) {
  if (!svgEl) return
  const svg = d3.select(svgEl)
  const dur = animate ? 400 : 0

  if (mode === 'skills') {
    svg.selectAll('circle.skill-node')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity',   d => !activeCategory ? 0.18 : d.category === activeCategory ? 0.50 : 0.05)
      .attr('stroke-opacity', d => !activeCategory ? 0.50 : d.category === activeCategory ? 1.00 : 0.08)

    // Labels
    svg.selectAll('circle.skill-node') // labels are not in separate els in circle pack
    // (skill labels are part of the circle node element, but in this viz they're separate)
    // No separate skill label elements in this component — skill names are shown on hover tooltip if needed

  } else if (mode === 'projects') {
    const proj         = projectById[activeProjectId]
    const activeSkills = new Set(proj?.skillIds ?? [])
    const hasActive    = !!activeProjectId

    svg.selectAll('line.link')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('stroke-opacity', d =>
        !hasActive ? 0 : d.projectId === activeProjectId ? 0.55 : 0.04
      )

    svg.selectAll('circle.skill-node')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity',   d => !hasActive ? 0.15 : activeSkills.has(d.id) ? 0.50 : 0.05)
      .attr('stroke-opacity', d => !hasActive ? 0.35 : activeSkills.has(d.id) ? 1.00 : 0.08)

    svg.selectAll('g.proj-node rect')
      .transition().duration(dur).ease(d3.easeCubicOut)
      .attr('fill-opacity',   d => !hasActive ? 0 : d.id === activeProjectId ? 0.75 : 0.04)
      .attr('stroke-opacity', d => !hasActive ? 0.45 : d.id === activeProjectId ? 1.00 : 0.12)

    svg.selectAll('g.proj-node text')
      .transition().duration(dur)
      .attr('fill-opacity', d => d.id === activeProjectId ? 0.9 : 0)
  }
}

// ── Vue lifecycle ─────────────────────────────────────────────────────────────
onMounted(() => {
  const el = containerRef.value
  if (!el) return

  init(el.clientWidth, el.clientHeight)

  observer = new ResizeObserver(entries => {
    const { inlineSize: w, blockSize: h } = entries[0].contentBoxSize[0]
    if (Math.abs(w - curW) < 8 && Math.abs(h - curH) < 8) return

    curW = w; curH = h
    d3.select(svgEl).attr('width', w).attr('height', h)

    // Update pack positions in-place; forceX/Y accessor reads d.packX on each tick.
    const packPos = computePackPositions(w, h)
    nodes.filter(n => n.nodeType === 'skill').forEach(n => {
      n.packX = packPos[n.id].x
      n.packY = packPos[n.id].y
    })

    simulation
      ?.force('center', d3.forceCenter(w / 2, h / 2).strength(0.04))
      .alpha(0.4).restart()
  })

  observer.observe(el)
})

onUnmounted(() => {
  observer?.disconnect()
  simulation?.stop()
})

// ── React to prop changes ─────────────────────────────────────────────────────
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
}
</style>
