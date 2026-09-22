import * as THREE from 'three'

// Cached procedural PBR textures to prevent redundant canvas redraws
const textureCache = new Map<string, THREE.Texture>()

export type SurfaceType = 'wood' | 'fabric' | 'plaster' | 'ceramic' | 'soil' | 'leaf' | 'marble' | 'rug'

/**
 * Generates or retrieves a high-resolution, deterministic procedural PBR surface texture.
 */
export function getSurfaceTexture(kind: SurfaceType, resolution = 512): THREE.Texture {
  const cacheKey = `${kind}_${resolution}`
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!
  }

  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = resolution
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    const fallback = new THREE.Texture()
    return fallback
  }

  const imgData = ctx.createImageData(resolution, resolution)
  const d = imgData.data
  let seed = 42

  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0
    return seed / 4294967296
  }

  if (kind === 'wood') {
    // Rich realistic hardwood grain with fine rings and plank seams
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const u = x / resolution
        const plankIdx = Math.floor(u * 4)
        const plankEdge = Math.abs((u * 4) % 1)
        const seam = plankEdge < 0.02 || plankEdge > 0.98 ? 0.45 : 1.0

        const wave = Math.sin(y * 0.08 + Math.sin(x * 0.015) * 4) * 0.5 + 0.5
        const fineGrain = Math.sin(y * 1.6 + rnd() * 0.4) * 0.2
        const noise = (rnd() - 0.5) * 0.08
        const tone = (190 + wave * 45 + fineGrain * 30 + (plankIdx % 2) * 12 + noise * 255) * seam

        const i = (y * resolution + x) * 4
        d[i] = Math.min(255, Math.max(0, tone * 1.05))
        d[i + 1] = Math.min(255, Math.max(0, tone * 0.88))
        d[i + 2] = Math.min(255, Math.max(0, tone * 0.68))
        d[i + 3] = 255
      }
    }
  } else if (kind === 'fabric') {
    // Woven linen fabric micro-structure
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const weaveX = Math.cos(x * Math.PI * 0.5) * 0.5 + 0.5
        const weaveY = Math.sin(y * Math.PI * 0.5) * 0.5 + 0.5
        const pattern = (weaveX + weaveY) * 0.5
        const noise = rnd() * 0.15
        const tone = 200 + pattern * 35 + noise * 40

        const i = (y * resolution + x) * 4
        d[i] = tone
        d[i + 1] = tone * 0.98
        d[i + 2] = tone * 0.95
        d[i + 3] = 255
      }
    }
  } else if (kind === 'ceramic') {
    // Smooth speckled ceramic glaze
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const isSpeckle = rnd() > 0.988
        const base = 230 + rnd() * 15
        const tone = isSpeckle ? 90 + rnd() * 40 : base

        const i = (y * resolution + x) * 4
        d[i] = tone * 0.98
        d[i + 1] = tone * 0.95
        d[i + 2] = tone * 0.9
        d[i + 3] = 255
      }
    }
  } else if (kind === 'soil') {
    // Organic rich potting mix with perlite particles
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const isPerlite = rnd() > 0.97
        const base = isPerlite ? 210 + rnd() * 40 : 45 + rnd() * 35
        const i = (y * resolution + x) * 4
        d[i] = base * (isPerlite ? 0.95 : 1.1)
        d[i + 1] = base * (isPerlite ? 0.95 : 0.85)
        d[i + 2] = base * (isPerlite ? 0.95 : 0.65)
        d[i + 3] = 255
      }
    }
  } else if (kind === 'leaf') {
    // Organic botanical leaf with main rib and secondary veins
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const u = x / resolution
        const v = y / resolution
        const distFromCenter = Math.abs(u - 0.5)
        const mainVein = Math.max(0, 1 - distFromCenter * 35)
        const sideVeinAngle = Math.sin((v * 16 - distFromCenter * 8) * Math.PI)
        const sideVeins = Math.max(0, Math.pow(Math.max(0, sideVeinAngle), 6)) * (1 - distFromCenter * 1.5)
        const veinIntensity = Math.min(1, mainVein * 0.8 + sideVeins * 0.4)

        const baseGreen = 180 + veinIntensity * 55 + rnd() * 15
        const i = (y * resolution + x) * 4
        d[i] = baseGreen * 0.45
        d[i + 1] = baseGreen * 0.95
        d[i + 2] = baseGreen * 0.35
        d[i + 3] = 255
      }
    }
  } else if (kind === 'marble') {
    // Elegant warm marble veins
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const u = x / resolution
        const v = y / resolution
        const vein = Math.sin(u * 6 + Math.sin(v * 4 + rnd() * 0.5) * 3)
        const marbleTone = Math.pow(Math.abs(vein), 0.4) * 60 + 195 + rnd() * 8
        const i = (y * resolution + x) * 4
        d[i] = marbleTone
        d[i + 1] = marbleTone * 0.98
        d[i + 2] = marbleTone * 0.94
        d[i + 3] = 255
      }
    }
  } else if (kind === 'rug') {
    // Woven boho rug pattern
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const diamond = Math.abs(Math.sin(x * 0.05) * Math.sin(y * 0.05))
        const tone = 210 + diamond * 30 + rnd() * 15
        const i = (y * resolution + x) * 4
        d[i] = tone
        d[i + 1] = tone * 0.93
        d[i + 2] = tone * 0.82
        d[i + 3] = 255
      }
    }
  } else {
    // Plaster / Stucco subtle wall texture
    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const noise = (rnd() - 0.5) * 20
        const tone = Math.min(255, Math.max(0, 235 + noise))
        const i = (y * resolution + x) * 4
        d[i] = tone
        d[i + 1] = tone
        d[i + 2] = tone
        d[i + 3] = 255
      }
    }
  }

  ctx.putImageData(imgData, 0, 0)
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = 8

  if (kind === 'wood') {
    texture.repeat.set(1, 4)
  } else if (kind === 'fabric') {
    texture.repeat.set(4, 4)
  } else if (kind === 'rug') {
    texture.repeat.set(2, 2)
  }

  textureCache.set(cacheKey, texture)
  return texture
}

// Backward-compatible export
export function surface(kind: 'wood' | 'fabric' | 'plaster'): THREE.Texture {
  return getSurfaceTexture(kind)
}
