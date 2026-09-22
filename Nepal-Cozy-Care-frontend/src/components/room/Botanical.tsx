import { useMemo } from 'react'
import * as THREE from 'three'
import { getSurfaceTexture } from './materials'

// Fenestrated Monstera leaf geometry with realistic curvature and natural fenestration splits
function createMonsteraLeafGeometry(width = 0.38, length = 0.58) {
  const geom = new THREE.BufferGeometry()
  const rows = 28
  const cols = 12
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let r = 0; r <= rows; r++) {
    const v = r / rows
    // Heart-shaped leaf outline profile
    const profile = Math.pow(Math.sin(v * Math.PI), 0.7) * (1 - v * 0.15)
    // Arching tip curve
    const stemCurve = -Math.pow(v, 1.6) * 0.18
    const tipSag = Math.sin(v * Math.PI) * 0.08

    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1 // -1 to +1
      const isRight = u >= 0
      const absU = Math.abs(u)

      // Cutout fenestration slots at intervals
      const isSlot = (r >= 7 && r <= 10) || (r >= 14 && r <= 17) || (r >= 21 && r <= 23)
      const slotDepth = isSlot && absU > 0.35 && absU < 0.85 ? 0.25 : 1.0

      const leafW = absU * width * profile * slotDepth
      const x = isRight ? leafW : -leafW
      const y = v * length
      // V-shaped cross-section along the central rib
      const fold = (1 - Math.cos(absU * Math.PI * 0.5)) * 0.06
      const z = tipSag + stemCurve - fold

      positions.push(x, y, z)
      uvs.push(c / cols, v)
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const p1 = r * (cols + 1) + c
      const p2 = p1 + 1
      const p3 = (r + 1) * (cols + 1) + c
      const p4 = p3 + 1
      indices.push(p1, p3, p2)
      indices.push(p2, p3, p4)
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geom.setIndex(indices)
  geom.computeVertexNormals()
  return geom
}

// Upright Snake Plant leaf geometry with vertical channel and twisted tip
function createSnakeLeafGeometry(width = 0.09, length = 0.95) {
  const geom = new THREE.BufferGeometry()
  const rows = 32
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let r = 0; r <= rows; r++) {
    const v = r / rows
    const widthFactor = Math.pow(Math.sin(v * Math.PI * 0.9), 0.6) * (1 - v * 0.2)
    const twist = Math.sin(v * Math.PI) * 0.05

    for (let c = 0; c <= 6; c++) {
      const u = (c / 6) * 2 - 1
      const x = u * width * widthFactor
      const y = v * length
      const cup = -Math.cos(u * Math.PI * 0.5) * 0.02 * (1 - v * 0.5)
      const z = cup + twist * u

      positions.push(x, y, z)
      uvs.push(c / 6, v)
    }
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < 6; c++) {
      const p1 = r * 7 + c
      const p2 = p1 + 1
      const p3 = (r + 1) * 7 + c
      const p4 = p3 + 1
      indices.push(p1, p3, p2)
      indices.push(p2, p3, p4)
    }
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geom.setIndex(indices)
  geom.computeVertexNormals()
  return geom
}

// Palm pinnate frond leaflet geometry
function createPalmFrondGeometry(length = 0.5) {
  const geom = new THREE.BufferGeometry()
  const segments = 12
  const positions: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const w = Math.sin(t * Math.PI) * 0.028
    const curve = Math.sin(t * Math.PI * 0.8) * 0.08
    positions.push(-w, t * length, -curve)
    positions.push(0, t * length, -curve * 1.05)
    positions.push(w, t * length, -curve)
  }

  for (let i = 0; i < segments; i++) {
    const b = i * 3
    indices.push(b, b + 3, b + 1, b + 1, b + 3, b + 4)
    indices.push(b + 1, b + 4, b + 2, b + 2, b + 4, b + 5)
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geom.setIndex(indices)
  geom.computeVertexNormals()
  return geom
}

interface BotanicalProps {
  kind: 'monstera' | 'snake' | 'palm' | string
  potColor?: string
}

