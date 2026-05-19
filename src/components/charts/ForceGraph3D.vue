<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import ForceGraph3D from '3d-force-graph'
import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass }     from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass }      from 'three/examples/jsm/postprocessing/BokehPass.js'
import skillsData   from '../../assets/data/skills.json'
import projectsData from '../../assets/data/projects.json'

const props = defineProps({
  mode:            { type: String, default: 'skills' },
  activeCategory:  { type: String, default: null },
  activeProjectId: { type: String, default: null },
})

const containerRef = ref(null)
let graph       = null
let composer    = null
const labelScene = new THREE.Scene()  // rendered after DoF, always sharp

// ── Colors ─────────────────────────────────────────────────────────────────
const GREEN = new THREE.Color('#8EDD8E')

// ── Material presets ────────────────────────────────────────────────────────
const MAT = {
  skill: {
    default: { color: '#8C9495', roughness: 0.42, metalness: 0.08, opacity: 0.8 },
    active:  { color: '#8C9495', roughness: 0.42, metalness: 0.08, opacity: 0.95 },
    dimmed:  { color: '#000000', roughness: 0.42, metalness: 0.08, opacity: 0.25 },
  },
  project: {
    default: { color: '#E7EBEA', roughness: 0.42, metalness: 0.08, opacity: 0.8 },
    active:  { color: '#E7EBEA', roughness: 0.42, metalness: 0.08, opacity: 0.95 },
    dimmed:  { color: '#000000', roughness: 0.42, metalness: 0.08, opacity: 0.25 },
  },
}

// ── Graph data ─────────────────────────────────────────────────────────────
const nodes = [
  ...skillsData.map(s => ({ id: s.id, name: s.name, nodeType: 'skill', category: s.category, weight: s.weight })),
  ...projectsData.map(p => ({ id: p.id, name: p.title, nodeType: 'project', ptype: p.type })),
]
const links = []
projectsData.forEach(p => p.skillIds.forEach(sid => links.push({ source: sid, target: p.id })))

// ── Material store ─────────────────────────────────────────────────────────
const matMap = new Map()

// ── Label sprite factory ───────────────────────────────────────────────────
function makeLabel(text) {
  const dpr      = 3          // render at 3× for sharp text at any display size
  const fontSize = 5
  const paddingX = 5
  const paddingY = 5
  const radius   = 3

  // Measure at 1× to get logical dimensions
  const measure = document.createElement('canvas').getContext('2d')
  measure.font  = `300 ${fontSize}px "DM Sans", system-ui, sans-serif`
  const logicalW = Math.ceil(measure.measureText(text).width) + paddingX * 2
  const logicalH = fontSize + paddingY * 2

  // Draw at dpr× resolution
  const canvas  = document.createElement('canvas')
  canvas.width  = logicalW * dpr
  canvas.height = logicalH * dpr

  const ctx = canvas.getContext('2d')
  ctx.scale(dpr, dpr)

  ctx.clearRect(0, 0, logicalW, logicalH)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.beginPath()
  ctx.roundRect(0, 0, logicalW, logicalH, radius)
  ctx.fill()

  ctx.font         = `300 ${fontSize}px "DM Sans", system-ui, sans-serif`
  ctx.fillStyle    = '#ffffff'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, paddingX, logicalH / 2)

  const texture   = new THREE.CanvasTexture(canvas)
  const spriteMat = new THREE.SpriteMaterial({
    map: texture, transparent: true, opacity: 0,
    depthWrite: false, depthTest: false,
  })
  const sprite = new THREE.Sprite(spriteMat)
  // Scale based on logical size so world-space proportions stay the same
  sprite.scale.set((logicalW / logicalH) * 10, 10, 1)

  labelScene.add(sprite)
  return sprite
}

// ── Node builders ──────────────────────────────────────────────────────────
function buildSkillNode(node) {
  const r     = Math.sqrt(node.weight) * 3
  const p     = MAT.skill.default
  const group = new THREE.Group()

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.color), roughness: p.roughness, metalness: p.metalness,
    transparent: false, opacity: 1.0, emissive: new THREE.Color(0x000000),
  })
  group.add(new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), mat))

  const label = makeLabel(node.name)

  matMap.set(node.id, { mat, label, labelBaseR: r, nodeType: 'skill', category: node.category })
  return group
}

function buildProjectNode(node) {
  const p     = MAT.project.default
  const group = new THREE.Group()

  const mat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(p.color), roughness: p.roughness, metalness: p.metalness,
    transparent: false, opacity: 1.0, emissive: new THREE.Color(0x000000),
  })
  group.add(new THREE.Mesh(new THREE.SphereGeometry(8, 32, 32), mat))

  const label = makeLabel(node.name)

  matMap.set(node.id, { mat, label, labelBaseR: 8, nodeType: 'project', ptype: node.ptype })
  return group
}

