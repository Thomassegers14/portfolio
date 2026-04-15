import { ref, onMounted, onUnmounted } from 'vue'
import scrollama from 'scrollama'

/**
 * useScrollytelling — wraps Scrollama for Vue components.
 *
 * @param {Ref<HTMLElement>} stepContainerRef  - Ref to the element containing
 *                                               all `.scrolly-step` elements.
 * @param {Object} options
 * @param {number} options.offset   - Trigger point as fraction of viewport (0–1). Default 0.5.
 * @param {boolean} options.debug   - Show Scrollama debug overlay. Default false.
 *
 * Returns:
 *   currentStepIndex {Ref<number>}  - Index of the active step (-1 = none)
 *   currentStepData  {Ref<any>}     - The `data-step` attribute value (parsed JSON if possible)
 *   direction        {Ref<string>}  - 'down' | 'up'
 */
export function useScrollytelling(stepContainerRef, { offset = null, debug = false } = {}) {
  // On mobile the viz occupies the top ~45vw, so trigger a bit higher in the
  // remaining viewport. On desktop 0.5 (midscreen) is the right default.
  const resolvedOffset = offset ?? (window.innerWidth <= 768 ? 0.65 : 0.5)
  const currentStepIndex = ref(-1)
  const currentStepData  = ref(null)
  const direction        = ref('down')

  let scroller = null

  function parseStepData(value) {
    if (value === null || value === undefined) return null
    try { return JSON.parse(value) } catch { return value }
  }

  onMounted(() => {
    if (!stepContainerRef.value) return

    scroller = scrollama()

    scroller
      .setup({
        step: stepContainerRef.value.querySelectorAll('.scrolly-step'),
        offset: resolvedOffset,
        debug,
      })
      .onStepEnter(({ index, element, direction: dir }) => {
        currentStepIndex.value = index
        currentStepData.value  = parseStepData(element.dataset.step ?? null)
        direction.value        = dir
      })
      .onStepExit(({ index, direction: dir }) => {
        // When scrolling back past the first step, clear active state.
        if (index === 0 && dir === 'up') {
          currentStepIndex.value = -1
          currentStepData.value  = null
        }
        direction.value = dir
      })
  })

  onUnmounted(() => {
    scroller?.destroy()
    scroller = null
  })

  // Expose resize helper for when layout changes externally (e.g. font load).
  function resize() { scroller?.resize() }

  return { currentStepIndex, currentStepData, direction, resize }
}
