<script setup>
import { ref, watch } from 'vue'
import * as d3 from 'd3'
import { useD3 } from '../../composables/useD3.js'
import skillsData from '../../assets/data/skills.json'

// Optional: which skill id is "active" (hover / scroll-driven highlight)
const props = defineProps({
  activeSkillId: { type: String, default: null },
  // 'full' = normal view, 'background' = lower opacity, no labels
  mode: { type: String, default: 'full' },
})

const containerRef = ref(null)

// ── Color scale ───────────────────────────────────────────────────────────────
// Read from CSS custom properties so the palette stays in one place.
function categoryColor(category) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(`--color-${category}`)
    .trim()
}

// ── D3 render function ────────────────────────────────────────────────────────
function render(svg, width, height) {
  if (width === 0 || height === 0) return

  // Build hierarchy: root → category → skill
  const root = d3.hierarchy({
    id: 'root',
    children: d3.groups(skillsData, d => d.category).map(([category, skills]) => ({
      id: category,
      category,
      children: skills,
    })),
  })
    .sum(d => d.weight ?? 0)
    .sort((a, b) => b.value - a.value)

  const padding = props.mode === 'background' ? 3 : 5

  d3.pack()
    .size([width, height])
    .padding(padding)(root)

  // ── Nodes ─────────────────────────────────────────────────────────────────
  const leaves = root.leaves()

  // Update pattern: select → data → join
  const groups = svg
    .selectAll('g.skill-node')
    .data(leaves, d => d.data.id)
    .join(
      enter => {
        const g = enter.append('g')
          .attr('class', 'skill-node')
          .attr('transform', d => `translate(${d.x},${d.y})`)
          .style('cursor', props.mode === 'full' ? 'pointer' : 'default')

        g.append('circle')
          .attr('r', 0)
          .attr('fill', d => categoryColor(d.data.category))
          .attr('fill-opacity', props.mode === 'background' ? 0.12 : 0.18)
          .attr('stroke', d => categoryColor(d.data.category))
          .attr('stroke-width', 1)
          .attr('stroke-opacity', props.mode === 'background' ? 0.25 : 0.5)
          .transition().duration(600).ease(d3.easeCubicOut)
          .attr('r', d => d.r)

        // Labels — only in 'full' mode, only for circles big enough
        if (props.mode === 'full') {
          g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('fill', d => categoryColor(d.data.category))
            .attr('font-family', 'var(--font-mono)')
            .attr('font-size', d => Math.max(9, Math.min(13, d.r * 0.38)))
            .attr('fill-opacity', 0)
            .text(d => d.data.name)
            .transition().delay(300).duration(400)
            .attr('fill-opacity', d => d.r > 22 ? 0.9 : 0)
        }

        return g
      },
      update => {
        update.transition().duration(500).ease(d3.easeCubicInOut)
          .attr('transform', d => `translate(${d.x},${d.y})`)

        update.select('circle')
          .transition().duration(500)
          .attr('r', d => d.r)

        return update
      },
      exit => exit.transition().duration(300).remove()
    )

  // ── Category label rings (subtle arcs, full mode only) ───────────────────
  // Skipped for now — keeping it clean for the first pass.

  // ── Hover interactions (full mode only) ──────────────────────────────────
  if (props.mode === 'full') {
    groups
      .on('mouseenter', function (event, d) {
        d3.select(this).select('circle')
          .transition().duration(150)
          .attr('fill-opacity', 0.45)
          .attr('stroke-opacity', 1)
          .attr('r', d.r * 1.08)
      })
      .on('mouseleave', function (event, d) {
        const isActive = props.activeSkillId === d.data.id
        d3.select(this).select('circle')
          .transition().duration(200)
          .attr('fill-opacity', isActive ? 0.4 : 0.18)
          .attr('stroke-opacity', isActive ? 1 : 0.5)
          .attr('r', d.r)
      })
  }
}

useD3(render, containerRef)

// Re-render when activeSkillId changes to highlight the right circle.
watch(() => props.activeSkillId, (newId, oldId) => {
  if (!containerRef.value) return
  const svg = d3.select(containerRef.value).select('svg')

  // Dim previously active skill
  if (oldId) {
    svg.selectAll('g.skill-node')
      .filter(d => d.data.id === oldId)
      .select('circle')
      .transition().duration(300)
      .attr('fill-opacity', 0.18)
      .attr('stroke-opacity', 0.5)
  }

  // Highlight new active skill
  if (newId) {
    svg.selectAll('g.skill-node')
      .filter(d => d.data.id === newId)
      .select('circle')
      .transition().duration(300)
      .attr('fill-opacity', 0.55)
      .attr('stroke-opacity', 1)
  }
})
</script>

<template>
  <div
    ref="containerRef"
    class="skills-viz"
    :class="`skills-viz--${mode}`"
  />
</template>

<style scoped>
.skills-viz {
  width: 100%;
  height: 100%;
}

.skills-viz--full {
  min-height: 520px;
}

.skills-viz--background {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
</style>
