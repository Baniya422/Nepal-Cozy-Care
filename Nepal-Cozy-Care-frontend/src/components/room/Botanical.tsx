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

// Broad oval/lyrate leaf geometry
function createBroadLeafGeometry(width = 0.28, length = 0.48, tipSag = 0.04) {
  const geom = new THREE.BufferGeometry()
  const rows = 16
  const cols = 8
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []

  for (let r = 0; r <= rows; r++) {
    const v = r / rows
    const profile = Math.sin(v * Math.PI) * (1 - v * 0.2)
    const curveZ = -Math.pow(v, 1.4) * tipSag

    for (let c = 0; c <= cols; c++) {
      const u = (c / cols) * 2 - 1
      const absU = Math.abs(u)
      const x = u * width * profile
      const y = v * length
      const fold = (1 - Math.cos(absU * Math.PI * 0.5)) * 0.03
      const z = curveZ - fold

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

interface BotanicalProps {
  kind:
    | 'monstera'
    | 'snake'
    | 'palm'
    | 'rubber'
    | 'fiddle'
    | 'pothos'
    | 'zz'
    | 'peacelily'
    | 'aloe'
    | 'jade'
    | 'spider'
    | 'fern'
    | 'calathea'
    | 'cactus'
    | 'anthurium'
    | 'dracaena'
    | 'bonsai'
    | 'stringofpearls'
    | string
  potColor?: string
}

export default function Botanical({ kind, potColor }: BotanicalProps) {
  const ceramicTex = useMemo(() => getSurfaceTexture('ceramic'), [])
  const soilTex = useMemo(() => getSurfaceTexture('soil'), [])
  const leafTex = useMemo(() => getSurfaceTexture('leaf'), [])

  const monsteraLeaf = useMemo(() => createMonsteraLeafGeometry(0.32, 0.62), [])
  const snakeLeaf = useMemo(() => createSnakeLeafGeometry(0.085, 0.92), [])
  const palmLeaflet = useMemo(() => createPalmFrondGeometry(0.42), [])
  const broadLeaf = useMemo(() => createBroadLeafGeometry(0.24, 0.44, 0.06), [])
  const fiddleLeaf = useMemo(() => createBroadLeafGeometry(0.32, 0.52, 0.08), [])
  const smallLeaf = useMemo(() => createBroadLeafGeometry(0.12, 0.22, 0.03), [])

  const defaultPotMap: Record<string, string> = {
    monstera: '#d8875f',
    snake: '#e5ded5',
    palm: '#7d8a7c',
    rubber: '#354339',
    fiddle: '#ded5c7',
    pothos: '#f4ede2',
    zz: '#2b332d',
    peacelily: '#ffffff',
    aloe: '#d48c66',
    jade: '#4a5b50',
    spider: '#ede8dd',
    fern: '#7a8b7b',
    calathea: '#453831',
    cactus: '#e09867',
    anthurium: '#fdfaf5',
    dracaena: '#d1c4b4',
    bonsai: '#3d3028',
    stringofpearls: '#eae4d9',
  }

  const activePotColor = potColor || defaultPotMap[kind] || '#d8875f'

  if (kind === 'snake') {
    return (
      <group>
        {/* Modern Fluted Ceramic Planter */}
        <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.18, 0.5, 36]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.4} metalness={0.05} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.02, 0]} castShadow>
          <cylinderGeometry args={[0.21, 0.22, 0.04, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.45} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.485, 0]}>
          <cylinderGeometry args={[0.228, 0.228, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.96} color="#35281e" />
        </mesh>
        {[
          { a: 0, h: 0.95, r: 0.06, tilt: 0.06, rotZ: 0.04 },
          { a: 0.78, h: 1.15, r: 0.08, tilt: -0.05, rotZ: 0.08 },
          { a: 1.57, h: 0.88, r: 0.07, tilt: 0.08, rotZ: -0.06 },
          { a: 2.35, h: 1.25, r: 0.05, tilt: -0.04, rotZ: 0.03 },
          { a: 3.14, h: 1.05, r: 0.09, tilt: 0.07, rotZ: 0.09 },
          { a: 3.92, h: 1.2, r: 0.06, tilt: -0.06, rotZ: -0.07 },
          { a: 4.71, h: 0.92, r: 0.08, tilt: 0.05, rotZ: 0.06 },
          { a: 5.49, h: 1.1, r: 0.07, tilt: -0.07, rotZ: -0.05 },
          { a: 1.15, h: 1.35, r: 0.02, tilt: 0.02, rotZ: 0.01 },
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
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.17, 0.56, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.35} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.95} color="#2e2218" />
        </mesh>
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
              <mesh position={[0.08, stem.height * 0.45 + 0.35, 0]} rotation={[0, 0, -stem.spread * 0.65]} castShadow>
                <cylinderGeometry args={[0.008, 0.018, stem.height, 8]} />
                <meshStandardMaterial color="#6a8246" roughness={0.7} />
              </mesh>
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

  if (kind === 'rubber') {
    return (
      <group>
        {/* Matte Slate Cylinder Pot */}
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.22, 0.52, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.4} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.51, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.95} color="#2b2017" />
        </mesh>
        {/* Central Woody Trunk */}
        <mesh position={[0, 0.95, 0]} castShadow>
          <cylinderGeometry args={[0.022, 0.038, 0.9, 12]} />
          <meshStandardMaterial color="#3d2c1e" roughness={0.8} />
        </mesh>
        {/* Glossy Burgundy-Green Oval Leaves */}
        {Array.from({ length: 9 }).map((_, idx) => {
          const frac = (idx + 1) / 9
          const angle = idx * 2.4
          const y = 0.55 + frac * 0.8
          return (
            <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
              <mesh position={[0.18, 0.05, 0]} rotation={[0.2, 0, -0.55]} geometry={broadLeaf} castShadow>
                <meshPhysicalMaterial
                  map={leafTex}
                  color="#1e2d24"
                  roughness={0.18}
                  clearcoat={0.65}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  }

  if (kind === 'fiddle') {
    return (
      <group>
        {/* Terracotta/Concrete Pot */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.2, 0.56, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.6} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.95} color="#2b2017" />
        </mesh>
        {/* Upright Slender Tree Trunk */}
        <mesh position={[0, 1.15, 0]} castShadow>
          <cylinderGeometry args={[0.025, 0.042, 1.25, 12]} />
          <meshStandardMaterial color="#4a3728" roughness={0.85} />
        </mesh>
        {/* Large Lyre-shaped Violin Leaves */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const frac = (idx + 1) / 8
          const angle = idx * 2.2
          const y = 0.7 + frac * 0.95
          return (
            <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
              <mesh position={[0.24, 0.08, 0]} rotation={[0.15, 0, -0.65]} geometry={fiddleLeaf} castShadow>
                <meshStandardMaterial
                  map={leafTex}
                  color={idx % 2 === 0 ? '#38632c' : '#497938'}
                  roughness={0.35}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  }

  if (kind === 'pothos') {
    return (
      <group>
        {/* Hanging Bowl / Ledge Planter */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.14, 0.36, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.3} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#281f18" />
        </mesh>
        {/* Trailing Cascading Vines with Variegated Leaves */}
        {[0, 1.25, 2.5, 3.75, 5.0].map((vineAngle, vIdx) => (
          <group key={vIdx} rotation={[0, vineAngle, 0]}>
            {Array.from({ length: 6 }).map((_, lIdx) => {
              const f = (lIdx + 1) / 6
              const px = 0.14 + f * 0.16
              const py = 0.32 - f * 0.45
              return (
                <mesh
                  key={lIdx}
                  geometry={smallLeaf}
                  position={[px, py, 0]}
                  rotation={[0.3, 0, -0.9 + f * 0.3]}
                  castShadow
                >
                  <meshStandardMaterial map={leafTex} color="#588e3c" roughness={0.38} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'zz') {
    return (
      <group>
        {/* Modern Fluted Cylindrical Pot */}
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.19, 0.48, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.3} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} roughness={0.95} color="#291f16" />
        </mesh>
        {/* 7 Upright arching fleshy ZZ stems with glossy alternating leaflets */}
        {[
          { angle: 0.2, height: 0.85, tilt: 0.22 },
          { angle: 1.1, height: 1.05, tilt: 0.28 },
          { angle: 2.0, height: 0.95, tilt: 0.25 },
          { angle: 2.9, height: 1.15, tilt: 0.2 },
          { angle: 3.8, height: 0.9, tilt: 0.3 },
          { angle: 4.7, height: 1.1, tilt: 0.24 },
          { angle: 5.6, height: 0.8, tilt: 0.26 },
        ].map((stem, sIdx) => {
          return (
            <group key={sIdx} rotation={[0, stem.angle, 0]}>
              <mesh position={[0.06, stem.height * 0.45 + 0.35, 0]} rotation={[0, 0, -stem.tilt]} castShadow>
                <cylinderGeometry args={[0.009, 0.018, stem.height, 8]} />
                <meshStandardMaterial color="#2d522e" roughness={0.5} />
              </mesh>
              {Array.from({ length: 8 }).map((_, lfIdx) => {
                const frac = (lfIdx + 1) / 8
                const isLeft = lfIdx % 2 === 0
                const px = 0.06 + frac * 0.22
                const py = 0.45 + frac * stem.height * 0.72
                return (
                  <mesh
                    key={lfIdx}
                    geometry={smallLeaf}
                    position={[px, py, isLeft ? 0.03 : -0.03]}
                    rotation={[isLeft ? -0.4 : 0.4, 0, -0.65]}
                    scale={[1.1, 1.1, 1.1]}
                    castShadow
                  >
                    <meshPhysicalMaterial
                      map={leafTex}
                      color={isLeft ? '#1b4324' : '#23522c'}
                      roughness={0.16}
                      clearcoat={0.7}
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

  if (kind === 'peacelily') {
    return (
      <group>
        {/* Glazed Porcelain Pot */}
        <mesh position={[0, 0.24, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.18, 0.48, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.25} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.47, 0]}>
          <cylinderGeometry args={[0.23, 0.23, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#281f18" />
        </mesh>
        {/* Deep Green Arching Foliage */}
        {Array.from({ length: 8 }).map((_, idx) => {
          const angle = idx * 0.8
          return (
            <group key={`leaf_${idx}`} rotation={[0, angle, 0]}>
              <mesh position={[0.22, 0.45, 0]} rotation={[0.2, 0, -0.75]} geometry={broadLeaf} castShadow>
                <meshStandardMaterial map={leafTex} color="#214022" roughness={0.35} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )
        })}
        {/* 2 Elegant White Spathe Blooms with Golden Spadix */}
        {[-0.5, 0.7].map((flowerAngle, fIdx) => (
          <group key={`flower_${fIdx}`} rotation={[0, flowerAngle, 0]}>
            {/* Tall slender stem */}
            <mesh position={[0.12, 0.82, 0]} rotation={[0, 0, -0.15]} castShadow>
              <cylinderGeometry args={[0.006, 0.008, 0.65, 8]} />
              <meshStandardMaterial color="#477334" />
            </mesh>
            {/* White Spathe Petal */}
            <mesh position={[0.16, 1.15, 0]} rotation={[0, 0, -0.2]} geometry={smallLeaf} castShadow>
              <meshStandardMaterial color="#ffffff" roughness={0.3} side={THREE.DoubleSide} />
            </mesh>
            {/* Golden Spadix center */}
            <mesh position={[0.16, 1.13, 0.015]} rotation={[0, 0, -0.2]}>
              <cylinderGeometry args={[0.008, 0.008, 0.08, 10]} />
              <meshStandardMaterial color="#f0d06e" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'aloe') {
    return (
      <group>
        {/* Terracotta Shallow Pot */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.18, 0.32, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.7} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.24, 0.24, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#38291f" />
        </mesh>
        {/* Fleshy Rosette Leaves */}
        {Array.from({ length: 12 }).map((_, idx) => {
          const angle = idx * 0.55
          const tier = Math.floor(idx / 4)
          const length = 0.5 - tier * 0.08
          const tilt = 0.65 - tier * 0.2
          return (
            <group key={idx} rotation={[0, angle, 0]}>
              <mesh
                position={[0.12 + tier * 0.03, 0.32 + tier * 0.04, 0]}
                rotation={[0, 0, -tilt]}
                geometry={snakeLeaf}
                scale={[0.7, length, 0.7]}
                castShadow
              >
                <meshStandardMaterial color="#4e7c5b" roughness={0.45} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  }

  if (kind === 'jade') {
    return (
      <group>
        {/* Terracotta Planter */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.18, 0.36, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.65} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.225, 0.225, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#302219" />
        </mesh>
        {/* Thick Woody Bonsai Succulent Trunk & Branches */}
        <mesh position={[0, 0.5, 0]} castShadow>
          <cylinderGeometry args={[0.038, 0.055, 0.32, 12]} />
          <meshStandardMaterial color="#544030" roughness={0.85} />
        </mesh>
        <mesh position={[-0.08, 0.68, 0]} rotation={[0, 0, 0.5]} castShadow>
          <cylinderGeometry args={[0.024, 0.034, 0.25, 10]} />
          <meshStandardMaterial color="#544030" roughness={0.85} />
        </mesh>
        <mesh position={[0.08, 0.7, 0.04]} rotation={[0.3, 0, -0.45]} castShadow>
          <cylinderGeometry args={[0.024, 0.034, 0.26, 10]} />
          <meshStandardMaterial color="#544030" roughness={0.85} />
        </mesh>
        {/* Clusters of Plump Round Oval Jade Disc Leaves */}
        {[
          [-0.16, 0.8, 0.02],
          [-0.12, 0.86, -0.05],
          [0.15, 0.82, 0.08],
          [0.18, 0.88, -0.02],
          [0, 0.9, 0],
          [-0.04, 0.96, 0.06],
          [0.05, 0.98, -0.04],
        ].map(([px, py, pz], jIdx) => (
          <group key={jIdx} position={[px, py, pz]}>
            <mesh castShadow>
              <sphereGeometry args={[0.07, 12, 10]} />
              <meshPhysicalMaterial
                color="#3d6c48"
                roughness={0.25}
                clearcoat={0.5}
              />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'spider') {
    return (
      <group>
        {/* Modern Ceramic Bowl */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.16, 0.36, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.3} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.225, 0.225, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#2b2017" />
        </mesh>
        {/* Fountain of Arching Variegated Ribbon Leaves */}
        {Array.from({ length: 16 }).map((_, idx) => {
          const angle = (idx * Math.PI * 2) / 16
          const tilt = 0.55 + (idx % 4) * 0.1
          return (
            <group key={idx} rotation={[0, angle, 0]}>
              <mesh
                position={[0.18, 0.38, 0]}
                rotation={[0, 0, -tilt]}
                geometry={snakeLeaf}
                scale={[0.45, 0.7, 0.45]}
                castShadow
              >
                <meshStandardMaterial
                  map={leafTex}
                  color={idx % 2 === 0 ? '#549646' : '#7cb36e'}
                  roughness={0.4}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )
        })}
        {/* 3 Dangling Runner Stems with Spiderette Plantlets */}
        {[0.6, 2.7, 4.8].map((runnerAngle, rIdx) => (
          <group key={`runner_${rIdx}`} rotation={[0, runnerAngle, 0]}>
            <mesh position={[0.28, 0.15, 0]} rotation={[0, 0, -1.2]} castShadow>
              <cylinderGeometry args={[0.004, 0.005, 0.48, 8]} />
              <meshStandardMaterial color="#94b87d" />
            </mesh>
            {/* Baby spiderette clump */}
            <mesh position={[0.46, -0.05, 0]} castShadow>
              <sphereGeometry args={[0.055, 8, 8]} />
              <meshStandardMaterial color="#5b9c4c" roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'fern') {
    return (
      <group>
        {/* Bowl Planter */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.18, 0.4, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.4} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#2b2017" />
        </mesh>
        {/* Dense Feathery Cascading Fronds */}
        {Array.from({ length: 14 }).map((_, idx) => {
          const angle = (idx * Math.PI * 2) / 14
          const tilt = 0.65 + (idx % 3) * 0.15
          return (
            <group key={idx} rotation={[0, angle, 0]}>
              <mesh position={[0.25, 0.42, 0]} rotation={[0, 0, -tilt]} geometry={palmLeaflet} scale={[1.2, 1.3, 1.2]} castShadow>
                <meshStandardMaterial map={leafTex} color={idx % 2 === 0 ? '#49873d' : '#63a352'} roughness={0.4} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  }

  if (kind === 'calathea') {
    return (
      <group>
        {/* Terracotta Fluted Pot */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.18, 0.44, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.5} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#2b2017" />
        </mesh>
        {/* Broad Patterned Round Medallion Leaves */}
        {Array.from({ length: 7 }).map((_, idx) => {
          const angle = idx * 0.95
          const y = 0.45 + (idx % 3) * 0.08
          return (
            <group key={idx} position={[0, y, 0]} rotation={[0, angle, 0]}>
              {/* Petiole */}
              <mesh position={[0.1, 0.1, 0]} rotation={[0, 0, -0.6]} castShadow>
                <cylinderGeometry args={[0.007, 0.01, 0.35, 8]} />
                <meshStandardMaterial color="#5e2945" roughness={0.6} />
              </mesh>
              {/* Leaf Blade */}
              <mesh position={[0.24, 0.22, 0]} rotation={[0.2, 0, -0.65]} geometry={broadLeaf} castShadow>
                <meshStandardMaterial
                  map={leafTex}
                  color={idx % 2 === 0 ? '#264e32' : '#33633e'}
                  roughness={0.32}
                  side={THREE.DoubleSide}
                />
              </mesh>
            </group>
          )
        })}
      </group>
    )
  }

  if (kind === 'cactus') {
    return (
      <group>
        {/* Geometric Terracotta Pot */}
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.17, 0.4, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.7} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.39, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#35281e" />
        </mesh>
        {/* Main Columnar Stem */}
        <mesh position={[0, 0.85, 0]} castShadow>
          <cylinderGeometry args={[0.075, 0.075, 0.9, 16]} />
          <meshStandardMaterial color="#42734a" roughness={0.65} />
        </mesh>
        {/* Left Branch Arm */}
        <group position={[-0.14, 0.8, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[0.06, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.14, 12]} />
            <meshStandardMaterial color="#42734a" roughness={0.65} />
          </mesh>
          <mesh position={[-0.02, 0.16, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.32, 12]} />
            <meshStandardMaterial color="#42734a" roughness={0.65} />
          </mesh>
        </group>
        {/* Right Branch Arm */}
        <group position={[0.14, 0.95, 0]}>
          <mesh rotation={[0, 0, -Math.PI / 2]} position={[-0.06, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.14, 12]} />
            <meshStandardMaterial color="#42734a" roughness={0.65} />
          </mesh>
          <mesh position={[0.02, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.045, 0.36, 12]} />
            <meshStandardMaterial color="#42734a" roughness={0.65} />
          </mesh>
        </group>
      </group>
    )
  }

  if (kind === 'anthurium') {
    return (
      <group>
        {/* Glossy Modern Pot */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.16, 0.44, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.25} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#281f18" />
        </mesh>
        {/* Glossy Green Leaves */}
        {Array.from({ length: 6 }).map((_, idx) => {
          const angle = idx * 1.05
          return (
            <group key={`aleaf_${idx}`} rotation={[0, angle, 0]}>
              <mesh position={[0.18, 0.42, 0]} rotation={[0.2, 0, -0.7]} geometry={broadLeaf} castShadow>
                <meshStandardMaterial map={leafTex} color="#244527" roughness={0.3} side={THREE.DoubleSide} />
              </mesh>
            </group>
          )
        })}
        {/* 2 Brilliant Scarlet Red Spathe Flowers */}
        {[-0.6, 0.8].map((fAngle, fIdx) => (
          <group key={`anth_flower_${fIdx}`} rotation={[0, fAngle, 0]}>
            <mesh position={[0.12, 0.72, 0]} rotation={[0, 0, -0.18]} castShadow>
              <cylinderGeometry args={[0.006, 0.008, 0.58, 8]} />
              <meshStandardMaterial color="#477334" />
            </mesh>
            <mesh position={[0.18, 0.98, 0]} rotation={[0.25, 0, -0.35]} geometry={smallLeaf} castShadow>
              <meshPhysicalMaterial color="#d62828" roughness={0.15} clearcoat={0.8} side={THREE.DoubleSide} />
            </mesh>
            <mesh position={[0.18, 0.98, 0.02]} rotation={[0.2, 0, -0.35]}>
              <cylinderGeometry args={[0.007, 0.007, 0.09, 10]} />
              <meshStandardMaterial color="#f7df1e" roughness={0.4} />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'dracaena') {
    return (
      <group>
        {/* Contemporary Tall Slate Pot */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.18, 0.56, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.45} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#2b2017" />
        </mesh>
        {/* 3 Stems of varying heights with spiky explosion crowns */}
        {[
          { caneX: -0.06, caneZ: -0.04, h: 0.75, lean: 0.08 },
          { caneX: 0.08, caneZ: 0.05, h: 1.15, lean: -0.06 },
          { caneX: 0, caneZ: 0, h: 1.45, lean: 0.03 },
        ].map((cane, cIdx) => (
          <group key={cIdx} position={[cane.caneX, 0, cane.caneZ]}>
            {/* Woody Cane Trunk */}
            <mesh position={[0, 0.55 + cane.h * 0.45, 0]} rotation={[cane.lean, 0, -cane.lean]} castShadow>
              <cylinderGeometry args={[0.016, 0.025, cane.h, 10]} />
              <meshStandardMaterial color="#5a4533" roughness={0.8} />
            </mesh>
            {/* Spiky Ribbon Crown */}
            <group position={[0, 0.55 + cane.h * 0.92, 0]}>
              {Array.from({ length: 12 }).map((_, lIdx) => {
                const angle = (lIdx * Math.PI * 2) / 12
                const tilt = 0.5 + (lIdx % 3) * 0.2
                return (
                  <mesh
                    key={lIdx}
                    geometry={snakeLeaf}
                    rotation={[tilt * Math.sin(angle), angle, -tilt * Math.cos(angle)]}
                    scale={[0.4, 0.65, 0.4]}
                    castShadow
                  >
                    <meshStandardMaterial color="#2d5e35" roughness={0.4} side={THREE.DoubleSide} />
                  </mesh>
                )
              })}
            </group>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'bonsai') {
    return (
      <group>
        {/* Traditional Low Ceramic Bonsai Tray */}
        <mesh position={[0, 0.08, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.34, 0.28, 0.16, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.5} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.155, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#2b1f17" />
        </mesh>
        {/* Sculpted Gnarled Trunk */}
        <mesh position={[0, 0.32, 0]} rotation={[0.15, 0, 0.2]} castShadow>
          <cylinderGeometry args={[0.04, 0.075, 0.35, 12]} />
          <meshStandardMaterial color="#4a3628" roughness={0.85} />
        </mesh>
        <mesh position={[-0.08, 0.52, 0]} rotation={[-0.2, 0, -0.4]} castShadow>
          <cylinderGeometry args={[0.028, 0.04, 0.32, 10]} />
          <meshStandardMaterial color="#4a3628" roughness={0.85} />
        </mesh>
        {/* Foliage Cloud Pads */}
        {[
          [-0.18, 0.62, 0],
          [0.12, 0.58, 0.08],
          [-0.04, 0.74, -0.05],
        ].map(([px, py, pz], pIdx) => (
          <group key={pIdx} position={[px, py, pz]}>
            <mesh castShadow>
              <sphereGeometry args={[0.13, 14, 14]} />
              <meshStandardMaterial map={leafTex} color="#355e2d" roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'stringofpearls') {
    return (
      <group>
        {/* Minimalist Hanging Ceramic Bowl */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.14, 0.32, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.35} color={activePotColor} />
        </mesh>
        <mesh position={[0, 0.31, 0]}>
          <cylinderGeometry args={[0.21, 0.21, 0.02, 32]} />
          <meshStandardMaterial map={soilTex} color="#291f17" />
        </mesh>
        {/* Cascading Strings with Succulent Pea Pearls */}
        {[0.2, 1.0, 1.8, 2.6, 3.4, 4.2, 5.0, 5.8].map((angle, sIdx) => {
          const strandLen = 0.35 + (sIdx % 4) * 0.15
          return (
            <group key={sIdx} rotation={[0, angle, 0]}>
              {Array.from({ length: 8 }).map((_, pIdx) => {
                const frac = (pIdx + 1) / 8
                const px = 0.16 + frac * 0.08
                const py = 0.3 - frac * strandLen
                return (
                  <mesh key={pIdx} position={[px, py, 0]} castShadow>
                    <sphereGeometry args={[0.024, 8, 8]} />
                    <meshPhysicalMaterial
                      color="#4d8243"
                      roughness={0.2}
                      clearcoat={0.6}
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

  // Default: Lush Monstera Deliciosa (or standard fallback)
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
