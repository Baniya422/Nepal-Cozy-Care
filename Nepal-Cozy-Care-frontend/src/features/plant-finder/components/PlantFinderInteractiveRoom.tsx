import { Canvas } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { useMemo, Suspense } from 'react'
import * as THREE from 'three'
import Botanical from '../../../components/room/Botanical'
import Furniture from '../../../components/room/Furniture'
import RoomEnvironment from '../../../components/room/RoomEnvironment'
import { defaultTemplateDimensions } from '../../room-designer/roomTransferState'
import type { ActiveField, PlantFinderSelections } from '../types'
import { Sparkles, Sun, Info, Eye } from 'lucide-react'

interface PlantFinderInteractiveRoomProps {
  selections: PlantFinderSelections
  activeField: ActiveField
  recommendedPlantsCount?: number
  onContinueToStudio?: () => void
}

/**
 * Lighting Rig responding dynamically to the user's selected light condition
 */
function InteractiveLighting({ lightKey }: { lightKey: string }) {
  const lightConfig = useMemo(() => {
    switch (lightKey) {
      case 'bright-light':
        return {
          ambientIntensity: 0.35,
          ambientColor: '#fff8eb',
          hemiSky: '#ffeed6',
          hemiGround: '#634b35',
          hemiIntensity: 0.75,
          sunColor: '#fff5df',
          sunIntensity: 2.8,
          sunPos: [5, 8, 4] as [number, number, number],
          castShadow: true,
          skylightIntensity: 0.6,
        }
      case 'low-light':
        return {
          ambientIntensity: 0.28,
          ambientColor: '#d6dbe5',
          hemiSky: '#a5b5c9',
          hemiGround: '#3a3d45',
          hemiIntensity: 0.45,
          sunColor: '#ffddaa',
          sunIntensity: 1.1,
          sunPos: [3, 5, 2] as [number, number, number],
          castShadow: true,
          skylightIntensity: 0.3,
        }
      case 'indirect-light':
        return {
          ambientIntensity: 0.55,
          ambientColor: '#eaf4fc',
          hemiSky: '#cbe3f7',
          hemiGround: '#4b554e',
          hemiIntensity: 0.8,
          sunColor: '#e2edfa',
          sunIntensity: 1.4,
          sunPos: [-4, 7, -3] as [number, number, number],
          castShadow: false,
          skylightIntensity: 0.9,
        }
      case 'medium-light':
      default:
        return {
          ambientIntensity: 0.45,
          ambientColor: '#f2f6f3',
          hemiSky: '#d8eefc',
          hemiGround: '#54463a',
          hemiIntensity: 0.65,
          sunColor: '#fff6e5',
          sunIntensity: 2.0,
          sunPos: [5, 8, 4] as [number, number, number],
          castShadow: true,
          skylightIntensity: 0.5,
        }
    }
  }, [lightKey])

  return (
    <>
      <ambientLight intensity={lightConfig.ambientIntensity} color={lightConfig.ambientColor} />
      <hemisphereLight args={[lightConfig.hemiSky, lightConfig.hemiGround, lightConfig.hemiIntensity]} />
      <directionalLight
        position={lightConfig.sunPos}
        intensity={lightConfig.sunIntensity}
        color={lightConfig.sunColor}
        castShadow={lightConfig.castShadow}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0002}
      />
      <directionalLight position={[-3, 5, -2]} intensity={lightConfig.skylightIntensity} color="#d4e8f7" />
    </>
  )
}

/**
 * 3D Scene representing the selected room archetype and live plant setup
 */
