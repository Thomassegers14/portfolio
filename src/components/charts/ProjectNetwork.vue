<script setup>
import { ref, watch, onUnmounted } from 'vue'
import * as d3 from 'd3'
import { useD3 } from '../../composables/useD3.js'
import skillsData  from '../../assets/data/skills.json'
import projectsData from '../../assets/data/projects.json'

const props = defineProps({
  // Project id to highlight (null = intro state, all projects hidden)
  activeProjectId: { type: String, default: null },
})

const containerRef = ref(null)

// ── Color helpers ─────────────────────────────────────────────────────────────
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim()
}
function categoryColor(cat) { return cssVar(`--color-${cat}`) }

const PROJECT_TYPE_VAR = {
  'data-journalism':     '--color-analysis',
  'visual-storytelling': '--color-storytelling',
  'experimental':        '--color-web',
}
function projectColor(type) {
  return cssVar(PROJECT_TYPE_VAR[type] ?? '--color-text-muted')
}

// ── Data ──────────────────────────────────────────────────────────────────────
const skillById    = Object.fromEntries(skillsData.map(s => [s.id, s]))
const projectById  = Object.fromEntries(projectsData.map(p => [p.id, p]))

const allNodeDefs = [
  ...skillsData.map(s  => ({ ...s,  nodeType: 'skill'   })),
  ...projectsData.map(p => ({ ...p,  nodeType: 'project' })),
]

const linkDefs = projectsData.flatMap(p =>
  p.skillIds.map(skillId => ({ source: p.id, target: skillId, projectId: p.id }))
)

// ── Simulation (module-level so watch can reference it) ───────────────────────
let simulation = null

function render(svg, width, height) {
  if (width === 0 || height === 0) return

  // Stop any existing simulation before re-creating.
  simulation?.stop()
  svg.selectAll('*').remove()

  // Clone node/link objects — D3 will mutate them with x/y/vx/vy.
  const nodes = allNodeDefs.map(n => ({ ...n }))
  const links = linkDefs.map(l => ({ ...l }))

  // ── Layer groups ────────────────────────────────────────────────────────────
  const gLinks    = svg.append('g').attr('class', 'g-links')
  const gNodes    = svg.append('g').attr('class', 'g-nodes')
  const gLabels   = svg.append('g').attr('class', 'g-labels')

  // ── Link elements ────────────────────────────────────────────────────────────
  const linkSel = gLinks.selectAll('line')
    .data(links)
    .join('line')
    .attr('stroke', d => projectColor(projectById[d.projectId]?.type))
    .attr('stroke-width', 1.2)
    .attr('stroke-opacity', 0)

  // ── Skill nodes ──────────────────────────────────────────────────────────────
  const skillR = d => Math.max(7, Math.min(22, d.weight * 2.4))

  const skillSel = gNodes.selectAll('circle.skill-node')
    .data(nodes.filter(d => d.nodeType === 'skill'), d => d.id)
    .join('circle')
    .attr('class', 'skill-node')
    .attr('r', skillR)
    .attr('fill', d => categoryColor(d.category))
    .attr('fill-opacity', 0.18)
    .attr('stroke', d => categoryColor(d.category))
    .attr('stroke-width', 1)
    .attr('stroke-opacity', 0.5)

  // ── Project nodes (diamond shape via rotated rect) ───────────────────────────
  const projSel = gNodes.selectAll('rect.proj-node')
    .data(nodes.filter(d => d.nodeType === 'project'), d => d.id)
    .join('rect')
    .attr('class', 'proj-node')
    .attr('width', 12).attr('height', 12)
    .attr('x', -6).attr('y', -6)
    .attr('transform', 'rotate(45)')
    .attr('fill', d => projectColor(d.type))
    .attr('fill-opacity', 0)
    .attr('stroke', d => projectColor(d.type))
    .attr('stroke-width', 1.5)
    .attr('stroke-opacity', 0)

  // ── Project labels ────────────────────────────────────────────────────────────
  const labelSel = gLabels.selectAll('text.proj-label')
    .data(nodes.filter(d => d.nodeType === 'project'), d => d.id)
    .join('text')
    .attr('class', 'proj-label')
    .attr('font-family', 'var(--font-mono)')
    .attr('font-size', '10px')
    .attr('fill', d => projectColor(d.type))
    .attr('fill-opacity', 0)
    .text(d => d.title)

  // ── Simulation ────────────────────────────────────────────────────────────────
  simulation = d3.forceSimulation(nodes)
    .force('link',    d3.forceLink(links).id(d => d.id).distance(85).strength(0.35))
    .force('charge',  d3.forceManyBody().strength(-90))
    .force('center',  d3.forceCenter(width / 2, height / 2).strength(0.08))
    .force('collide', d3.forceCollide(d =>
      d.nodeType === 'skill' ? skillR(d) + 5 : 22
    ))
    .on('tick', () => {
      linkSel
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)

      skillSel.attr('cx', d => d.x).attr('cy', d => d.y)

      // Rect position — translate the parent group equivalent via cx/cy on the rect itself.
      // Since rect uses x/y offsets from -6, we update via a wrapper translate.
      // We store x/y directly on the rect's bound datum (already mutated by sim).
      projSel
        .attr('transform', d => `translate(${d.x},${d.y}) rotate(45)`)

      labelSel
        .attr('x', d => d.x + 10)
        .attr('y', d => d.y + 4)
    })

  // Re-apply active highlight after render (handles resize during active step).
  applyHighlight(props.activeProjectId, svg)
}

// ── Highlight logic ───────────────────────────────────────────────────────────
function applyHighlight(projectId, svgSel) {
  if (!svgSel || svgSel.empty()) return

  const activeProject  = projectById[projectId]
  const activeSkillIds = new Set(activeProject?.skillIds ?? [])
  const hasActive      = !!projectId

  // Links
  svgSel.selectAll('.g-links line')
    .transition().duration(500).ease(d3.easeCubicOut)
    .attr('stroke-opacity', d =>
      !hasActive ? 0 : d.projectId === projectId ? 0.55 : 0.04
    )

  // Skill nodes
  svgSel.selectAll('circle.skill-node')
    .transition().duration(400).ease(d3.easeCubicOut)
    .attr('fill-opacity',   d => !hasActive ? 0.18 : activeSkillIds.has(d.id) ? 0.50 : 0.05)
    .attr('stroke-opacity', d => !hasActive ? 0.50 : activeSkillIds.has(d.id) ? 1.00 : 0.08)

  // Project nodes
  svgSel.selectAll('rect.proj-node')
    .transition().duration(400).ease(d3.easeCubicOut)
    .attr('fill-opacity',   d => !hasActive ? 0 : d.id === projectId ? 0.75 : 0.04)
    .attr('stroke-opacity', d => !hasActive ? 0 : d.id === projectId ? 1.00 : 0.08)

  // Project labels
  svgSel.selectAll('text.proj-label')
    .transition().duration(400)
    .attr('fill-opacity', d => d.id === projectId ? 0.9 : 0)
}

useD3(render, containerRef)

watch(() => props.activeProjectId, (newId) => {
  if (!containerRef.value) return
  applyHighlight(newId, d3.select(containerRef.value).select('svg'))
})

onUnmounted(() => { simulation?.stop() })
</script>

<template>
  <div ref="containerRef" class="project-network" />
</template>

<style scoped>
.project-network {
  width: 100%;
  height: 100%;
  min-height: 520px;
}
</style>