// ── Highlight ──────────────────────────────────────────────────────────────
function applyMat(m, preset, emissiveIntensity = 0, showLabel = false) {
  const isDimmed = preset.opacity < 1
  const needsTransparentToggle = m.mat.transparent !== isDimmed
  m.mat.color.set(preset.color)
  m.mat.roughness = preset.roughness
  m.mat.metalness = preset.metalness
  m.mat.transparent = isDimmed
  m.mat.depthWrite  = !isDimmed  // dimmed nodes don't block labels
  m.mat.opacity = preset.opacity
  m.mat.emissive.copy(emissiveIntensity > 0 ? GREEN : new THREE.Color(0x000000))
  m.mat.emissiveIntensity = emissiveIntensity
  if (needsTransparentToggle) m.mat.needsUpdate = true
  m.label.material.opacity = showLabel ? 1 : 0
}

function applyHighlight() {
  if (!graph) return
  const { mode, activeCategory, activeProjectId } = props
  const activeProj = activeProjectId ? projectsData.find(p => p.id === activeProjectId) : null

  matMap.forEach((m, id) => {
    if (m.nodeType === 'skill') {
      const highlighted =
        mode === 'skills'   ? (!activeCategory || m.category === activeCategory) :
        mode === 'projects' ? (!activeProjectId || (activeProj?.skillIds.includes(id) ?? false))
                            : true
      const active = highlighted &&
        ((mode === 'skills' && activeCategory) ||
         (mode === 'projects' && activeProjectId && activeProj?.skillIds.includes(id)))

      if (active)           applyMat(m, MAT.skill.active,  0,    true)
      else if (highlighted) applyMat(m, MAT.skill.default, 0,    false)
      else                  applyMat(m, MAT.skill.dimmed,  0,    false)

    } else {
      const isActive = activeProjectId === id
      const isDimmed = (mode === 'projects' && activeProjectId && !isActive)
                    || (mode === 'skills'   && activeCategory)

      if (isActive)      applyMat(m, MAT.project.active,  0, true)
      else if (isDimmed) applyMat(m, MAT.project.dimmed,  0,    false)
      else               applyMat(m, MAT.project.default, 0,    false)
    }
  })

  // Links
  graph.linkColor(l => {
    const src = l.source?.id ?? l.source
    const tgt = l.target?.id ?? l.target

    if (mode === 'skills' && activeCategory) {
      const srcActive = src.startsWith('skill-') && matMap.get(src)?.category === activeCategory
      const tgtActive = tgt.startsWith('skill-') && matMap.get(tgt)?.category === activeCategory
      return (srcActive || tgtActive) ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'
    }

    if (mode === 'projects' && activeProjectId) {
      return (src === activeProjectId || tgt === activeProjectId)
        ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'
    }

    return 'rgba(255,255,255,0.15)'
  })

  // Camera
  const allNodes = graph.graphData().nodes
  if (mode === 'skills' && activeCategory) {
    moveCameraTo(allNodes.filter(n => n.nodeType === 'skill' && n.category === activeCategory))
  } else if (mode === 'projects' && activeProjectId) {
    const targets = activeProj
      ? allNodes.filter(n => n.id === activeProjectId || activeProj.skillIds.includes(n.id))
      : []
    moveCameraTo(targets)
  } else {
    resetCamera()
  }
}

// ── Easing ─────────────────────────────────────────────────────────────────
const easeOutExpo    = t => t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
const easeInOutCubic = t => t < 0.5 ? 4 * t ** 3 : 1 - Math.pow(-2 * t + 2, 3) / 2

// ── Camera animation ───────────────────────────────────────────────────────
let rafId = null
let autoRotateTimer = null

function animateCamera({ pos, lookAt, duration = 1000, easing = easeOutExpo }) {
  if (!graph) return
  const controls = graph.controls()
  const camera   = graph.camera()
  clearTimeout(autoRotateTimer)
  cancelAnimationFrame(rafId)
  controls.autoRotate = false
  const sp = { x: camera.position.x, y: camera.position.y, z: camera.position.z }
  const st = { x: controls.target.x,  y: controls.target.y,  z: controls.target.z }
  const t0 = performance.now()
  const step = now => {
    const raw = Math.min((now - t0) / duration, 1)
    const e   = easing(raw)
    camera.position.set(sp.x + (pos.x - sp.x) * e, sp.y + (pos.y - sp.y) * e, sp.z + (pos.z - sp.z) * e)
    controls.target.set(st.x + (lookAt.x - st.x) * e, st.y + (lookAt.y - st.y) * e, st.z + (lookAt.z - st.z) * e)
    if (raw < 1) { rafId = requestAnimationFrame(step) }
    else { autoRotateTimer = setTimeout(() => { if (graph) graph.controls().autoRotate = true }, 50) }
  }
  rafId = requestAnimationFrame(step)
}