function RoomArchetypeScene({ selections }: { selections: PlantFinderSelections }) {
  const roomKey = selections.room || 'living-room'
  const defaults = defaultTemplateDimensions[roomKey] || defaultTemplateDimensions['living-room']

  // Select appropriate architectural and furniture layout based on room selection
  const sceneItems = useMemo(() => {
    switch (roomKey) {
      case 'office':
        return [
          { kind: 'desk' as const, x: 0, z: -0.4, rotation: 0, scale: 1.05, color: '#3d2b1f' },
          { kind: 'chair' as const, x: 0, z: 0.55, rotation: 0, scale: 0.95, color: '#2c3e35' },
          { kind: 'shelf' as const, x: -1.9, z: -1.1, rotation: Math.PI / 2, scale: 0.9, color: '#4a3728' },
          { kind: 'snake' as const, x: 1.7, z: -1.2, rotation: 0.3, scale: 1.0, color: '#477c3c' },
          { kind: 'monstera' as const, x: -1.7, z: 1.1, rotation: -0.4, scale: 1.05, color: '#276749' },
        ]
      case 'bedroom':
        return [
          { kind: 'bed' as const, x: 0, z: -0.7, rotation: 0, scale: 1.0, color: '#c4b5a5' },
          { kind: 'nightstand' as const, x: 1.5, z: -1.4, rotation: 0, scale: 0.95, color: '#3d2c20' },
          { kind: 'nightstand' as const, x: -1.5, z: -1.4, rotation: 0, scale: 0.95, color: '#3d2c20' },
          { kind: 'palm' as const, x: -1.8, z: 1.0, rotation: 0.5, scale: 1.1, color: '#3f7d4b' },
          { kind: 'chair' as const, x: 1.5, z: 1.0, rotation: -Math.PI / 3, scale: 0.85, color: '#ded7ce' },
          { kind: 'monstera' as const, x: 1.6, z: 0.1, rotation: -0.2, scale: 0.95, color: '#276749' },
        ]
      case 'balcony':
        return [
          { kind: 'chair' as const, x: -0.9, z: 0.1, rotation: Math.PI / 4, scale: 0.9, color: '#4f5d52' },
          { kind: 'chair' as const, x: 0.9, z: 0.1, rotation: -Math.PI / 4, scale: 0.9, color: '#4f5d52' },
          { kind: 'table' as const, x: 0, z: 0.5, rotation: 0, scale: 0.7, color: '#9c8167' },
          { kind: 'palm' as const, x: -1.6, z: -0.9, rotation: 0, scale: 1.25, color: '#3f7d4b' },
          { kind: 'monstera' as const, x: 1.6, z: -0.9, rotation: 0.2, scale: 1.1, color: '#276749' },
          { kind: 'snake' as const, x: 0, z: -1.0, rotation: 0, scale: 0.85, color: '#477c3c' },
        ]
      case 'bathroom':
        return [
          { kind: 'bathtub' as const, x: 0, z: -0.6, rotation: 0, scale: 1.05, color: '#fafafa' },
          { kind: 'vanity' as const, x: 1.65, z: 0.5, rotation: -Math.PI / 2, scale: 0.95, color: '#3d4841' },
          { kind: 'palm' as const, x: -1.7, z: -0.75, rotation: 0.4, scale: 1.15, color: '#3f7d4b' },
          { kind: 'snake' as const, x: 1.6, z: -1.2, rotation: 0.2, scale: 0.85, color: '#477c3c' },
          { kind: 'shelf' as const, x: -1.7, z: 1.0, rotation: Math.PI / 2, scale: 0.85, color: '#4a3728' },
        ]
      case 'kitchen':
        return [
          { kind: 'kitchen_island' as const, x: 0, z: -0.2, rotation: 0, scale: 1.05, color: '#2c3e35' },
          { kind: 'stool' as const, x: -0.65, z: 0.75, rotation: 0, scale: 0.95, color: '#ded7ce' },
          { kind: 'stool' as const, x: 0.65, z: 0.75, rotation: 0, scale: 0.95, color: '#ded7ce' },
          { kind: 'shelf' as const, x: -1.9, z: -1.2, rotation: Math.PI / 2, scale: 0.9, color: '#4a3728' },
          { kind: 'monstera' as const, x: 1.8, z: -1.1, rotation: -0.3, scale: 1.05, color: '#276749' },
          { kind: 'snake' as const, x: -1.8, z: 1.0, rotation: 0.5, scale: 0.9, color: '#477c3c' },
        ]
      case 'living-room':
      default:
        return [
          { kind: 'sofa' as const, x: -0.3, z: -0.8, rotation: 0, scale: 1.0, color: '#aab8a2' },
          { kind: 'table' as const, x: -0.3, z: 0.5, rotation: 0, scale: 0.85, color: '#7a5238' },
          { kind: 'chair' as const, x: 1.5, z: 0.5, rotation: -Math.PI / 2, scale: 0.85, color: '#d1a36d' },
          { kind: 'monstera' as const, x: 1.8, z: -1.2, rotation: 0.2, scale: 1.1, color: '#276749' },
          { kind: 'palm' as const, x: -1.9, z: 1.0, rotation: -0.4, scale: 1.15, color: '#3f7d4b' },
          { kind: 'snake' as const, x: -1.9, z: -1.2, rotation: 0.6, scale: 0.9, color: '#477c3c' },
        ]
    }
  }, [roomKey])

  return (
    <>
      <color attach="background" args={['#e4ebe7']} />
      <fog attach="fog" args={['#e4ebe7', 10, 24]} />

      <InteractiveLighting lightKey={selections.light} />

      <RoomEnvironment
        width={defaults.width}
        depth={defaults.depth}
        wallColor={defaults.wallColor}
        floorColor={defaults.floorColor}
        roomType={roomKey}
      />

      {sceneItems.map((item, index) => {
        const isPlant = item.kind === 'monstera' || item.kind === 'snake' || item.kind === 'palm'
        return (
          <group
            key={`${item.kind}-${index}`}
            position={[item.x, 0, item.z]}
            rotation={[0, item.rotation, 0]}
            scale={[item.scale, item.scale, item.scale]}
          >
            {isPlant ? (
              <Botanical kind={item.kind} potColor={item.color} />
            ) : (
              <Furniture kind={item.kind} color={item.color} />
            )}
          </group>
        )
      })}

      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.45}
        scale={Math.max(defaults.width, defaults.depth) * 1.4}
        blur={2.2}
        far={5}
        color="#1b2920"
      />

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 2 - 0.05}
        minDistance={3}
        maxDistance={16}
      />
    </>
  )
}