export default function Botanical({ kind, potColor }: BotanicalProps) {
  const ceramicTex = useMemo(() => getSurfaceTexture('ceramic'), [])
  const soilTex = useMemo(() => getSurfaceTexture('soil'), [])
  const leafTex = useMemo(() => getSurfaceTexture('leaf'), [])

  const monsteraLeaf = useMemo(() => createMonsteraLeafGeometry(0.32, 0.62), [])
  const snakeLeaf = useMemo(() => createSnakeLeafGeometry(0.085, 0.92), [])
  const palmLeaflet = useMemo(() => createPalmFrondGeometry(0.42), [])

  const defaultPot = kind === 'monstera' ? '#d8875f' : kind === 'snake' ? '#e5ded5' : '#7d8a7c'
  const activePotColor = potColor || defaultPot

  if (kind === 'snake') {
    return (
      <group>
        {/* Modern Fluted Ceramic Planter */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.18, 0.5, 36]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.4} metalness={0.05} color={activePotColor} />
        </mesh>
        {/* Pot Saucer Base */}
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.22, 0.04, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.45} color={activePotColor} />
        </mesh>
        {/* Soil Bed */}
        <mesh position={[0, 0.485, 0]}>
          <cylinderGeometry args={[0.228, 0.228, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.96} color="#35281e" />
        </mesh>

        {/* Upright Variegated Blades */}
        {[
          { a: 0, h: 0.95, r: 0.06, tilt: 0.06, rotZ: 0.04 },
          { a: 0.78, h: 1.15, r: 0.08, tilt: -0.05, rotZ: 0.08 },
          { a: 1.57, h: 0.88, r: 0.07, tilt: 0.08, rotZ: -0.06 },
          { a: 2.35, h: 1.25, r: 0.05, tilt: -0.04, rotZ: 0.03 },
          { a: 3.14, h: 1.05, r: 0.09, tilt: 0.07, rotZ: 0.09 },
          { a: 3.92, h: 1.2, r: 0.06, tilt: -0.06, rotZ: -0.07 },
          { a: 4.71, h: 0.92, r: 0.08, tilt: 0.05, rotZ: 0.06 },
          { a: 5.49, h: 1.1, r: 0.07, tilt: -0.07, rotZ: -0.05 },
          { a: 1.15, h: 1.35, r: 0.02, tilt: 0.02, rotZ: 0.01 }, // Central tallest shoot
        ].map((blade, idx) => {
          const posX = Math.sin(blade.a) * blade.r
          const posZ = Math.cos(blade.a) * blade.r
          return (
            <mesh
              key={idx}
              geometry={snakeLeaf}
              position={[posX, 0.49, posZ]}
              rotation={[blade.tilt, blade.a, blade.rotZ]}
              scale={[1, blade.h / 0.95, 1]}
              castShadow
            >
              <meshStandardMaterial
                map={leafTex}
                roughness={0.45}
                color={idx % 2 === 0 ? '#436d39' : '#32542a'}
                side={THREE.DoubleSide}
              />
            </mesh>
          )
        })}
      </group>
    )
  }

  if (kind === 'palm') {
    return (
      <group>
        {/* Tapered Scandinavian Pot */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.17, 0.56, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.35} color={activePotColor} />
        </mesh>
        {/* Soil Bed */}
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.95} color="#2e2218" />
        </mesh>

        {/* Arching Fronds */}
        {[
          { angle: 0.2, height: 1.1, spread: 0.58 },
          { angle: 1.1, height: 1.35, spread: 0.65 },
          { angle: 2.1, height: 1.25, spread: 0.62 },
          { angle: 3.1, height: 1.45, spread: 0.7 },
          { angle: 4.1, height: 1.2, spread: 0.55 },
          { angle: 5.1, height: 1.38, spread: 0.68 },
        ].map((stem, stemIdx) => {
          return (
            <group key={stemIdx} rotation={[0, stem.angle, 0]}>
              {/* Arching Stem Cane */}
              <mesh position={[0.08, stem.height * 0.45 + 0.35, 0]} rotation={[0, 0, -stem.spread * 0.65]} castShadow>
                <cylinderGeometry args={[0.008, 0.018, stem.height, 8]} />
                <meshStandardMaterial color="#6a8246" roughness={0.7} />
              </mesh>

              {/* Pinnate Leaflets along the stem */}
              {Array.from({ length: 14 }).map((_, leafIdx) => {
                const frac = (leafIdx + 1) / 14
                const posX = 0.08 + frac * 0.45 * Math.sin(stem.spread)
                const posY = 0.5 + frac * stem.height * 0.75
                const isLeft = leafIdx % 2 === 0
                return (
                  <mesh
                    key={leafIdx}
                    geometry={palmLeaflet}
                    position={[posX, posY, 0]}
                    rotation={[isLeft ? -0.85 : 0.85, 0, -0.65 - frac * 0.45]}
                    scale={[1, 0.85 + frac * 0.3, 1]}
                    castShadow
                  >
                    <meshStandardMaterial
                      map={leafTex}
                      color={isLeft ? '#477038' : '#5f8a47'}
                      roughness={0.42}
                      side={THREE.DoubleSide}
                    />
                  </mesh>
                )
              })}
            </group>
          )
        })}
      </group>
    )
  }

  // Default: Lush Monstera Deliciosa
  return (
    <group>
      {/* Terracotta Planter with Rim */}
      <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.29, 0.21, 0.48, 36]} />
        <meshStandardMaterial map={ceramicTex} roughness={0.72} color={activePotColor} />
      </mesh>
      {/* Pot Collar Rim */}
      <mesh position={[0, 0.47, 0]} castShadow>
        <torusGeometry args={[0.285, 0.022, 12, 36]} />
        <meshStandardMaterial map={ceramicTex} roughness={0.7} color={activePotColor} />
      </mesh>
      {/* Soil */}
      <mesh position={[0, 0.465, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 32]} />
        <meshStandardMaterial map={soilTex} roughness={0.98} color="#2b2017" />
      </mesh>

      {/* Spreading Leaf Stems and Fenestrated Leaves */}
      {[
        { a: 0.3, h: 0.7, tiltX: 0.35, tiltZ: -0.65, scale: 0.95 },
        { a: 1.2, h: 0.95, tiltX: -0.25, tiltZ: -0.75, scale: 1.15 },
        { a: 2.1, h: 0.8, tiltX: -0.45, tiltZ: -0.6, scale: 1.0 },
        { a: 2.9, h: 1.05, tiltX: -0.3, tiltZ: -0.8, scale: 1.2 },
        { a: 3.9, h: 0.75, tiltX: 0.2, tiltZ: -0.65, scale: 0.9 },
        { a: 4.8, h: 1.15, tiltX: 0.4, tiltZ: -0.75, scale: 1.25 },
        { a: 5.7, h: 0.85, tiltX: 0.15, tiltZ: -0.7, scale: 1.05 },
      ].map((leaf, i) => {
        return (
          <group key={i} rotation={[0, leaf.a, 0]}>
            {/* Curved Leaf Stem */}
            <mesh position={[0.16, leaf.h * 0.45 + 0.26, 0]} rotation={[0, 0, -0.42]} castShadow>
              <cylinderGeometry args={[0.01, 0.016, leaf.h, 10]} />
              <meshStandardMaterial color="#476b32" roughness={0.65} />
            </mesh>
            {/* Fenestrated Leaf Blade */}
            <mesh
              geometry={monsteraLeaf}
              position={[0.3, leaf.h * 0.85 + 0.2, 0]}
              rotation={[leaf.tiltX, 0, leaf.tiltZ]}
              scale={[leaf.scale, leaf.scale, leaf.scale]}
              castShadow
            >
              <meshStandardMaterial
                map={leafTex}
                roughness={0.36}
                metalness={0.02}
                color={i % 2 === 0 ? '#38632a' : '#497c36'}
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
