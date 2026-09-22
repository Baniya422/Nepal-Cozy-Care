import { useMemo } from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { getSurfaceTexture } from './materials'

interface FurnitureProps {
  kind:
    | 'sofa'
    | 'table'
    | 'chair'
    | 'shelf'
    | 'bed'
    | 'desk'
    | 'nightstand'
    | 'bathtub'
    | 'vanity'
    | 'kitchen_island'
    | 'counter'
    | 'stool'
    | string
  color: string
  scale?: number
}

export default function Furniture({ kind, color }: FurnitureProps) {
  const fabricTex = useMemo(() => getSurfaceTexture('fabric'), [])
  const woodTex = useMemo(() => getSurfaceTexture('wood'), [])
  const ceramicTex = useMemo(() => getSurfaceTexture('ceramic'), [])
  const leafTex = useMemo(() => getSurfaceTexture('leaf'), [])

  if (kind === 'sofa') {
    return (
      <group>
        {/* Under-frame Base Board */}
        <RoundedBox args={[2.3, 0.16, 0.96]} radius={0.04} position={[0, 0.22, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color="#453327" roughness={0.65} />
        </RoundedBox>

        {/* 4 Angled Wooden Legs with Brass Ferrules */}
        {[
          [-1.02, -0.38],
          [1.02, -0.38],
          [-1.02, 0.38],
          [1.02, 0.38],
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 0.1, lz]} rotation={[lz > 0 ? 0.08 : -0.08, 0, lx > 0 ? -0.08 : 0.08]}>
            {/* Wooden Upper Leg */}
            <mesh position={[0, 0.04, 0]} castShadow>
              <cylinderGeometry args={[0.032, 0.022, 0.14, 16]} />
              <meshStandardMaterial map={woodTex} color="#38291f" roughness={0.6} />
            </mesh>
            {/* Brass Cap */}
            <mesh position={[0, -0.045, 0]} castShadow>
              <cylinderGeometry args={[0.023, 0.02, 0.04, 16]} />
              <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        ))}

        {/* Deep Seat Cushion Base */}
        <RoundedBox args={[2.32, 0.28, 0.94]} radius={0.08} position={[0, 0.44, 0.02]} castShadow receiveShadow>
          <meshStandardMaterial
            map={fabricTex}
            bumpMap={fabricTex}
            bumpScale={0.008}
            color={color}
            roughness={0.92}
          />
        </RoundedBox>

        {/* 2 Plump Seat Cushions */}
        {[-0.56, 0.56].map((x) => (
          <RoundedBox
            key={`seat_${x}`}
            args={[1.06, 0.18, 0.8]}
            radius={0.08}
            position={[x, 0.62, 0.04]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={fabricTex}
              bumpMap={fabricTex}
              bumpScale={0.009}
              color={color}
              roughness={0.94}
            />
          </RoundedBox>
        ))}

        {/* 2 Ergonomic Backrest Cushions with slight recline */}
        {[-0.56, 0.56].map((x) => (
          <RoundedBox
            key={`back_${x}`}
            args={[1.06, 0.58, 0.24]}
            radius={0.09}
            position={[x, 0.94, -0.3]}
            rotation={[-0.12, 0, 0]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={fabricTex}
              bumpMap={fabricTex}
              bumpScale={0.009}
              color={color}
              roughness={0.94}
            />
          </RoundedBox>
        ))}

        {/* Slender Rounded Track Armrests */}
        {[-1.12, 1.12].map((x) => (
          <RoundedBox
            key={`arm_${x}`}
            args={[0.18, 0.52, 0.96]}
            radius={0.07}
            position={[x, 0.64, 0.02]}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              map={fabricTex}
              bumpMap={fabricTex}
              bumpScale={0.008}
              color={color}
              roughness={0.92}
            />
          </RoundedBox>
        ))}

        {/* Decorative Throw Pillow */}
        <RoundedBox
          args={[0.42, 0.42, 0.14]}
          radius={0.06}
          position={[-0.88, 0.72, -0.16]}
          rotation={[0.1, 0.35, -0.15]}
          castShadow
        >
          <meshStandardMaterial
            map={fabricTex}
            bumpMap={fabricTex}
            bumpScale={0.01}
            color="#cf8544"
            roughness={0.95}
          />
        </RoundedBox>
      </group>
    )
  }

  if (kind === 'table') {
    return (
      <group>
        {/* Solid Hardwood Beveled Tabletop */}
        <RoundedBox args={[1.45, 0.07, 0.82]} radius={0.03} position={[0, 0.48, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={woodTex}
            bumpMap={woodTex}
            bumpScale={0.006}
            color={color}
            roughness={0.35}
            clearcoat={0.3}
            clearcoatRoughness={0.2}
          />
        </RoundedBox>

        {/* Lower Magazine / Book Shelf */}
        <RoundedBox args={[1.2, 0.025, 0.62]} radius={0.01} position={[0, 0.22, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color={color} roughness={0.5} />
        </RoundedBox>

        {/* 4 Tapered Mid-Century Wooden Legs */}
        {[
          [-0.58, -0.3],
          [0.58, -0.3],
          [-0.58, 0.3],
          [0.58, 0.3],
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 0.24, lz]} rotation={[lz > 0 ? 0.06 : -0.06, 0, lx > 0 ? -0.06 : 0.06]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.032, 0.02, 0.48, 16]} />
              <meshStandardMaterial map={woodTex} color="#35261c" roughness={0.5} />
            </mesh>
            {/* Brass tip */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <cylinderGeometry args={[0.021, 0.018, 0.04, 16]} />
              <meshStandardMaterial color="#cfa860" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Tabletop Decor: Hardcover Art Book */}
        <group position={[-0.24, 0.53, 0.06]} rotation={[0, 0.15, 0]}>
          <RoundedBox args={[0.32, 0.035, 0.24]} radius={0.008} castShadow>
            <meshStandardMaterial map={fabricTex} color="#2b4736" roughness={0.8} />
          </RoundedBox>
          <mesh position={[0, 0.02, 0]}>
            <planeGeometry args={[0.3, 0.22]} />
            <meshStandardMaterial color="#e8dcc8" roughness={0.9} />
          </mesh>
        </group>

        {/* Tabletop Decor: Small Succulent Ceramic Bowl */}
        <group position={[0.26, 0.52, -0.08]}>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.05, 0.07, 24]} />
            <meshStandardMaterial map={ceramicTex} color="#f2eee6" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.075, 0]}>
            <sphereGeometry args={[0.06, 12, 12]} />
            <meshStandardMaterial map={leafTex} color="#587e4a" roughness={0.6} />
          </mesh>
        </group>
      </group>
    )
  }

  if (kind === 'chair') {
    return (
      <group>
        {/* Sculpted Upholstered Seat */}
        <RoundedBox args={[0.78, 0.16, 0.76]} radius={0.07} position={[0, 0.44, 0]} castShadow receiveShadow>
          <meshStandardMaterial
            map={fabricTex}
            bumpMap={fabricTex}
            bumpScale={0.008}
            color={color}
            roughness={0.92}
          />
        </RoundedBox>

        {/* Curved Wrap-Around Backrest */}
        <RoundedBox
          args={[0.76, 0.48, 0.18]}
          radius={0.08}
          position={[0, 0.72, -0.28]}
          rotation={[-0.1, 0, 0]}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial
            map={fabricTex}
            bumpMap={fabricTex}
            bumpScale={0.008}
            color={color}
            roughness={0.92}
          />
        </RoundedBox>

        {/* Side Cushion Bolsters */}
        {[-0.34, 0.34].map((x) => (
          <RoundedBox
            key={`chair_bolster_${x}`}
            args={[0.12, 0.32, 0.62]}
            radius={0.05}
            position={[x, 0.58, -0.04]}
            castShadow
          >
            <meshStandardMaterial
              map={fabricTex}
              bumpMap={fabricTex}
              bumpScale={0.008}
              color={color}
              roughness={0.92}
            />
          </RoundedBox>
        ))}

        {/* Splayed Wooden Legs */}
        {[
          [-0.3, -0.26],
          [0.3, -0.26],
          [-0.3, 0.26],
          [0.3, 0.26],
        ].map(([lx, lz], idx) => (
          <group key={idx} position={[lx, 0.18, lz]} rotation={[lz > 0 ? 0.12 : -0.12, 0, lx > 0 ? -0.12 : 0.12]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.028, 0.018, 0.36, 14]} />
              <meshStandardMaterial map={woodTex} color="#3d2c20" roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.16, 0]} castShadow>
              <cylinderGeometry args={[0.019, 0.016, 0.04, 14]} />
              <meshStandardMaterial color="#cba158" metalness={0.8} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>
    )
  }

  if (kind === 'bed') {
    return (
      <group>
        {/* Tall Upholstered / Hardwood Headboard */}
        <RoundedBox args={[2.1, 1.15, 0.12]} radius={0.05} position={[0, 0.75, -1.02]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color="#3d2c20" roughness={0.65} />
        </RoundedBox>

        {/* Headboard Soft Inset Fabric Cushion */}
        <RoundedBox args={[1.92, 0.85, 0.08]} radius={0.04} position={[0, 0.82, -0.96]} castShadow receiveShadow>
          <meshStandardMaterial map={fabricTex} color={color} roughness={0.92} />
        </RoundedBox>

        {/* Wooden Bed Frame Base */}
        <RoundedBox args={[2.08, 0.24, 2.08]} radius={0.03} position={[0, 0.2, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color="#3d2c20" roughness={0.65} />
        </RoundedBox>

        {/* 4 Wooden Feet */}
        {[
          [-0.95, -0.95],
          [0.95, -0.95],
          [-0.95, 0.95],
          [0.95, 0.95],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.05, lz]} castShadow>
            <cylinderGeometry args={[0.04, 0.03, 0.1, 16]} />
            <meshStandardMaterial color="#2b1e15" roughness={0.7} />
          </mesh>
        ))}

        {/* Plush Mattress */}
        <RoundedBox args={[1.92, 0.28, 1.94]} radius={0.06} position={[0, 0.42, 0.02]} castShadow receiveShadow>
          <meshStandardMaterial map={fabricTex} color="#faf7f2" roughness={0.9} />
        </RoundedBox>

        {/* Comforter / Duvet covering lower 70% of bed */}
        <RoundedBox args={[1.94, 0.16, 1.38]} radius={0.06} position={[0, 0.52, 0.3]} castShadow receiveShadow>
          <meshStandardMaterial map={fabricTex} color={color} roughness={0.94} />
        </RoundedBox>

        {/* Duvet folded top hem */}
        <RoundedBox args={[1.92, 0.1, 0.22]} radius={0.04} position={[0, 0.55, -0.42]} castShadow>
          <meshStandardMaterial map={fabricTex} color="#f0ece1" roughness={0.92} />
        </RoundedBox>

        {/* 2 Propped Pillows near headboard */}
        {[-0.52, 0.52].map((px) => (
          <RoundedBox
            key={`pillow_${px}`}
            args={[0.68, 0.22, 0.42]}
            radius={0.07}
            position={[px, 0.62, -0.68]}
            rotation={[-0.2, 0, 0]}
            castShadow
          >
            <meshStandardMaterial map={fabricTex} color="#ffffff" roughness={0.95} />
          </RoundedBox>
        ))}

        {/* Folded Throw Blanket across foot of bed */}
        <RoundedBox args={[1.96, 0.04, 0.45]} radius={0.02} position={[0, 0.59, 0.68]} castShadow>
          <meshStandardMaterial map={fabricTex} color="#85634b" roughness={0.95} />
        </RoundedBox>
      </group>
    )
  }

  if (kind === 'desk') {
    return (
      <group>
        {/* Solid Hardwood Desktop */}
        <RoundedBox args={[1.6, 0.05, 0.82]} radius={0.02} position={[0, 0.74, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={woodTex}
            color={color}
            roughness={0.4}
            clearcoat={0.2}
          />
        </RoundedBox>

        {/* Minimalist Steel Leg Frames (A-Frame / Loop Style) */}
        {[-0.72, 0.72].map((lx) => (
          <group key={`desk_leg_${lx}`} position={[lx, 0.36, 0]}>
            {/* Left & Right Vertical Bars */}
            <mesh position={[0, 0, -0.36]} castShadow>
              <boxGeometry args={[0.04, 0.72, 0.04]} />
              <meshStandardMaterial color="#1e2421" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.36]} castShadow>
              <boxGeometry args={[0.04, 0.72, 0.04]} />
              <meshStandardMaterial color="#1e2421" metalness={0.8} roughness={0.3} />
            </mesh>
            {/* Bottom Sled Runner */}
            <mesh position={[0, -0.35, 0]} castShadow>
              <boxGeometry args={[0.04, 0.03, 0.76]} />
              <meshStandardMaterial color="#1e2421" metalness={0.8} roughness={0.3} />
            </mesh>
          </group>
        ))}

        {/* Office Laptop with keyboard & glowing display */}
        <group position={[0, 0.77, -0.05]}>
          {/* Base */}
          <mesh castShadow position={[0, 0.006, 0]}>
            <boxGeometry args={[0.34, 0.012, 0.24]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Keyboard Track */}
          <mesh position={[0, 0.013, 0.03]}>
            <planeGeometry args={[0.28, 0.12]} />
            <meshStandardMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          {/* Angled Screen */}
          <group position={[0, 0.012, -0.11]} rotation={[-0.35, 0, 0]}>
            <mesh position={[0, 0.11, 0]} castShadow>
              <boxGeometry args={[0.34, 0.22, 0.008]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.9} roughness={0.2} />
            </mesh>
            {/* Screen Glass Glow */}
            <mesh position={[0, 0.11, 0.005]}>
              <planeGeometry args={[0.32, 0.2]} />
              <meshBasicMaterial color="#e0f2fe" />
            </mesh>
          </group>
        </group>

        {/* Ceramic Coffee Mug */}
        <group position={[0.45, 0.77, 0.18]}>
          <mesh position={[0, 0.045, 0]} castShadow>
            <cylinderGeometry args={[0.042, 0.035, 0.09, 20]} />
            <meshStandardMaterial map={ceramicTex} color="#f8fafc" roughness={0.3} />
          </mesh>
        </group>

        {/* Desk Pad / Blotter */}
        <mesh position={[-0.05, 0.766, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.85, 0.45]} />
          <meshStandardMaterial map={fabricTex} color="#334155" roughness={0.9} />
        </mesh>
      </group>
    )
  }

  if (kind === 'nightstand') {
    return (
      <group>
        {/* Table Body with Drawer */}
        <RoundedBox args={[0.55, 0.52, 0.48]} radius={0.02} position={[0, 0.44, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color={color} roughness={0.6} />
        </RoundedBox>

        {/* Drawer Inset Groove */}
        <mesh position={[0, 0.52, 0.242]}>
          <planeGeometry args={[0.48, 0.2]} />
          <meshStandardMaterial map={woodTex} color="#2b1f17" roughness={0.6} />
        </mesh>

        {/* Brass Knob Pull */}
        <mesh position={[0, 0.52, 0.26]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.025, 16]} />
          <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* 4 Wooden Legs */}
        {[
          [-0.22, -0.18],
          [0.22, -0.18],
          [-0.22, 0.18],
          [0.22, 0.18],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.09, lz]} castShadow>
            <cylinderGeometry args={[0.022, 0.016, 0.18, 14]} />
            <meshStandardMaterial color="#2b1e15" roughness={0.7} />
          </mesh>
        ))}

        {/* Bedside Lamp with Warm Shade Glow */}
        <group position={[0, 0.7, 0]}>
          {/* Brass Lamp Base */}
          <mesh position={[0, 0.015, 0]} castShadow>
            <cylinderGeometry args={[0.07, 0.08, 0.03, 20]} />
            <meshStandardMaterial color="#cca258" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Stem */}
          <mesh position={[0, 0.14, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.24, 12]} />
            <meshStandardMaterial color="#cca258" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Tapered Linen Lamp Shade */}
          <mesh position={[0, 0.28, 0]} castShadow>
            <cylinderGeometry args={[0.09, 0.13, 0.16, 24, 1, true]} />
            <meshStandardMaterial map={fabricTex} color="#fffbeb" roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
          {/* Warm point light from inside lamp */}
          <pointLight position={[0, 0.26, 0]} color="#ffeed1" intensity={0.8} distance={2.5} />
        </group>
      </group>
    )
  }

  if (kind === 'bathtub') {
    return (
      <group>
        {/* Freestanding Modern Oval Soaking Bathtub Shell */}
        <RoundedBox args={[1.85, 0.62, 0.96]} radius={0.26} position={[0, 0.32, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={ceramicTex}
            color="#fafafa"
            roughness={0.12}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </RoundedBox>

        {/* Inner Water Surface */}
        <mesh position={[0, 0.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 0.68]} />
          <meshPhysicalMaterial
            color="#cae8f2"
            transmission={0.8}
            transparent
            opacity={0.7}
            roughness={0.05}
            ior={1.33}
          />
        </mesh>

        {/* Wooden Spa Bath Bridge / Caddy Tray */}
        <group position={[0.1, 0.64, 0]}>
          <RoundedBox args={[0.3, 0.03, 0.94]} radius={0.008} castShadow>
            <meshStandardMaterial map={woodTex} color="#63452f" roughness={0.5} />
          </RoundedBox>
          {/* Rolled White Spa Towel on tray */}
          <mesh position={[-0.04, 0.045, -0.22]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.16, 16]} />
            <meshStandardMaterial map={fabricTex} color="#ffffff" roughness={0.9} />
          </mesh>
          {/* Amber Candle Jar */}
          <mesh position={[0.02, 0.04, 0.2]} castShadow>
            <cylinderGeometry args={[0.035, 0.03, 0.06, 16]} />
            <meshStandardMaterial color="#c68a4c" roughness={0.2} transparent opacity={0.85} />
          </mesh>
        </group>

        {/* Freestanding Floor-Mounted Brass Tub Filler & Faucet */}
        <group position={[0.92, 0, 0]}>
          {/* Floor Escutcheon */}
          <mesh position={[0, 0.02, 0]} castShadow>
            <cylinderGeometry args={[0.08, 0.09, 0.04, 20]} />
            <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Vertical Riser Pipe */}
          <mesh position={[0, 0.48, 0]} castShadow>
            <cylinderGeometry args={[0.018, 0.018, 0.92, 16]} />
            <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Gooseneck Curved Spout arching into tub */}
          <mesh position={[-0.1, 0.94, 0]} rotation={[0, 0, Math.PI / 4]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.22, 14]} />
            <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Spout Tip */}
          <mesh position={[-0.18, 0.86, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.06, 14]} />
            <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.2} />
          </mesh>
          {/* Mixer Lever Handle */}
          <mesh position={[0, 0.76, 0.06]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.012, 0.012, 0.1, 12]} />
            <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.2} />
          </mesh>
        </group>
      </group>
    )
  }

  if (kind === 'vanity') {
    return (
      <group>
        {/* Floating Vanity Cabinet Body */}
        <RoundedBox args={[1.5, 0.58, 0.62]} radius={0.03} position={[0, 0.52, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color={color} roughness={0.6} />
        </RoundedBox>

        {/* 2 Drawer Inset Face Panels */}
        {[-0.37, 0.37].map((x) => (
          <group key={`vanity_drawer_${x}`} position={[x, 0.52, 0.315]}>
            <mesh>
              <planeGeometry args={[0.68, 0.48]} />
              <meshStandardMaterial map={woodTex} color={color} roughness={0.5} />
            </mesh>
            {/* Slim Brass Bar Pull Handle */}
            <mesh position={[0, 0.12, 0.02]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.008, 0.008, 0.18, 12]} />
              <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        ))}

        {/* Marble Countertop with Integrated Basin */}
        <RoundedBox args={[1.54, 0.06, 0.66]} radius={0.015} position={[0, 0.83, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={ceramicTex}
            color="#f5f7f6"
            roughness={0.2}
            clearcoat={0.6}
          />
        </RoundedBox>

        {/* Ceramic Sink Basin Recess */}
        <mesh position={[0, 0.835, 0]}>
          <boxGeometry args={[0.62, 0.01, 0.42]} />
          <meshStandardMaterial color="#e5ece8" roughness={0.3} />
        </mesh>

        {/* Brass Gooseneck Basin Faucet */}
        <group position={[0, 0.86, -0.16]}>
          <mesh position={[0, 0.06, 0]} castShadow>
            <cylinderGeometry args={[0.016, 0.02, 0.12, 14]} />
            <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.14, 0.04]} rotation={[-0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.014, 0.014, 0.1, 14]} />
            <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        {/* Wall Vanity Mirror with Backlit Soft Glow */}
        <group position={[0, 1.65, -0.28]}>
          {/* LED Glow backplate */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[1.25, 0.95]} />
            <meshBasicMaterial color="#fff4e0" />
          </mesh>
          <pointLight position={[0, 0, 0.1]} intensity={0.9} distance={2.5} color="#fff1db" />
          {/* Brass Mirror Outer Frame */}
          <RoundedBox args={[1.2, 0.9, 0.03]} radius={0.08} castShadow>
            <meshStandardMaterial color="#cca258" metalness={0.8} roughness={0.3} />
          </RoundedBox>
          {/* Reflective Mirror Glass */}
          <mesh position={[0, 0, 0.018]}>
            <planeGeometry args={[1.12, 0.82]} />
            <meshPhysicalMaterial
              color="#edf2f7"
              roughness={0.02}
              metalness={0.95}
              clearcoat={1}
            />
          </mesh>
        </group>

        {/* Glass Soap Dispenser on countertop */}
        <group position={[-0.48, 0.89, 0.08]}>
          <mesh position={[0, 0.04, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, 0.08, 16]} />
            <meshPhysicalMaterial color="#c2d5c8" roughness={0.2} transparent opacity={0.8} />
          </mesh>
          <mesh position={[0, 0.09, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.04, 12]} />
            <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      </group>
    )
  }

  if (kind === 'kitchen_island' || kind === 'counter') {
    return (
      <group>
        {/* Shaker Kitchen Cabinetry Body */}
        <RoundedBox args={[2.2, 0.86, 1.0]} radius={0.02} position={[0, 0.45, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color={color} roughness={0.65} />
        </RoundedBox>

        {/* Recessed Kickplate Base */}
        <mesh position={[0, 0.04, 0]} castShadow>
          <boxGeometry args={[2.14, 0.08, 0.92]} />
          <meshStandardMaterial color="#1e2220" roughness={0.8} />
        </mesh>

        {/* 3 Front Shaker Door Panels with Brass Bar Pulls */}
        {[-0.68, 0, 0.68].map((x) => (
          <group key={`kdoor_${x}`} position={[x, 0.47, 0.505]}>
            <mesh>
              <planeGeometry args={[0.62, 0.72]} />
              <meshStandardMaterial map={woodTex} color={color} roughness={0.6} />
            </mesh>
            {/* Brass Pull Handle */}
            <mesh position={[0.22, 0.12, 0.02]} rotation={[0, 0, 0]} castShadow>
              <cylinderGeometry args={[0.007, 0.007, 0.14, 12]} />
              <meshStandardMaterial color="#cfa860" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        ))}

        {/* Polished Quartz / Marble Waterfall Countertop */}
        <RoundedBox args={[2.28, 0.06, 1.08]} radius={0.012} position={[0, 0.91, 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            map={ceramicTex}
            color="#f4f4f2"
            roughness={0.25}
            clearcoat={0.6}
            clearcoatRoughness={0.15}
          />
        </RoundedBox>

        {/* Undermount Kitchen Sink Basin */}
        <group position={[0.55, 0.94, 0]}>
          <mesh position={[0, -0.01, 0]}>
            <boxGeometry args={[0.52, 0.02, 0.42]} />
            <meshStandardMaterial color="#475569" metalness={0.8} roughness={0.3} />
          </mesh>
          {/* High-Arc Commercial Spring Pull-Down Faucet */}
          <group position={[0, 0.02, -0.16]}>
            <mesh position={[0, 0.14, 0]} castShadow>
              <cylinderGeometry args={[0.016, 0.02, 0.28, 14]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
            </mesh>
            <mesh position={[0, 0.28, 0.06]} rotation={[-0.5, 0, 0]} castShadow>
              <cylinderGeometry args={[0.014, 0.014, 0.16, 14]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
            </mesh>
          </group>
        </group>

        {/* 4-Zone Induction Cooktop */}
        <group position={[-0.55, 0.945, 0]}>
          {/* Black Glass Plate */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.58, 0.008, 0.48]} />
            <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
          </mesh>
          {/* 4 Burner Rings */}
          {[
            [-0.15, -0.11],
            [0.15, -0.11],
            [-0.15, 0.11],
            [0.15, 0.11],
          ].map(([bx, bz], bidx) => (
            <mesh key={`burner_${bidx}`} position={[bx, 0.006, bz]} rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.06, 0.075, 24]} />
              <meshBasicMaterial color="#94a3b8" />
            </mesh>
          ))}
        </group>

        {/* Wooden Cutting Board with Fresh Kitchen Basil Pot */}
        <group position={[0, 0.95, 0.14]}>
          <RoundedBox args={[0.28, 0.02, 0.38]} radius={0.008} castShadow>
            <meshStandardMaterial map={woodTex} color="#7c5335" roughness={0.5} />
          </RoundedBox>
          {/* Small Terracotta Herb Pot */}
          <group position={[0.04, 0.02, 0]}>
            <mesh position={[0, 0.05, 0]} castShadow>
              <cylinderGeometry args={[0.055, 0.04, 0.09, 16]} />
              <meshStandardMaterial map={ceramicTex} color="#b86948" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.05, 12, 12]} />
              <meshStandardMaterial map={leafTex} color="#3d753b" roughness={0.5} />
            </mesh>
          </group>
        </group>
      </group>
    )
  }

  if (kind === 'stool') {
    return (
      <group>
        {/* Sculpted Barstool Seat Cushion */}
        <RoundedBox args={[0.44, 0.08, 0.4]} radius={0.03} position={[0, 0.65, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={fabricTex} color={color} roughness={0.88} />
        </RoundedBox>

        {/* Low Lumbar Back Rest */}
        <RoundedBox args={[0.38, 0.18, 0.06]} radius={0.02} position={[0, 0.77, -0.16]} castShadow>
          <meshStandardMaterial map={fabricTex} color={color} roughness={0.88} />
        </RoundedBox>

        {/* 4 Splayed Matte Black Steel Legs */}
        {[
          [-0.16, -0.14],
          [0.16, -0.14],
          [-0.16, 0.14],
          [0.16, 0.14],
        ].map(([lx, lz], idx) => (
          <mesh
            key={idx}
            position={[lx * 1.1, 0.31, lz * 1.1]}
            rotation={[lz > 0 ? 0.09 : -0.09, 0, lx > 0 ? -0.09 : 0.09]}
            castShadow
          >
            <cylinderGeometry args={[0.014, 0.01, 0.64, 12]} />
            <meshStandardMaterial color="#1e2421" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Circular Footrest Ring */}
        <mesh position={[0, 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.008, 12, 24]} />
          <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    )
  }

  if (kind === 'pot_terracotta') {
    return (
      <group>
        {/* Drainage Saucer */}
        <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.32, 0.28, 0.04, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.7} color={color || '#d48057'} />
        </mesh>
        {/* Tapered Terracotta Body */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.3, 0.21, 0.5, 32]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.75} color={color || '#d48057'} />
        </mesh>
        {/* Rolled Collar Rim */}
        <mesh position={[0, 0.52, 0]} castShadow>
          <torusGeometry args={[0.295, 0.025, 12, 36]} />
          <meshStandardMaterial map={ceramicTex} roughness={0.72} color={color || '#d48057'} />
        </mesh>
        {/* Soil Bed */}
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.28, 0.28, 0.02, 32]} />
          <meshStandardMaterial color="#2d2118" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  if (kind === 'pot_ceramic') {
    return (
      <group>
        {/* Brass Accent Base Tray */}
        <mesh position={[0, 0.015, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.03, 32]} />
          <meshStandardMaterial color="#cda45e" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Fluted Vertical Ceramic Cylinder */}
        <mesh position={[0, 0.32, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.25, 0.23, 0.58, 36]} />
          <meshPhysicalMaterial
            map={ceramicTex}
            color={color || '#f5f2eb'}
            roughness={0.25}
            clearcoat={0.6}
          />
        </mesh>
        {/* Soil Surface with decorative pebbles */}
        <mesh position={[0, 0.59, 0]}>
          <cylinderGeometry args={[0.235, 0.235, 0.02, 32]} />
          <meshStandardMaterial color="#382c23" roughness={0.9} />
        </mesh>
      </group>
    )
  }

  if (kind === 'pot_geometric') {
    return (
      <group>
        {/* Faceted Hexagonal Modern Planter */}
        <mesh position={[0, 0.28, 0]} rotation={[0, Math.PI / 6, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.28, 0.18, 0.54, 6]} />
          <meshStandardMaterial
            color={color || '#3d4841'}
            roughness={0.4}
            metalness={0.1}
          />
        </mesh>
        {/* Hexagonal Rim */}
        <mesh position={[0, 0.54, 0]} rotation={[0, Math.PI / 6, 0]} castShadow>
          <cylinderGeometry args={[0.29, 0.28, 0.03, 6]} />
          <meshStandardMaterial color="#cca258" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.52, 0]} rotation={[0, Math.PI / 6, 0]}>
          <cylinderGeometry args={[0.25, 0.25, 0.02, 6]} />
          <meshStandardMaterial color="#2c2017" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  if (kind === 'pot_hanging') {
    return (
      <group position={[0, 1.1, 0]}>
        {/* Ceiling Hook & Brass Ring */}
        <mesh position={[0, 0.9, 0]}>
          <torusGeometry args={[0.04, 0.008, 8, 20]} />
          <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* 3 Braided Macrame Cords */}
        {[0, 2.09, 4.18].map((angle, idx) => (
          <group key={idx} rotation={[0, angle, 0]}>
            <mesh position={[0.08, 0.45, 0]} rotation={[0, 0, -0.16]} castShadow>
              <cylinderGeometry args={[0.006, 0.006, 0.95, 8]} />
              <meshStandardMaterial color="#d4c7b2" roughness={0.9} />
            </mesh>
          </group>
        ))}
        {/* Hanging Ceramic Bowl */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.24, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
          <meshStandardMaterial map={ceramicTex} color={color || '#e8dfcf'} roughness={0.4} side={THREE.DoubleSide} />
        </mesh>
        {/* Bottom Macrame Tassel Fringe */}
        <mesh position={[0, -0.22, 0]} castShadow>
          <cylinderGeometry args={[0.02, 0.04, 0.16, 12]} />
          <meshStandardMaterial color="#d4c7b2" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  if (kind === 'pot_stand') {
    return (
      <group>
        {/* 4 Wooden Stand Legs */}
        {[
          [-0.19, -0.19],
          [0.19, -0.19],
          [-0.19, 0.19],
          [0.19, 0.19],
        ].map(([lx, lz], idx) => (
          <mesh key={idx} position={[lx, 0.35, lz]} castShadow>
            <cylinderGeometry args={[0.016, 0.016, 0.7, 14]} />
            <meshStandardMaterial map={woodTex} color="#543c2b" roughness={0.6} />
          </mesh>
        ))}
        {/* Wooden Cross Brace Bars */}
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.38, 0.03, 0.04]} />
          <meshStandardMaterial map={woodTex} color="#543c2b" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0.28, 0]} castShadow>
          <boxGeometry args={[0.04, 0.03, 0.38]} />
          <meshStandardMaterial map={woodTex} color="#543c2b" roughness={0.6} />
        </mesh>
        {/* Ceramic Planter seated in stand */}
        <mesh position={[0, 0.54, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.22, 0.21, 0.48, 32]} />
          <meshPhysicalMaterial
            map={ceramicTex}
            color={color || '#2c3e35'}
            roughness={0.3}
            clearcoat={0.5}
          />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <cylinderGeometry args={[0.205, 0.205, 0.02, 32]} />
          <meshStandardMaterial color="#2d2118" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  if (kind === 'pot_marble') {
    return (
      <group>
        {/* Solid Luxury White Marble Planter */}
        <mesh position={[0, 0.28, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.26, 0.26, 0.56, 36]} />
          <meshPhysicalMaterial
            map={ceramicTex}
            color="#fafafa"
            roughness={0.15}
            clearcoat={0.8}
            clearcoatRoughness={0.1}
          />
        </mesh>
        {/* Inset Gold Brass Accent Ring */}
        <mesh position={[0, 0.28, 0]}>
          <torusGeometry args={[0.262, 0.012, 12, 36]} />
          <meshStandardMaterial color="#cca258" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Soil Bed */}
        <mesh position={[0, 0.54, 0]}>
          <cylinderGeometry args={[0.245, 0.245, 0.02, 32]} />
          <meshStandardMaterial color="#2b1f16" roughness={0.95} />
        </mesh>
      </group>
    )
  }

  if (kind === 'decor_lamp') {
    return (
      <group>
        {/* Heavy Marble / Brass Floor Base */}
        <mesh position={[0, 0.03, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.24, 0.26, 0.06, 32]} />
          <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Sweeping Arc Brass Stem */}
        <mesh position={[-0.25, 1.15, 0]} rotation={[0, 0, -0.32]} castShadow>
          <cylinderGeometry args={[0.016, 0.018, 1.9, 14]} />
          <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[-0.45, 1.98, 0]} rotation={[0, 0, -1.2]} castShadow>
          <cylinderGeometry args={[0.014, 0.016, 0.65, 14]} />
          <meshStandardMaterial color="#cca258" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Spun Metal Lamp Dome Shade */}
        <group position={[-0.72, 1.82, 0]}>
          <mesh rotation={[Math.PI, 0, 0]} castShadow>
            <sphereGeometry args={[0.22, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshStandardMaterial color={color || '#cca258'} metalness={0.85} roughness={0.25} side={THREE.DoubleSide} />
          </mesh>
          {/* Glowing Bulb & Light */}
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color="#fffbe8" />
          </mesh>
          <pointLight color="#ffe8b8" intensity={1.4} distance={4} />
        </group>
      </group>
    )
  }

  if (kind === 'decor_rug') {
    return (
      <group position={[0, 0.005, 0]}>
        {/* Woven Wool Area Rug Plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[2.4, 1.6]} />
          <meshStandardMaterial
            map={fabricTex}
            bumpMap={fabricTex}
            bumpScale={0.015}
            color={color || '#e8decb'}
            roughness={0.96}
          />
        </mesh>
        {/* Fringed End Borders */}
        {[-1.2, 1.2].map((x, idx) => (
          <mesh key={idx} position={[x, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.06, 1.6]} />
            <meshStandardMaterial map={fabricTex} color="#d4c5ab" roughness={0.98} />
          </mesh>
        ))}
      </group>
    )
  }

  if (kind === 'decor_mirror') {
    return (
      <group>
        {/* Arched Gold Brass Frame */}
        <RoundedBox args={[0.85, 1.75, 0.04]} radius={0.12} position={[0, 0.9, 0]} rotation={[-0.08, 0, 0]} castShadow>
          <meshStandardMaterial color={color || '#cda45e'} metalness={0.85} roughness={0.25} />
        </RoundedBox>
        {/* Reflective Mirror Glass */}
        <mesh position={[0, 0.9, 0.023]} rotation={[-0.08, 0, 0]}>
          <planeGeometry args={[0.76, 1.65]} />
          <meshPhysicalMaterial
            color="#edf2f7"
            roughness={0.02}
            metalness={0.95}
            clearcoat={1}
          />
        </mesh>
        {/* Rear Kickstand Leg */}
        <mesh position={[0, 0.8, -0.3]} rotation={[0.25, 0, 0]} castShadow>
          <cylinderGeometry args={[0.014, 0.014, 1.4, 10]} />
          <meshStandardMaterial color="#2d3748" roughness={0.6} />
        </mesh>
      </group>
    )
  }

  if (kind === 'decor_shelf_hanging') {
    return (
      <group position={[0, 1.2, 0]}>
        {/* Wall Hanging Ring */}
        <mesh position={[0, 0.6, 0]}>
          <torusGeometry args={[0.035, 0.008, 8, 16]} />
          <meshStandardMaterial color="#2d3748" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* 2 Hanging Jute Ropes */}
        {[-0.32, 0.32].map((rx, idx) => (
          <mesh key={idx} position={[rx * 0.5, 0.3, 0]} rotation={[0, 0, rx > 0 ? -0.25 : 0.25]} castShadow>
            <cylinderGeometry args={[0.006, 0.006, 0.65, 8]} />
            <meshStandardMaterial color="#c29f6d" roughness={0.9} />
          </mesh>
        ))}
        {/* Pine Wood Plank Shelf */}
        <RoundedBox args={[0.75, 0.035, 0.28]} radius={0.008} position={[0, 0, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color={color || '#7c5335'} roughness={0.55} />
        </RoundedBox>
        {/* Mini Succulent on Shelf */}
        <group position={[0.18, 0.06, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.045, 0.035, 0.06, 16]} />
            <meshStandardMaterial map={ceramicTex} color="#fafafa" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.05, 0]}>
            <sphereGeometry args={[0.04, 10, 10]} />
            <meshStandardMaterial color="#4a7c4e" roughness={0.5} />
          </mesh>
        </group>
      </group>
    )
  }

  if (kind === 'decor_clock') {
    return (
      <group position={[0, 1.7, 0]}>
        {/* Clock Dial Rim */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.03, 36]} />
          <meshStandardMaterial map={woodTex} color={color || '#2d3748'} roughness={0.6} />
        </mesh>
        {/* Dial Face */}
        <mesh position={[0, 0, 0.016]}>
          <circleGeometry args={[0.27, 36]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} />
        </mesh>
        {/* Center Brass Cap */}
        <mesh position={[0, 0, 0.024]}>
          <cylinderGeometry args={[0.015, 0.015, 0.01, 16]} />
          <meshStandardMaterial color="#cca258" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Hour & Minute Hands */}
        <mesh position={[0, 0.06, 0.022]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[0.01, 0.14, 0.004]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <mesh position={[0.07, 0, 0.022]} rotation={[0, 0, -1.2]}>
          <boxGeometry args={[0.008, 0.19, 0.004]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
      </group>
    )
  }

  if (kind === 'decor_basket') {
    return (
      <group>
        {/* Braided Woven Seagrass Belly Basket */}
        <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.26, 24, 18, 0, Math.PI * 2, 0.35, Math.PI * 0.7]} />
          <meshStandardMaterial map={fabricTex} color={color || '#c29f6d'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
        {/* Bottom Base */}
        <mesh position={[0, 0.03, 0]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 20]} />
          <meshStandardMaterial map={fabricTex} color="#b8935f" roughness={0.95} />
        </mesh>
        {/* 2 Loop Handles on sides */}
        {[-0.24, 0.24].map((hx, idx) => (
          <mesh key={idx} position={[hx, 0.36, 0]} rotation={[0, 0, hx > 0 ? -0.3 : 0.3]} castShadow>
            <torusGeometry args={[0.045, 0.01, 8, 16, Math.PI]} />
            <meshStandardMaterial color="#a8824f" roughness={0.95} />
          </mesh>
        ))}
      </group>
    )
  }

  if (kind === 'decor_watering_can') {
    return (
      <group>
        {/* Cylindrical Brass Reservoir Tank */}
        <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[0.11, 0.11, 0.24, 24]} />
          <meshStandardMaterial color={color || '#c99c54'} metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Top Handle Loop */}
        <mesh position={[-0.04, 0.26, 0]} rotation={[0, 0, -0.2]} castShadow>
          <torusGeometry args={[0.1, 0.01, 10, 24, Math.PI]} />
          <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.25} />
        </mesh>
        {/* Long Slender Curved Pouring Spout */}
        <mesh position={[0.16, 0.18, 0]} rotation={[0, 0, -0.75]} castShadow>
          <cylinderGeometry args={[0.008, 0.016, 0.32, 14]} />
          <meshStandardMaterial color="#c99c54" metalness={0.85} roughness={0.25} />
        </mesh>
      </group>
    )
  }

  if (kind === 'decor_art_frame') {
    return (
      <group position={[0, 1.7, 0]}>
        {/* Solid Oak Wood Frame */}
        <RoundedBox args={[0.9, 1.15, 0.03]} radius={0.01} castShadow>
          <meshStandardMaterial map={woodTex} color={color || '#3d2c20'} roughness={0.6} />
        </RoundedBox>
        {/* White Beveled Matting */}
        <mesh position={[0, 0, 0.016]}>
          <planeGeometry args={[0.82, 1.07]} />
          <meshStandardMaterial color="#fafaf8" roughness={0.9} />
        </mesh>
        {/* Botanical Art Canvas Print */}
        <mesh position={[0, 0, 0.018]}>
          <planeGeometry args={[0.65, 0.85]} />
          <meshStandardMaterial map={leafTex} color="#276749" roughness={0.65} />
        </mesh>
      </group>
    )
  }

  // Plant Shelf / Bookcase Unit
  return (
    <group>
      {/* 4 Vertical Oak/Metal Ladder Posts */}
      {[
        [-0.64, -0.2],
        [0.64, -0.2],
        [-0.64, 0.2],
        [0.64, 0.2],
      ].map(([px, pz], idx) => (
        <mesh key={idx} position={[px, 1.05, pz]} castShadow>
          <boxGeometry args={[0.04, 2.1, 0.04]} />
          <meshStandardMaterial map={woodTex} color="#2b231d" roughness={0.6} />
        </mesh>
      ))}

      {/* 4 Hardwood Shelves */}
      {[0.2, 0.72, 1.24, 1.76, 2.05].map((y, idx) => (
        <RoundedBox key={idx} args={[1.36, 0.04, 0.44]} radius={0.01} position={[0, y, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={woodTex} color={color} roughness={0.5} />
        </RoundedBox>
      ))}

      {/* Shelf Accessories: Small Trailing Potted Vine on upper shelf */}
      <group position={[0.42, 1.88, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.09, 0.06, 0.12, 20]} />
          <meshStandardMaterial map={ceramicTex} color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.07, 0]}>
          <sphereGeometry args={[0.08, 12, 12]} />
          <meshStandardMaterial map={leafTex} color="#457038" roughness={0.5} />
        </mesh>
        {/* Trailing hanging tendril */}
        <mesh position={[0.06, -0.12, 0.08]} rotation={[0.2, 0, 0.4]}>
          <cylinderGeometry args={[0.015, 0.01, 0.28, 8]} />
          <meshStandardMaterial map={leafTex} color="#3b632e" />
        </mesh>
      </group>

      {/* Shelf Accessories: Stack of Botanical Books on middle shelf */}
      <group position={[-0.35, 1.34, 0]}>
        <RoundedBox args={[0.22, 0.04, 0.28]} radius={0.005} position={[0, 0, 0]} castShadow>
          <meshStandardMaterial color="#784838" roughness={0.7} />
        </RoundedBox>
        <RoundedBox args={[0.2, 0.035, 0.25]} radius={0.005} position={[0.01, 0.04, 0.01]} castShadow>
          <meshStandardMaterial color="#426850" roughness={0.7} />
        </RoundedBox>
      </group>

      {/* Shelf Accessories: Ceramic Vase on lower shelf */}
      <group position={[-0.32, 0.82, 0]}>
        <mesh position={[0, 0.09, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.08, 0.18, 20]} />
          <meshStandardMaterial map={ceramicTex} color="#d4a373" roughness={0.35} />
        </mesh>
      </group>
    </group>
  )
}
