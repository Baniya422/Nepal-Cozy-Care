import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { getSurfaceTexture } from './materials'

interface RoomEnvironmentProps {
  width: number
  depth: number
  wallColor: string
  floorColor: string
  roomType?: string
}

export default function RoomEnvironment({ width, depth, wallColor, floorColor, roomType }: RoomEnvironmentProps) {
  const woodTex = useMemo(() => getSurfaceTexture('wood'), [])
  const plasterTex = useMemo(() => getSurfaceTexture('plaster'), [])
  const rugTex = useMemo(() => getSurfaceTexture('rug'), [])
  const ceramicTex = useMemo(() => getSurfaceTexture('ceramic'), [])

  const isBalcony = roomType === 'balcony'
  const windowWidth = Math.min(width * 0.45, 2.8)
  const windowHeight = 1.7
  const windowY = 1.65
  const windowX = width * 0.15
  const wallHeight = 3.2

  // Individual floorboard plank generation for realistic floor surface
  const plankCount = Math.max(12, Math.ceil(width / 0.28))
  const plankWidth = width / plankCount

  if (isBalcony) {
    const railingHeight = 1.15
    return (
      <group>
        {/* 1. Outdoor Decking Planks */}
        <group position={[0, 0.005, 0]}>
          {Array.from({ length: plankCount }).map((_, i) => {
            const posX = -width / 2 + plankWidth * 0.5 + i * plankWidth
            const roughnessOffset = (i % 3) * 0.04
            return (
              <mesh key={i} position={[posX, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[plankWidth - 0.008, depth]} />
                <meshStandardMaterial
                  map={woodTex}
                  bumpMap={woodTex}
                  bumpScale={0.012}
                  roughness={0.7 + roughnessOffset}
                  metalness={0.05}
                  color={floorColor}
                />
              </mesh>
            )
          })}
        </group>

        {/* 2. Sub-floor concrete slab */}
        <mesh position={[0, -0.05, 0]} receiveShadow>
          <boxGeometry args={[width + 0.3, 0.1, depth + 0.3]} />
          <meshStandardMaterial color="#474440" roughness={0.8} />
        </mesh>

        {/* 3. Exterior Building Wall (Left side) */}
        <mesh position={[-width / 2, wallHeight / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.16, wallHeight, depth]} />
          <meshStandardMaterial map={plasterTex} color={wallColor} roughness={0.9} />
        </mesh>

        {/* Sliding Glass Patio Door on Left Wall */}
        <group position={[-width / 2 + 0.1, 1.4, 0]} rotation={[0, Math.PI / 2, 0]}>
          {/* Anthracite Frame */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[depth * 0.75, 2.6, 0.08]} />
            <meshStandardMaterial color="#1e2421" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Glass Pane */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[depth * 0.7, 2.45]} />
            <meshPhysicalMaterial color="#c8e8f8" transmission={0.9} transparent opacity={0.4} roughness={0.05} />
          </mesh>
        </group>

        {/* 4. Open Scenic Mountain & Sky Horizon Backdrop */}
        <mesh position={[0, 3, -depth / 2 - 3]}>
          <planeGeometry args={[width * 3.5, 9]} />
          <meshBasicMaterial color="#a7d8e8" />
        </mesh>
        {/* Distant Hills Silhouette */}
        <mesh position={[0, 1.5, -depth / 2 - 2.8]}>
          <planeGeometry args={[width * 3.2, 4.5]} />
          <meshBasicMaterial color="#689868" />
        </mesh>
        <mesh position={[width * 0.4, 1.0, -depth / 2 - 2.5]}>
          <planeGeometry args={[width * 3.0, 3.2]} />
          <meshBasicMaterial color="#42734a" />
        </mesh>

        {/* 5. Modern Balcony Railing (Back Edge) */}
        <group position={[0, 0, -depth / 2]}>
          {/* Top Handrail */}
          <mesh position={[0, railingHeight, 0]} castShadow>
            <boxGeometry args={[width, 0.05, 0.08]} />
            <meshStandardMaterial color="#1e2421" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Bottom Rail */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[width, 0.04, 0.04]} />
            <meshStandardMaterial color="#1e2421" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Stanchions (Vertical Posts) */}
          {Array.from({ length: 6 }).map((_, idx) => {
            const px = -width / 2 + 0.1 + (idx * (width - 0.2)) / 5
            return (
              <mesh key={`post_${idx}`} position={[px, railingHeight / 2, 0]} castShadow>
                <boxGeometry args={[0.045, railingHeight, 0.045]} />
                <meshStandardMaterial color="#1e2421" metalness={0.85} roughness={0.25} />
              </mesh>
            )
          })}
          {/* Safety Glass Balustrade Inset */}
          <mesh position={[0, railingHeight / 2, 0]}>
            <planeGeometry args={[width - 0.1, railingHeight - 0.12]} />
            <meshPhysicalMaterial
              color="#eaf4f8"
              transmission={0.92}
              opacity={0.3}
              transparent
              roughness={0.08}
              ior={1.45}
            />
          </mesh>
        </group>

        {/* 6. Modern Balcony Railing (Right Edge) */}
        <group position={[width / 2, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          {/* Top Handrail */}
          <mesh position={[0, railingHeight, 0]} castShadow>
            <boxGeometry args={[depth, 0.05, 0.08]} />
            <meshStandardMaterial color="#1e2421" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Bottom Rail */}
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[depth, 0.04, 0.04]} />
            <meshStandardMaterial color="#1e2421" metalness={0.85} roughness={0.25} />
          </mesh>
          {/* Stanchions */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const pz = -depth / 2 + 0.1 + (idx * (depth - 0.2)) / 4
            return (
              <mesh key={`rpost_${idx}`} position={[pz, railingHeight / 2, 0]} castShadow>
                <boxGeometry args={[0.045, railingHeight, 0.045]} />
                <meshStandardMaterial color="#1e2421" metalness={0.85} roughness={0.25} />
              </mesh>
            )
          })}
          {/* Safety Glass Balustrade Inset */}
          <mesh position={[0, railingHeight / 2, 0]}>
            <planeGeometry args={[depth - 0.1, railingHeight - 0.12]} />
            <meshPhysicalMaterial
              color="#eaf4f8"
              transmission={0.92}
              opacity={0.3}
              transparent
              roughness={0.08}
              ior={1.45}
            />
          </mesh>
        </group>
      </group>
    )
  }

  return (
    <group>
      {/* 1. Realistic Hardwood Floorboards */}
      <group position={[0, 0.005, 0]}>
        {Array.from({ length: plankCount }).map((_, i) => {
          const posX = -width / 2 + plankWidth * 0.5 + i * plankWidth
          const roughnessOffset = (i % 3) * 0.04
          return (
            <mesh key={i} position={[posX, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
              <planeGeometry args={[plankWidth - 0.004, depth]} />
              <meshStandardMaterial
                map={woodTex}
                bumpMap={woodTex}
                bumpScale={0.008}
                roughness={0.65 + roughnessOffset}
                metalness={0.02}
                color={floorColor}
              />
            </mesh>
          )
        })}
      </group>

      {/* 2. Sub-floor base */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width + 0.2, depth + 0.2]} />
        <meshStandardMaterial color="#2d251e" roughness={0.9} />
      </mesh>

      {/* 3. Baseboards along walls */}
      <mesh position={[0, 0.07, -depth / 2 + 0.025]} castShadow>
        <boxGeometry args={[width, 0.14, 0.03]} />
        <meshStandardMaterial color="#f0ece1" roughness={0.4} />
      </mesh>
      <mesh position={[-width / 2 + 0.025, 0.07, 0]} castShadow>
        <boxGeometry args={[0.03, 0.14, depth]} />
        <meshStandardMaterial color="#f0ece1" roughness={0.4} />
      </mesh>

      {/* 4. Crown Molding along ceiling line */}
      <mesh position={[0, wallHeight - 0.05, -depth / 2 + 0.03]} castShadow>
        <boxGeometry args={[width, 0.1, 0.04]} />
        <meshStandardMaterial color="#f5f2e9" roughness={0.5} />
      </mesh>
      <mesh position={[-width / 2 + 0.03, wallHeight - 0.05, 0]} castShadow>
        <boxGeometry args={[0.04, 0.1, depth]} />
        <meshStandardMaterial color="#f5f2e9" roughness={0.5} />
      </mesh>

      {/* 5. Left Solid Wall */}
      <mesh position={[-width / 2, wallHeight / 2, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.12, wallHeight, depth]} />
        <meshStandardMaterial
          map={plasterTex}
          bumpMap={plasterTex}
          bumpScale={0.004}
          color={wallColor}
          roughness={0.92}
        />
      </mesh>

      {/* 6. Back Wall Sections (with clean cut-out for window) */}
      {/* Left section of back wall */}
      {(() => {
        const leftW = windowX - windowWidth / 2 - -width / 2
        return leftW > 0 ? (
          <mesh position={[-width / 2 + leftW / 2, wallHeight / 2, -depth / 2]} receiveShadow castShadow>
            <boxGeometry args={[leftW, wallHeight, 0.12]} />
            <meshStandardMaterial
              map={plasterTex}
              bumpMap={plasterTex}
              bumpScale={0.004}
              color={wallColor}
              roughness={0.92}
            />
          </mesh>
        ) : null
      })()}

      {/* Right section of back wall */}
      {(() => {
        const rightEdge = windowX + windowWidth / 2
        const rightW = width / 2 - rightEdge
        return rightW > 0 ? (
          <mesh position={[rightEdge + rightW / 2, wallHeight / 2, -depth / 2]} receiveShadow castShadow>
            <boxGeometry args={[rightW, wallHeight, 0.12]} />
            <meshStandardMaterial
              map={plasterTex}
              bumpMap={plasterTex}
              bumpScale={0.004}
              color={wallColor}
              roughness={0.92}
            />
          </mesh>
        ) : null
      })()}

      {/* Wall below window (sill apron) */}
      {(() => {
        const sillH = windowY - windowHeight / 2
        return (
          <mesh position={[windowX, sillH / 2, -depth / 2]} receiveShadow castShadow>
            <boxGeometry args={[windowWidth, sillH, 0.12]} />
            <meshStandardMaterial
              map={plasterTex}
              bumpMap={plasterTex}
              bumpScale={0.004}
              color={wallColor}
              roughness={0.92}
            />
          </mesh>
        )
      })()}

      {/* Wall above window (header) */}
      {(() => {
        const headerTop = wallHeight
        const headerBottom = windowY + windowHeight / 2
        const headerH = headerTop - headerBottom
        return headerH > 0 ? (
          <mesh position={[windowX, headerBottom + headerH / 2, -depth / 2]} receiveShadow castShadow>
            <boxGeometry args={[windowWidth, headerH, 0.12]} />
            <meshStandardMaterial
              map={plasterTex}
              bumpMap={plasterTex}
              bumpScale={0.004}
              color={wallColor}
              roughness={0.92}
            />
          </mesh>
        ) : null
      })()}

      {/* 7. Architectural Window Assembly */}
      <group position={[windowX, windowY, -depth / 2]}>
        {/* Exterior Scenic Mountain/Garden Panorama Backdrop */}
        <mesh position={[0, 0, -0.45]}>
          <planeGeometry args={[windowWidth * 1.35, windowHeight * 1.35]} />
          <meshBasicMaterial color="#b2dce6" />
        </mesh>
        {/* Distant rolling green hills silhouette */}
        <mesh position={[0, -windowHeight * 0.18, -0.42]}>
          <planeGeometry args={[windowWidth * 1.3, windowHeight * 0.7]} />
          <meshBasicMaterial color="#78a876" />
        </mesh>
        <mesh position={[0.3, -windowHeight * 0.28, -0.4]}>
          <planeGeometry args={[windowWidth * 1.25, windowHeight * 0.5]} />
          <meshBasicMaterial color="#4d7e50" />
        </mesh>

        {/* Window Glass Pane */}
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[windowWidth - 0.04, windowHeight - 0.04]} />
          <meshPhysicalMaterial
            color="#e3f4f8"
            transmission={0.88}
            opacity={0.35}
            transparent
            roughness={0.06}
            ior={1.45}
          />
        </mesh>

        {/* Window Sill / Ledge */}
        <mesh position={[0, -windowHeight / 2 - 0.02, 0.09]} castShadow>
          <boxGeometry args={[windowWidth + 0.12, 0.06, 0.22]} />
          <meshStandardMaterial color="#f7f4ea" roughness={0.35} />
        </mesh>

        {/* Outer Frame */}
        {[-1, 1].map((side) => (
          <mesh key={`vf${side}`} position={[side * (windowWidth / 2 - 0.02), 0, 0.06]} castShadow>
            <boxGeometry args={[0.045, windowHeight, 0.1]} />
            <meshStandardMaterial color="#ede7d8" roughness={0.4} />
          </mesh>
        ))}
        {[-1, 1].map((side) => (
          <mesh key={`hf${side}`} position={[0, side * (windowHeight / 2 - 0.02), 0.06]} castShadow>
            <boxGeometry args={[windowWidth, 0.045, 0.1]} />
            <meshStandardMaterial color="#ede7d8" roughness={0.4} />
          </mesh>
        ))}

        {/* Central Vertical Mullion & Horizontal Transom */}
        <mesh position={[0, 0, 0.06]} castShadow>
          <boxGeometry args={[0.04, windowHeight, 0.08]} />
          <meshStandardMaterial color="#ede7d8" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.06]} castShadow>
          <boxGeometry args={[windowWidth, 0.035, 0.08]} />
          <meshStandardMaterial color="#ede7d8" roughness={0.4} />
        </mesh>
      </group>

      {/* 8. Wall Architectural Elements (Art or Shower/Backsplash) */}
      {roomType === 'bathroom' ? (
        <>
          {/* Calacatta Marble Accent Slab on Back Wall (From Reference Photo) */}
          <group position={[0, wallHeight * 0.48, -depth / 2 + 0.04]}>
            <RoundedBox args={[2.2, 2.5, 0.02]} radius={0.02} receiveShadow>
              <meshStandardMaterial
                map={ceramicTex}
                bumpMap={ceramicTex}
                bumpScale={0.005}
                color="#f8faf9"
                roughness={0.15}
              />
            </RoundedBox>
            {/* Brass Inset Perimeter Trim */}
            <mesh position={[0, 0, 0.012]}>
              <boxGeometry args={[2.24, 2.54, 0.01]} />
              <meshStandardMaterial color="#cfa860" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>

          {/* Walk-In Glass Shower Enclosure on Left Wall (From Reference Photo) */}
          <group position={[-width / 2 + 0.75, 1.25, -depth * 0.22]}>
            {/* Clear Frameless Glass Panel */}
            <mesh position={[0, 0, 0]} castShadow>
              <boxGeometry args={[0.02, 2.5, 1.4]} />
              <meshPhysicalMaterial
                color="#eaf4f8"
                transmission={0.92}
                transparent
                opacity={0.3}
                roughness={0.05}
                ior={1.45}
              />
            </mesh>
            {/* Brass Door Hinges & Handle */}
            <mesh position={[0.02, 0, 0.2]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.35, 12]} />
              <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
            </mesh>
            {/* Wall Showerhead Assembly */}
            <group position={[-0.72, 0.9, -0.2]}>
              <mesh position={[0.15, 0, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow>
                <cylinderGeometry args={[0.012, 0.012, 0.3, 12]} />
                <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
              </mesh>
              <mesh position={[0.3, -0.05, 0]} rotation={[0, 0, 0.3]} castShadow>
                <cylinderGeometry args={[0.08, 0.04, 0.06, 20]} />
                <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
              </mesh>
            </group>
          </group>
        </>
      ) : roomType === 'kitchen' ? (
        <>
          {/* Kitchen Tile Backsplash Band across back wall */}
          <mesh position={[0, 1.3, -depth / 2 + 0.04]} receiveShadow>
            <boxGeometry args={[width, 1.2, 0.02]} />
            <meshStandardMaterial
              map={ceramicTex}
              bumpMap={ceramicTex}
              bumpScale={0.008}
              color="#fcfbf7"
              roughness={0.2}
            />
          </mesh>
        </>
      ) : (
        /* Framed Wall Art Print on Left Wall */
        <group position={[-width / 2 + 0.08, 1.8, -depth * 0.1]} rotation={[0, Math.PI / 2, 0]}>
          <RoundedBox args={[1.3, 0.92, 0.04]} radius={0.015} castShadow>
            <meshStandardMaterial map={woodTex} color="#b8936d" roughness={0.5} />
          </RoundedBox>
          <mesh position={[0, 0, 0.022]}>
            <planeGeometry args={[1.2, 0.82]} />
            <meshStandardMaterial color="#fdfbf7" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0, 0.025]}>
            <planeGeometry args={[1.05, 0.68]} />
            <meshStandardMaterial color="#4a6854" roughness={0.8} />
          </mesh>
          <mesh position={[-0.15, 0.05, 0.028]}>
            <circleGeometry args={[0.18, 32]} />
            <meshStandardMaterial color="#d4b47a" roughness={0.7} />
          </mesh>
        </group>
      )}

      {/* 9. Woven Area Rug / Bath Mat */}
      <mesh position={[0, 0.018, depth * 0.06]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry
          args={[
            roomType === 'bathroom' ? 1.6 : Math.min(width * 0.65, 3.4),
            roomType === 'bathroom' ? 1.1 : Math.min(depth * 0.6, 2.5),
          ]}
        />
        <meshStandardMaterial
          map={rugTex}
          bumpMap={rugTex}
          bumpScale={0.015}
          color={roomType === 'bathroom' ? '#c2a585' : '#ded3c1'}
          roughness={0.98}
        />
      </mesh>

      {/* 10. Modern Pendant Light Fixture */}
      <group position={[0, wallHeight - 0.02, 0]}>
        {/* Ceiling Canopy */}
        <mesh position={[0, 0, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.07, 0.03, 24]} />
          <meshStandardMaterial map={ceramicTex} color="#2b2d2f" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Cord */}
        <mesh position={[0, -0.45, 0]} castShadow>
          <cylinderGeometry args={[0.005, 0.005, 0.9, 12]} />
          <meshStandardMaterial color="#1a1c1d" roughness={0.8} />
        </mesh>
        {/* Brass Shade Hood / Chandelier */}
        <mesh position={[0, -0.95, 0]} rotation={[Math.PI, 0, 0]} castShadow>
          <coneGeometry args={[0.34, 0.28, 32, 1, true]} />
          <meshStandardMaterial
            color="#c99c54"
            metalness={0.85}
            roughness={0.25}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Warm Bulb */}
        <mesh position={[0, -0.98, 0]}>
          <sphereGeometry args={[0.065, 16, 16]} />
          <meshStandardMaterial emissive="#ffe2b0" emissiveIntensity={2.5} color="#fff1d6" />
        </mesh>
        {/* Point light providing warm indoor pool */}
        <pointLight position={[0, -1.02, 0]} intensity={1.5} distance={6} color="#ffe5b8" castShadow />
      </group>
    </group>
  )
}
