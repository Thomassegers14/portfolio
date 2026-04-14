import { ref, onMounted, onUnmounted } from 'vue'
import * as d3 from 'd3'

/**
 * useD3 — lifecycle helpers for D3 visualizations in Vue.
 *
 * @param {Function} renderFn  - Called with (svg, width, height) to draw / redraw.
 *                               D3 owns the SVG; Vue only triggers renders.
 * @param {Ref<HTMLElement>} containerRef - Template ref for the wrapping element.
 */
export function useD3(renderFn, containerRef) {
  const width  = ref(0)
  const height = ref(0)

  let svgEl    = null
  let observer = null

  function draw() {
    if (!containerRef.value || !svgEl) return
    renderFn(d3.select(svgEl), width.value, height.value)
  }

  function resize(entries) {
    const entry = entries[0]
    if (!entry) return
    const { inlineSize, blockSize } = entry.contentBoxSize[0]
    width.value  = inlineSize
    height.value = blockSize
    if (svgEl) {
      d3.select(svgEl)
        .attr('width',  width.value)
        .attr('height', height.value)
    }
    draw()
  }

  onMounted(() => {
    const el = containerRef.value
    if (!el) return

    // Create the SVG element once and attach it to the container.
    svgEl = d3
      .select(el)
      .append('svg')
      .attr('aria-hidden', 'true')
      .node()

    // Seed initial dimensions from the container.
    width.value  = el.clientWidth
    height.value = el.clientHeight
    d3.select(svgEl)
      .attr('width',  width.value)
      .attr('height', height.value)

    draw()

    observer = new ResizeObserver(resize)
    observer.observe(el)
  })

  onUnmounted(() => {
    observer?.disconnect()
    if (svgEl) {
      d3.select(svgEl).remove()
      svgEl = null
    }
  })

  return { width, height }
}