function moveCameraTo(targetNodes) {
  if (!graph || !targetNodes.length) return
  const cx = targetNodes.reduce((s, n) => s + (n.x ?? 0), 0) / targetNodes.length
  const cy = targetNodes.reduce((s, n) => s + (n.y ?? 0), 0) / targetNodes.length
  const cz = targetNodes.reduce((s, n) => s + (n.z ?? 0), 0) / targetNodes.length
  const spread = Math.max(...targetNodes.map(n =>
    Math.sqrt(((n.x ?? 0) - cx) ** 2 + ((n.y ?? 0) - cy) ** 2 + ((n.z ?? 0) - cz) ** 2)), 40)
  animateCamera({ pos: { x: cx, y: cy, z: cz + spread * 3.5 + 120 }, lookAt: { x: cx, y: cy, z: cz }, duration: 1000, easing: easeOutExpo })
}

function resetCamera() {
  animateCamera({ pos: { x: 0, y: 0, z: 350 }, lookAt: { x: 0, y: 0, z: 0 }, duration: 1200, easing: easeInOutCubic })
}

// ── Lifecycle ──────────────────────────────────────────────────────────────
onMounted(() => {
  const el = containerRef.value

  graph = ForceGraph3D({ antialias: true })(el)
    .backgroundColor('#141414')
    .graphData({ nodes, links })
    .nodeLabel('name')
    .nodeVal(n => n.nodeType === 'skill' ? n.weight * 1.5 : 6)
    .nodeThreeObject(n => n.nodeType === 'skill' ? buildSkillNode(n) : buildProjectNode(n))
    .nodeThreeObjectExtend(false)
    .linkColor(() => 'rgba(255,255,255,0.06)')
    .linkWidth(0.4)
    .linkOpacity(0.5)
    .width(el.clientWidth)
    .height(el.clientHeight)

  graph.d3Force('charge').strength(-180)
  graph.d3Force('link').distance(60)

  // ── Lighting ──────────────────────────────────────────────────────────
  const scene = graph.scene()
  scene.add(new THREE.AmbientLight(0xffffff, 0.35))

  const keyLight = new THREE.DirectionalLight(0xffffff, 3.0)
  keyLight.position.set(-2, 3, 2)
  scene.add(keyLight)

  const fillLight = new THREE.DirectionalLight(0x8899bb, 0.5)
  fillLight.position.set(2, -1, -1)
  scene.add(fillLight)

  // Rim light — behind the scene, creates edge separation on matte nodes
  const rimLight = new THREE.DirectionalLight(0xddeeff, 1.2)
  rimLight.position.set(-1, -1, -4)
  scene.add(rimLight)

  // ── Depth of Field ────────────────────────────────────────────────────
  const renderer = graph.renderer()
  const camera   = graph.camera()

  composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bokehPass = new BokehPass(scene, camera, {
    focus:    590,
    aperture: 0.6 * 0.00001,
    maxblur:  4   * 0.001,
  })
  composer.addPass(bokehPass)

  const origRender = renderer.render.bind(renderer)
  let insideComposer = false
  renderer.render = (s, c) => {
    if (insideComposer || s !== scene) { origRender(s, c); return }
    insideComposer = true
    composer.render()
    insideComposer = false

    // Sync label positions + keep constant screen size regardless of depth
    const fovScale = 2 * Math.tan((c.fov * Math.PI) / 360)
    const targetH  = 0.04

    graph.graphData().nodes.forEach(n => {
      const m = matMap.get(n.id)
      if (!m?.label || n.x == null) return

      // Compute world-space label height at this node's depth
      const nodePos = new THREE.Vector3(n.x, n.y, n.z)
      const dist    = c.position.distanceTo(nodePos)
      const worldH  = targetH * dist * fovScale
      const aspect  = m.label.material.map.image.width / m.label.material.map.image.height

      // Place label centre above sphere top + half-label-height + margin
      const labelY = n.y + m.labelBaseR + worldH / 2 + 2
      m.label.position.set(n.x, labelY, n.z)
      m.label.scale.set(aspect * worldH, worldH, 1)
    })

    renderer.autoClear = false
    origRender(labelScene, c)
    renderer.autoClear = true
  }

  renderer.domElement.style.pointerEvents = 'none'

  const controls = graph.controls()
  controls.autoRotate      = true
  controls.autoRotateSpeed = 0.4

  let initialized = false
  graph.onEngineStop(() => {
    if (initialized) return
    initialized = true

    bokehPass.uniforms['nearClip'].value = camera.near
    bokehPass.uniforms['farClip'].value  = camera.far

    applyHighlight()
  })
})

onUnmounted(() => {
  cancelAnimationFrame(rafId)
  clearTimeout(autoRotateTimer)
  matMap.clear()
  composer?.dispose()
  if (graph?.renderer) graph.renderer().dispose()
})

watch(() => [props.mode, props.activeCategory, props.activeProjectId], applyHighlight)
</script>

<template>
  <div ref="containerRef" class="force-graph-3d" />
</template>

<style scoped>
.force-graph-3d {
  width: 100%;
  height: 100%;
}

</style>
