/**
 * Decides once, before first paint, whether the name intro plays: only on the
 * first visit in a session and only when motion is welcome. Every opening
 * delay elsewhere is shifted by `introOffset` (JS) or `--intro-offset` (CSS).
 */
export const INTRO_LAND_MS = 1550 // when the name lands in the masthead

function shouldPlay() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    if (sessionStorage.getItem('intro-seen')) return false
    sessionStorage.setItem('intro-seen', '1')
  } catch {
    // Storage blocked: play it, it is short
  }
  return true
}

export const introPlays  = shouldPlay()
export const introOffset = introPlays ? INTRO_LAND_MS : 0

document.documentElement.style.setProperty('--intro-offset', `${introOffset}ms`)