export default function PlantFinderInteractiveRoom({
  selections,
  recommendedPlantsCount = 0,
  onContinueToStudio,
}: PlantFinderInteractiveRoomProps) {
  const roomName = selections.room
    ? selections.room.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Living Room'

  const lightName = selections.light
    ? selections.light.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Standard Daylight'

  return (
    <div className="pf-interactive-room-container">
      {/* Visual Canvas Viewport */}
      <div className="pf-3d-stage">
        <Canvas
          shadows="soft"
          dpr={[1, 1.5]}
          gl={{
            preserveDrawingBuffer: true,
            antialias: true,
            toneMapping: THREE.ACESFilmicToneMapping,
          }}
          camera={{
            position: [6.2, 4.8, 6.8],
            fov: 38,
          }}
        >
          <Suspense fallback={null}>
            <RoomArchetypeScene selections={selections} />
          </Suspense>
        </Canvas>

        {/* Ambient Badge Overlay */}
        <div className="pf-room-overlay-tags">
          <div className="pf-overlay-badge primary">
            <Sparkles size={12} />
            <span>{roomName} Preview</span>
          </div>
          <div className="pf-overlay-badge light">
            <Sun size={12} />
            <span>{lightName}</span>
          </div>
          {recommendedPlantsCount > 0 && (
            <div className="pf-overlay-badge matches">
              <span>🌿 {recommendedPlantsCount} Matches Ready</span>
            </div>
          )}
        </div>

        {/* 3D Interaction Prompt */}
        <div className="pf-stage-hint">
          <Eye size={13} />
          <span>Drag to orbit 3D space</span>
        </div>
      </div>

      {/* Disclaimers and Direct Action */}
      <div className="pf-preview-footer-actions">
        <div className="pf-preview-disclaimer">
          <Info size={13} />
          <span>Illustrative ambiance preview (visual simulation, not a scientific solar meter)</span>
        </div>

        {onContinueToStudio && (
          <button
            type="button"
            className="pf-quick-studio-btn"
            onClick={onContinueToStudio}
            title="Open and customize this space in the 3D Studio"
          >
            <span>Customize this room in 3D Studio</span> →
          </button>
        )}
      </div>
    </div>
  )
}
