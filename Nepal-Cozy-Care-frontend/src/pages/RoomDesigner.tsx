import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import {
  Camera,
  Copy,
  Download,
  Eye,
  Maximize2,
  Move3D,
  Palette,
  Redo2,
  RotateCw,
  Save,
  Sliders,
  Trash2,
  Undo2,
  Sparkles,
  Info,
  Layers,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import * as THREE from 'three'
import Botanical from '../components/room/Botanical'
import Furniture from '../components/room/Furniture'
import RoomEnvironment from '../components/room/RoomEnvironment'
import CustomGLBItem from '../components/room/CustomGLBItem'
import {
  loadRoomTransferState,
  clearRoomTransferState,
  type RoomDesignTransferState,
} from '../features/room-designer/roomTransferState'
import '../styles/roomDesigner.css'
import '../styles/roomDesignerRealistic.css'

const API = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

export type BuiltInItemKind =
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
  | 'monstera'
  | 'snake'
  | 'palm'

export interface RoomItem {
  id: string
  kind: string
  name?: string
  x: number
  z: number
  rotation: number // in radians
  scale: number // 0.5 to 2.0
  color: string
  modelUrl?: string | null
  baseWidth?: number
  baseDepth?: number
}

export interface RoomState {
  width: number
  depth: number
  wallColor: string
  floorColor: string
  items: RoomItem[]
}

const STORAGE_KEY = 'nepal-cozy-care-room-v2'
const LEGACY_STORAGE_KEY = 'nepal-cozy-care-room-v1'

const initialState: RoomState = {
  width: 7,
  depth: 6,
  wallColor: '#e8e2d7',
  floorColor: '#a87850',
  items: [],
}

export interface CatalogItem {
  kind: string
  name: string
  category: 'plants' | 'furniture' | 'pots' | 'decorations'
  icon: string
  color: string
  description: string
  modelUrl?: string | null
  width?: number
  depth?: number
}

export const builtInCatalog: CatalogItem[] = [
  { kind: 'monstera', name: 'Monstera Deliciosa', category: 'plants', icon: '🌿', color: '#276749', description: 'Lush fenestrated Swiss Cheese plant', width: 1.1, depth: 1.1 },
  { kind: 'snake', name: 'Snake Plant', category: 'plants', icon: '🪴', color: '#477c3c', description: 'Architectural upright variegated Sansevieria', width: 0.65, depth: 0.65 },
  { kind: 'palm', name: 'Areca Palm', category: 'plants', icon: '🌴', color: '#3f7d4b', description: 'Graceful feather-leaf indoor palm', width: 1.3, depth: 1.3 },
  { kind: 'bed', name: 'King Platform Bed', category: 'furniture', icon: '🛏️', color: '#c4b5a5', description: 'Plush upholstered headboard with duvet & pillows', width: 2.15, depth: 2.2 },
  { kind: 'nightstand', name: 'Bedside Nightstand', category: 'furniture', icon: '🪑', color: '#3d2c20', description: 'Hardwood bedside drawer with warm lamp', width: 0.6, depth: 0.55 },
  { kind: 'desk', name: 'Executive Work Desk', category: 'furniture', icon: '🖥️', color: '#3d2b1f', description: 'Modern desk with laptop, pad & mug', width: 1.65, depth: 0.85 },
  { kind: 'bathtub', name: 'Freestanding Bathtub', category: 'furniture', icon: '🛁', color: '#fafafa', description: 'Modern oval soaking tub with floor faucet', width: 1.85, depth: 0.95 },
  { kind: 'vanity', name: 'Floating Bath Vanity', category: 'furniture', icon: '🪞', color: '#3d4841', description: 'Vanity cabinet with basin and backlit mirror', width: 1.55, depth: 0.65 },
  { kind: 'kitchen_island', name: 'Waterfall Kitchen Island', category: 'furniture', icon: '🍳', color: '#2c3e35', description: 'Marble island with sink, cooktop & herb pot', width: 2.25, depth: 1.05 },
  { kind: 'stool', name: 'Counter Barstool', category: 'furniture', icon: '🪑', color: '#ded7ce', description: 'Sculpted seat with matte black legs', width: 0.5, depth: 0.5 },
  { kind: 'sofa', name: 'Linen Lounge Sofa', category: 'furniture', icon: '🛋️', color: '#aab8a2', description: 'Deep-seat 3-seater sofa with oak base', width: 2.35, depth: 1.05 },
  { kind: 'table', name: 'Coffee Table', category: 'furniture', icon: '▰', color: '#7a5238', description: 'Beveled oak table with shelf & books', width: 1.5, depth: 0.85 },
  { kind: 'chair', name: 'Nordic Armchair', category: 'furniture', icon: '🪑', color: '#d1a36d', description: 'Curved wrap-around accent armchair', width: 0.85, depth: 0.85 },
  { kind: 'shelf', name: 'Botanical Shelf', category: 'furniture', icon: '▥', color: '#5e4331', description: '5-tier oak and steel plant display', width: 1.4, depth: 0.48 },
]

export const itemBaseSizes: Record<string, [number, number]> = {
  sofa: [2.35, 1.05],
  table: [1.5, 0.85],
  chair: [0.85, 0.85],
  shelf: [1.4, 0.48],
  bed: [2.15, 2.2],
  desk: [1.65, 0.85],
  nightstand: [0.6, 0.55],
  bathtub: [1.85, 0.95],
  vanity: [1.55, 0.65],
  kitchen_island: [2.25, 1.05],
  counter: [2.25, 1.05],
  stool: [0.5, 0.5],
  monstera: [1.1, 1.1],
  snake: [0.65, 0.65],
  palm: [1.3, 1.3],
}

/**
 * Calculates bounding extents of an item accounting for rotation and scale,
 * then clamps its X/Z coordinates strictly inside room boundaries.
 */
export function constrainItem(item: RoomItem, roomWidth: number, roomDepth: number): RoomItem {
  const baseSize = itemBaseSizes[item.kind] || [item.baseWidth || 1.0, item.baseDepth || 1.0]
  const [baseW, baseD] = baseSize
  const scale = item.scale || 1
  const w = baseW * scale
  const d = baseD * scale
  const c = Math.abs(Math.cos(item.rotation || 0))
  const s = Math.abs(Math.sin(item.rotation || 0))
  const halfX = (w * c + d * s) / 2 + 0.05
  const halfZ = (w * s + d * c) / 2 + 0.05

  const minX = -roomWidth / 2 + halfX
  const maxX = roomWidth / 2 - halfX
  const minZ = -roomDepth / 2 + halfZ
  const maxZ = roomDepth / 2 - halfZ

  const safeX = minX > maxX ? 0 : THREE.MathUtils.clamp(item.x, minX, maxX)
  const safeZ = minZ > maxZ ? 0 : THREE.MathUtils.clamp(item.z, minZ, maxZ)

  return {
    ...item,
    scale: THREE.MathUtils.clamp(scale, 0.5, 2.0),
    x: Number.isFinite(safeX) ? safeX : 0,
    z: Number.isFinite(safeZ) ? safeZ : 0,
  }
}

/**
 * Fits all items within the room dimensions.
 */
export function fitRoom(room: RoomState): RoomState {
  return {
    ...room,
    items: room.items.map((item) => constrainItem(item, room.width, room.depth)),
  }
}

/**
 * Checks whether two items overlap in 2D floor space.
 */
export function doItemsOverlap(a: RoomItem, b: RoomItem): boolean {
  if (a.id === b.id) return false
  const sizeA = itemBaseSizes[a.kind] || [a.baseWidth || 1.0, a.baseDepth || 1.0]
  const sizeB = itemBaseSizes[b.kind] || [b.baseWidth || 1.0, b.baseDepth || 1.0]
  const [wA, dA] = sizeA
  const [wB, dB] = sizeB
  const radA = Math.max(wA, dA) * (a.scale || 1) * 0.45
  const radB = Math.max(wB, dB) * (b.scale || 1) * 0.45
  const distSq = (a.x - b.x) ** 2 + (a.z - b.z) ** 2
  return distSq < (radA + radB) ** 2
}

/**
 * Room Templates Generator
 */
export function generateRoomTemplate(templateKey: string): RoomState {
  switch (templateKey) {
    case 'bathroom':
      return {
        width: 5.5,
        depth: 4.5,
        wallColor: '#d6e2db',
        floorColor: '#e2ece8',
        items: [
          { id: crypto.randomUUID(), kind: 'bathtub', x: 0, z: -0.6, rotation: 0, scale: 1.05, color: '#fafafa' },
          { id: crypto.randomUUID(), kind: 'vanity', x: 1.7, z: 0.5, rotation: -Math.PI / 2, scale: 0.95, color: '#3d4841' },
          { id: crypto.randomUUID(), kind: 'palm', x: -1.75, z: -0.8, rotation: 0.4, scale: 1.15, color: '#3f7d4b' },
          { id: crypto.randomUUID(), kind: 'snake', x: 1.7, z: -1.2, rotation: 0.2, scale: 0.85, color: '#477c3c' },
          { id: crypto.randomUUID(), kind: 'shelf', x: -1.8, z: 1.0, rotation: Math.PI / 2, scale: 0.85, color: '#4a3728' },
        ],
      }
    case 'kitchen':
      return {
        width: 6,
        depth: 5,
        wallColor: '#f2eee6',
        floorColor: '#8f6f52',
        items: [
          { id: crypto.randomUUID(), kind: 'kitchen_island', x: 0, z: -0.2, rotation: 0, scale: 1.05, color: '#2c3e35' },
          { id: crypto.randomUUID(), kind: 'stool', x: -0.65, z: 0.75, rotation: 0, scale: 0.95, color: '#ded7ce' },
          { id: crypto.randomUUID(), kind: 'stool', x: 0.65, z: 0.75, rotation: 0, scale: 0.95, color: '#ded7ce' },
          { id: crypto.randomUUID(), kind: 'shelf', x: -2.0, z: -1.3, rotation: Math.PI / 2, scale: 0.9, color: '#4a3728' },
          { id: crypto.randomUUID(), kind: 'monstera', x: 1.9, z: -1.2, rotation: -0.3, scale: 1.05, color: '#276749' },
          { id: crypto.randomUUID(), kind: 'snake', x: -1.9, z: 1.1, rotation: 0.5, scale: 0.9, color: '#477c3c' },
        ],
      }
    case 'office':
      return {
        width: 6,
        depth: 5,
        wallColor: '#e5e8e3',
        floorColor: '#7a5a40',
        items: [
          { id: crypto.randomUUID(), kind: 'desk', x: 0, z: -0.5, rotation: 0, scale: 1.05, color: '#3d2b1f' },
          { id: crypto.randomUUID(), kind: 'chair', x: 0, z: 0.55, rotation: 0, scale: 0.95, color: '#2c3e35' },
          { id: crypto.randomUUID(), kind: 'shelf', x: -2.1, z: -1.3, rotation: Math.PI / 2, scale: 0.95, color: '#4a3728' },
          { id: crypto.randomUUID(), kind: 'snake', x: 1.9, z: -1.4, rotation: 0.3, scale: 1.05, color: '#477c3c' },
          { id: crypto.randomUUID(), kind: 'monstera', x: -1.9, z: 1.2, rotation: -0.2, scale: 1.0, color: '#276749' },
        ],
      }
    case 'bedroom':
      return {
        width: 6,
        depth: 5.5,
        wallColor: '#ded8cf',
        floorColor: '#8a6548',
        items: [
          { id: crypto.randomUUID(), kind: 'bed', x: 0, z: -0.7, rotation: 0, scale: 1.0, color: '#c4b5a5' },
          { id: crypto.randomUUID(), kind: 'nightstand', x: 1.6, z: -1.4, rotation: 0, scale: 0.95, color: '#3d2c20' },
          { id: crypto.randomUUID(), kind: 'nightstand', x: -1.6, z: -1.4, rotation: 0, scale: 0.95, color: '#3d2c20' },
          { id: crypto.randomUUID(), kind: 'chair', x: 1.7, z: 1.2, rotation: -Math.PI / 3, scale: 0.9, color: '#ded7ce' },
          { id: crypto.randomUUID(), kind: 'palm', x: -1.9, z: 1.1, rotation: 0.5, scale: 1.1, color: '#3f7d4b' },
          { id: crypto.randomUUID(), kind: 'monstera', x: 1.8, z: 0.1, rotation: -0.2, scale: 0.95, color: '#276749' },
        ],
      }
    case 'balcony':
      return {
        width: 5.5,
        depth: 4,
        wallColor: '#ebe5db',
        floorColor: '#967352',
        items: [
          { id: crypto.randomUUID(), kind: 'chair', x: -1.1, z: 0.2, rotation: Math.PI / 4, scale: 0.9, color: '#4f5d52' },
          { id: crypto.randomUUID(), kind: 'chair', x: 1.1, z: 0.2, rotation: -Math.PI / 4, scale: 0.9, color: '#4f5d52' },
          { id: crypto.randomUUID(), kind: 'table', x: 0, z: 0.6, rotation: 0, scale: 0.75, color: '#8c6d4f' },
          { id: crypto.randomUUID(), kind: 'palm', x: -1.7, z: -1.0, rotation: 0, scale: 1.25, color: '#3f7d4b' },
          { id: crypto.randomUUID(), kind: 'monstera', x: 1.7, z: -1.0, rotation: 0.2, scale: 1.1, color: '#276749' },
          { id: crypto.randomUUID(), kind: 'snake', x: 0, z: -1.1, rotation: 0, scale: 0.9, color: '#477c3c' },
        ],
      }
    case 'empty':
      return {
        width: 7,
        depth: 6,
        wallColor: '#e8e2d7',
        floorColor: '#a87850',
        items: [],
      }
    case 'living-room':
    default:
      return {
        width: 7,
        depth: 6,
        wallColor: '#e8e2d7',
        floorColor: '#a87850',
        items: [
          { id: crypto.randomUUID(), kind: 'sofa', x: -0.6, z: -1.2, rotation: Math.PI, scale: 1, color: '#aab8a2' },
          { id: crypto.randomUUID(), kind: 'table', x: -0.5, z: 0.15, rotation: 0, scale: 1, color: '#7a5238' },
          { id: crypto.randomUUID(), kind: 'chair', x: 1.45, z: 0.35, rotation: -Math.PI / 2, scale: 1, color: '#d1a36d' },
          { id: crypto.randomUUID(), kind: 'shelf', x: -2.35, z: -1.7, rotation: Math.PI / 2, scale: 1, color: '#5e4331' },
          { id: crypto.randomUUID(), kind: 'monstera', x: 2.2, z: -1.85, rotation: 0.2, scale: 1.1, color: '#d8875f' },
          { id: crypto.randomUUID(), kind: 'palm', x: -2.4, z: 1.4, rotation: -0.4, scale: 1.15, color: '#7d8a7c' },
          { id: crypto.randomUUID(), kind: 'snake', x: 1.5, z: 1.6, rotation: 0.6, scale: 1, color: '#e5ded5' },
        ],
      }
  }
}

/**
 * Smooth Camera Transition Rig
 */
function CameraRig({
  interior,
  room,
  dragging,
}: {
  interior: boolean
  room: RoomState
  dragging: boolean
}) {
  const { camera } = useThree()
  const controlsRef = useRef<any>(null)
  const isTransitioning = useRef(false)
  const transitionProgress = useRef(1)
  const prevInterior = useRef(interior)
  const startPos = useRef(new THREE.Vector3())
  const startTarget = useRef(new THREE.Vector3())

  const overviewPos = useMemo(() => new THREE.Vector3(7.2, 5.4, 8.2), [])
  const overviewTarget = useMemo(() => new THREE.Vector3(0, 0.85, 0), [])

  const interiorPos = useMemo(
    () => new THREE.Vector3(room.width * 0.36, 1.45, room.depth * 0.38),
    [room.width, room.depth]
  )
  const interiorTarget = useMemo(() => new THREE.Vector3(-0.3, 0.9, -0.4), [])

  useEffect(() => {
    if (prevInterior.current !== interior) {
      prevInterior.current = interior
      startPos.current.copy(camera.position)
      if (controlsRef.current) {
        startTarget.current.copy(controlsRef.current.target)
      }
      isTransitioning.current = true
      transitionProgress.current = 0
    }
  }, [interior, camera])

  useFrame((_, delta) => {
    if (isTransitioning.current) {
      transitionProgress.current = Math.min(1, transitionProgress.current + delta * 3.5)
      const t = THREE.MathUtils.smoothstep(transitionProgress.current, 0, 1)
      const destPos = interior ? interiorPos : overviewPos
      const destTarget = interior ? interiorTarget : overviewTarget

      camera.position.lerpVectors(startPos.current, destPos, t)
      if (controlsRef.current) {
        controlsRef.current.target.lerpVectors(startTarget.current, destTarget, t)
        controlsRef.current.update()
      }

      if (transitionProgress.current >= 1) {
        isTransitioning.current = false
      }
    }
  })

  return (
    <OrbitControls
      ref={controlsRef}
      enabled={!dragging}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      minPolarAngle={0.1}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={interior ? 0.6 : 3.5}
      maxDistance={20}
    />
  )
}

/**
 * Interactive 3D Object with selection, floor drag, scale & overlap highlight
 */
function SceneObject({
  item,
  selected,
  isOverlapping,
  room,
  onSelect,
  onMove,
  onDrag,
}: {
  item: RoomItem
  selected: boolean
  isOverlapping: boolean
  room: RoomState
  onSelect: () => void
  onMove: (x: number, z: number) => void
  onDrag: (active: boolean) => void
}) {
  const dragging = useRef(false)
  const offset = useRef(new THREE.Vector3())
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), [])
  const point = useMemo(() => new THREE.Vector3(), [])

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    if (e.ray.intersectPlane(plane, point)) {
      offset.current.set(item.x - point.x, 0, item.z - point.z)
    }
    dragging.current = true
    onDrag(true)
    onSelect()
    ;(e.target as HTMLElement)?.setPointerCapture?.(e.pointerId)
  }

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (!dragging.current || !e.ray.intersectPlane(plane, point)) return
    e.stopPropagation()
    const targetX = point.x + offset.current.x
    const targetZ = point.z + offset.current.z
    const constrained = constrainItem({ ...item, x: targetX, z: targetZ }, room.width, room.depth)
    onMove(constrained.x, constrained.z)
  }

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    if (dragging.current) {
      dragging.current = false
      onDrag(false)
      ;(e.target as HTMLElement)?.releasePointerCapture?.(e.pointerId)
    }
  }

  const isBotanical = item.kind === 'monstera' || item.kind === 'snake' || item.kind === 'palm'
  const scale = item.scale || 1

  return (
    <group
      position={[item.x, 0, item.z]}
      rotation={[0, item.rotation || 0, 0]}
      scale={[scale, scale, scale]}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {item.modelUrl ? (
        <CustomGLBItem modelUrl={item.modelUrl} color={item.color} scale={1} />
      ) : isBotanical ? (
        <Botanical kind={item.kind as BuiltInItemKind} potColor={item.color} />
      ) : (
        <Furniture kind={item.kind as BuiltInItemKind} color={item.color} />
      )}

      {/* Selection / Collision Indicator Halo */}
      {selected && (
        <group position={[0, 0.014 / scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <mesh>
            <ringGeometry args={[0.7, 0.78, 48]} />
            <meshBasicMaterial
              color={isOverlapping ? '#e85d43' : '#e6a827'}
              transparent
              opacity={0.88}
              side={THREE.DoubleSide}
            />
          </mesh>
          <mesh>
            <circleGeometry args={[0.7, 36]} />
            <meshBasicMaterial
              color={isOverlapping ? '#e85d43' : '#e6a827'}
              transparent
              opacity={0.12}
              side={THREE.DoubleSide}
            />
          </mesh>
        </group>
      )}
    </group>
  )
}

/**
 * 3D Viewport Scene
 */
function RoomScene({
  room,
  selectedId,
  setSelectedId,
  moveItem,
  onDrag,
  dragging,
  interior,
  roomType,
}: {
  room: RoomState
  selectedId: string | null
  setSelectedId: (id: string | null) => void
  moveItem: (id: string, x: number, z: number) => void
  onDrag: (active: boolean) => void
  dragging: boolean
  interior: boolean
  roomType?: string
}) {
  const overlappingIds = useMemo(() => {
    const set = new Set<string>()
    for (let i = 0; i < room.items.length; i++) {
      for (let j = i + 1; j < room.items.length; j++) {
        if (doItemsOverlap(room.items[i], room.items[j])) {
          set.add(room.items[i].id)
          set.add(room.items[j].id)
        }
      }
    }
    return set
  }, [room.items])

  return (
    <>
      <color attach="background" args={['#dce5df']} />
      <fog attach="fog" args={['#dce5df', 12, 28]} />

      {/* Realistic Lighting Rig */}
      <ambientLight intensity={0.42} color="#f0f5f2" />
      <hemisphereLight args={['#d8eefc', '#54463a', 0.65]} />
      <directionalLight
        position={[6, 9, 5]}
        intensity={2.2}
        color="#fff6e5"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.00015}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-4, 6, -3]} intensity={0.5} color="#d4e8f7" />

      {/* Room Architectural Walls, Floor, Window, Lamp, Rug */}
      <RoomEnvironment
        width={room.width}
        depth={room.depth}
        wallColor={room.wallColor}
        floorColor={room.floorColor}
        roomType={roomType}
      />

      {/* Floor Click Deselect Plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.001, 0]}
        onPointerDown={(e) => {
          if (e.intersections.length && e.intersections[0].object === e.object) {
            setSelectedId(null)
          }
        }}
      >
        <planeGeometry args={[room.width, room.depth]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      {/* Room Items */}
      {room.items.map((item) => (
        <SceneObject
          key={item.id}
          item={item}
          selected={selectedId === item.id}
          isOverlapping={overlappingIds.has(item.id)}
          room={room}
          onSelect={() => setSelectedId(item.id)}
          onMove={(x, z) => moveItem(item.id, x, z)}
          onDrag={onDrag}
        />
      ))}

      {/* Soft Contact Shadows */}
      <ContactShadows
        position={[0, 0.012, 0]}
        opacity={0.5}
        scale={Math.max(room.width, room.depth) * 1.5}
        blur={2.4}
        far={6}
        color="#1f2d23"
      />

      {/* Camera Rig & Orbit Controls */}
      <CameraRig interior={interior} room={room} dragging={dragging} />
    </>
  )
}

export default function RoomDesigner() {
  const location = useLocation()
  const [room, setRoom] = useState<RoomState>(initialState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [history, setHistory] = useState<RoomState[]>([])
  const [future, setFuture] = useState<RoomState[]>([])
  const [dragging, setDragging] = useState(false)
  const [interior, setInterior] = useState(false)
  const [notice, setNotice] = useState('')
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'plants' | 'furniture' | 'pots' | 'decorations'>('plants')
  const [selectedTemplate, setSelectedTemplate] = useState('living-room')
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>(builtInCatalog)

  // Transfer prompt dialog state
  const [pendingTransfer, setPendingTransfer] = useState<RoomDesignTransferState | null>(null)
  const [showTransferDialog, setShowTransferDialog] = useState(false)

  const canvasWrap = useRef<HTMLDivElement>(null)
  const cursor = useRef<HTMLDivElement>(null)
  const isDraggingGesture = useRef(false)
  const preDragState = useRef<RoomState | null>(null)

  // Fetch published admin decorations to augment catalog
  useEffect(() => {
    const fetchCustomDecorations = async () => {
      try {
        const res = await fetch(`${API}/api/decorations`)
        if (res.ok) {
          const json = await res.json()
          const customList: Array<any> = json.data || []
          const mappedCustom: CatalogItem[] = customList.map((d) => ({
            kind: `custom_${d.id}`,
            name: d.name,
            category: d.category || 'decorations',
            icon: d.category === 'plants' ? '🪴' : d.category === 'pots' ? '🏺' : '🛋️',
            color: d.default_color || '#276749',
            description: d.description || 'Custom catalog decoration',
            modelUrl: d.model_url,
            width: d.width || 1.0,
            depth: d.depth || 1.0,
          }))

          setCatalogItems([...builtInCatalog, ...mappedCustom])
        }
      } catch (err) {
        console.warn('Notice loading public decorations (using built-in catalog):', err)
      }
    }
    void fetchCustomDecorations()
  }, [])

  // Check for incoming transfer state from Plant Finder
  useEffect(() => {
    const incomingTransfer: RoomDesignTransferState | null =
      (location.state as RoomDesignTransferState) || loadRoomTransferState()

    if (incomingTransfer) {
      // Check if user already has a saved custom room with items
      let existingSaved: RoomState | null = null
      try {
        const raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed && Array.isArray(parsed.items) && parsed.items.length > 0) {
            existingSaved = parsed
          }
        }
      } catch {}

      if (existingSaved) {
        setPendingTransfer(incomingTransfer)
        setShowTransferDialog(true)
      } else {
        // Automatically apply transfer template
        applyTransferState(incomingTransfer)
      }
    } else {
      // Load saved room if present, otherwise default to living room template
      loadSavedRoomOrStarter()
    }
  }, [location.state])

  const loadSavedRoomOrStarter = () => {
    try {
      let raw = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY)
      if (!raw) {
        setRoom(generateRoomTemplate('living-room'))
        return
      }

      const v = JSON.parse(raw)
      if (!v || !Array.isArray(v.items)) {
        setRoom(generateRoomTemplate('living-room'))
        return
      }

      const validatedItems: RoomItem[] = v.items.map((i: any) => ({
        id: typeof i.id === 'string' ? i.id : crypto.randomUUID(),
        kind: i.kind || 'monstera',
        name: i.name,
        x: Number.isFinite(i.x) ? i.x : 0,
        z: Number.isFinite(i.z) ? i.z : 0,
        rotation: Number.isFinite(i.rotation) ? i.rotation : 0,
        scale: Number.isFinite(i.scale) && i.scale >= 0.5 && i.scale <= 2.0 ? i.scale : 1,
        color: typeof i.color === 'string' ? i.color : '#276749',
        modelUrl: i.modelUrl || null,
        baseWidth: i.baseWidth,
        baseDepth: i.baseDepth,
      }))

      setRoom(fitRoom({ ...v, items: validatedItems }))
    } catch {
      setRoom(generateRoomTemplate('living-room'))
    }
  }

  const applyTransferState = (transfer: RoomDesignTransferState) => {
    const template = generateRoomTemplate(transfer.templateKey || 'living-room')
    setRoom({
      ...template,
      width: transfer.width || template.width,
      depth: transfer.depth || template.depth,
      wallColor: transfer.wallColor || template.wallColor,
      floorColor: transfer.floorColor || template.floorColor,
    })
    setSelectedTemplate(transfer.templateKey || 'living-room')
    clearRoomTransferState()
    setShowTransferDialog(false)
    setPendingTransfer(null)
    setNotice(`Loaded ${transfer.roomName || 'transferred space'} from Plant Finder recommendations!`)
  }

  const keepSavedRoom = () => {
    clearRoomTransferState()
    setShowTransferDialog(false)
    setPendingTransfer(null)
    loadSavedRoomOrStarter()
    setNotice('Resumed your saved room design.')
  }

  // Decorative cursor tracker
  useEffect(() => {
    const track = (event: PointerEvent) => {
      cursor.current?.style.setProperty('transform', `translate3d(${event.clientX}px, ${event.clientY}px, 0)`)
    }
    window.addEventListener('pointermove', track)
    return () => window.removeEventListener('pointermove', track)
  }, [])

  // Commit a discrete state change into history
  const commit = useCallback((change: (current: RoomState) => RoomState) => {
    setRoom((prev) => {
      const next = fitRoom(change(prev))
      setHistory((stack) => [...stack.slice(-29), prev])
      setFuture([])
      return next
    })
  }, [])

  // Drag gesture history handling
  const onDrag = useCallback(
    (active: boolean) => {
      if (active) {
        if (!isDraggingGesture.current) {
          isDraggingGesture.current = true
          preDragState.current = room
        }
      } else {
        if (isDraggingGesture.current && preDragState.current) {
          const snapshot = preDragState.current
          isDraggingGesture.current = false
          preDragState.current = null
          setHistory((stack) => [...stack.slice(-29), snapshot])
          setFuture([])
        }
      }
      setDragging(active)
    },
    [room]
  )

  const add = (item: CatalogItem) => {
    if (room.items.length >= 60) {
      setNotice('This room supports up to 60 items.')
      return
    }
    const newItem: RoomItem = {
      id: crypto.randomUUID(),
      kind: item.kind,
      name: item.name,
      x: (Math.random() - 0.5) * 0.8,
      z: (Math.random() - 0.5) * 0.8,
      rotation: 0,
      scale: 1,
      color: item.color,
      modelUrl: item.modelUrl,
      baseWidth: item.width,
      baseDepth: item.depth,
    }
    commit((current) => ({
      ...current,
      items: [...current.items, newItem],
    }))
    setSelectedId(newItem.id)
  }

  const moveItem = (id: string, x: number, z: number) => {
    setRoom((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === id ? constrainItem({ ...item, x, z }, current.width, current.depth) : item
      ),
    }))
  }

  const updateSelected = (change: (item: RoomItem) => RoomItem) => {
    if (!selectedId) return
    commit((current) => ({
      ...current,
      items: current.items.map((item) =>
        item.id === selectedId ? constrainItem(change(item), current.width, current.depth) : item
      ),
    }))
  }

  const duplicateSelected = () => {
    const selectedItem = room.items.find((i) => i.id === selectedId)
    if (!selectedItem) return
    if (room.items.length >= 60) {
      setNotice('This room supports up to 60 items.')
      return
    }
    const duplicated: RoomItem = constrainItem(
      {
        ...selectedItem,
        id: crypto.randomUUID(),
        x: selectedItem.x + 0.35,
        z: selectedItem.z + 0.35,
      },
      room.width,
      room.depth
    )
    commit((current) => ({
      ...current,
      items: [...current.items, duplicated],
    }))
    setSelectedId(duplicated.id)
    setNotice(`Duplicated ${selectedItem.name || selectedItem.kind}.`)
  }

  const removeSelected = () => {
    if (!selectedId) return
    commit((current) => ({
      ...current,
      items: current.items.filter((item) => item.id !== selectedId),
    }))
    setSelectedId(null)
  }

  const undo = () => {
    const previous = history.at(-1)
    if (previous) {
      setHistory(history.slice(0, -1))
      setFuture([room, ...future])
      setRoom(previous)
      setSelectedId(null)
    }
  }

  const redo = () => {
    const next = future[0]
    if (next) {
      setFuture(future.slice(1))
      setHistory([...history, room])
      setRoom(next)
      setSelectedId(null)
    }
  }

  // Keyboard accessibility shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement as HTMLElement)?.tagName?.toLowerCase()
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') return

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        e.preventDefault()
        removeSelected()
      } else if (e.key === 'Escape' && selectedId) {
        setSelectedId(null)
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        redo()
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd' && selectedId) {
        e.preventDefault()
        duplicateSelected()
      } else if (selectedId && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault()
        const step = e.shiftKey ? 0.4 : 0.1
        updateSelected((item) => {
          let dx = 0
          let dz = 0
          if (e.key === 'ArrowLeft') dx -= step
          if (e.key === 'ArrowRight') dx += step
          if (e.key === 'ArrowUp') dz -= step
          if (e.key === 'ArrowDown') dz += step
          return { ...item, x: item.x + dx, z: item.z + dz }
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedId, room, history, future])

  const save = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(room))
      setSaved(true)
      setNotice('Room design saved locally on this device.')
      window.setTimeout(() => setSaved(false), 2000)
    } catch {
      setNotice('Storage is unavailable. Keep this tab open to retain your room.')
    }
  }

  const screenshot = () => {
    try {
      const canvas = canvasWrap.current?.querySelector('canvas')
      if (!canvas) {
        setNotice('Could not find 3D canvas for image capture.')
        return
      }
      const dataUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = `nepal-cozy-care-room-${new Date().toISOString().slice(0, 10)}.png`
      link.href = dataUrl
      link.click()
      setNotice('High-resolution room image exported.')
    } catch {
      setNotice('Image export failed. Please try again.')
    }
  }

  const handleApplyTemplate = (templateKey: string) => {
    if (room.items.length && !window.confirm('Replace your current room arrangement with this template?')) {
      return
    }
    const templ = generateRoomTemplate(templateKey)
    commit(() => templ)
    setSelectedTemplate(templateKey)
    setSelectedId(null)
    setNotice(`Loaded ${templateKey.replace('-', ' ')} template.`)
  }

  const selected = room.items.find((i) => i.id === selectedId)
  const filteredCatalog = catalogItems.filter((item) => item.category === activeTab)

  return (
    <div className="room-designer-page">
      <div ref={cursor} className="room-cursor" aria-hidden="true">
        <span>✦</span>
      </div>

      {/* Transfer Resume Modal */}
      {showTransferDialog && pendingTransfer && (
        <div className="transfer-dialog-backdrop">
          <div className="transfer-dialog-card">
            <div className="transfer-dialog-kicker">
              <Sparkles size={16} />
              <span>Plant Finder Recommendations Ready</span>
            </div>
            <h2>Apply Your {pendingTransfer.roomName || 'Custom'} Space?</h2>
            <p>
              We detected choices from your Plant Finder questionnaire with recommended plants. You can generate a new layout or continue working on your saved room.
            </p>
            <div className="transfer-dialog-actions">
              <button
                type="button"
                className="transfer-dialog-btn secondary"
                onClick={keepSavedRoom}
              >
                Keep Saved Room
              </button>
              <button
                type="button"
                className="transfer-dialog-btn primary"
                onClick={() => applyTransferState(pendingTransfer)}
              >
                Generate From Plant Finder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <section className="designer-intro">
        <p className="designer-eyebrow">NEPAL COZY CARE • 3D INTERIOR STUDIO</p>
        <h1>Architectural Room Studio</h1>
        <p>
          Design your botanical living space. Arrange plants, style furniture, and experience natural daylight in 3D.
        </p>
        <div className="designer-hint">
          <Move3D size={16} /> Drag objects on floor • Drag empty space to orbit camera • Arrow keys to nudge
        </div>
      </section>

      {notice && (
        <p className="studio-notice" role="status">
          <Info size={15} /> {notice}
        </p>
      )}

      {/* Main Studio Shell */}
      <section className="designer-shell">
        {/* Left Panel: Catalog */}
        <aside className="designer-panel catalog-panel" aria-label="Catalog Panel">
          <div className="panel-header">
            <span className="panel-step">01</span>
            <div>
              <h2>Add to room</h2>
              <p>Choose plants, furniture, and custom decor.</p>
            </div>
          </div>

          {/* Room Templates Quick Picker */}
          <div className="template-picker-wrap">
            <label className="template-picker-label">
              <Layers size={14} />
              <span>Room Template</span>
            </label>
            <div className="template-btn-grid">
              <button
                type="button"
                className={`template-chip ${selectedTemplate === 'living-room' ? 'active' : ''}`}
                onClick={() => handleApplyTemplate('living-room')}
              >
                Living Room
              </button>
              <button
                type="button"
                className={`template-chip ${selectedTemplate === 'bedroom' ? 'active' : ''}`}
                onClick={() => handleApplyTemplate('bedroom')}
              >
                Bedroom
              </button>
              <button
                type="button"
                className={`template-chip ${selectedTemplate === 'office' ? 'active' : ''}`}
                onClick={() => handleApplyTemplate('office')}
              >
                Office
              </button>
              <button
                type="button"
                className={`template-chip ${selectedTemplate === 'balcony' ? 'active' : ''}`}
                onClick={() => handleApplyTemplate('balcony')}
              >
                Balcony
              </button>
              <button
                type="button"
                className={`template-chip ${selectedTemplate === 'bathroom' ? 'active' : ''}`}
                onClick={() => handleApplyTemplate('bathroom')}
              >
                Bathroom
              </button>
              <button
                type="button"
                className={`template-chip ${selectedTemplate === 'kitchen' ? 'active' : ''}`}
                onClick={() => handleApplyTemplate('kitchen')}
              >
                Kitchen
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="catalog-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'plants'}
              className={`catalog-tab ${activeTab === 'plants' ? 'active' : ''}`}
              onClick={() => setActiveTab('plants')}
            >
              🌿 Plants
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'furniture'}
              className={`catalog-tab ${activeTab === 'furniture' ? 'active' : ''}`}
              onClick={() => setActiveTab('furniture')}
            >
              🛋️ Furniture
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'decorations'}
              className={`catalog-tab ${activeTab === 'decorations' ? 'active' : ''}`}
              onClick={() => setActiveTab('decorations')}
            >
              🏺 Decor & Pots
            </button>
          </div>

          <div className="catalog-grid">
            {filteredCatalog.map((item) => (
              <button
                type="button"
                key={item.kind}
                onClick={() => add(item)}
                title={item.description}
                className="catalog-item-btn"
              >
                <span className="item-icon">{item.icon}</span>
                <strong>{item.name}</strong>
                <small>+ Add to space</small>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: 3D Canvas Stage */}
        <div className="designer-stage" ref={canvasWrap}>
          {/* Top Floating Action Toolbar */}
          <div className="stage-toolbar">
            <div className="toolbar-group">
              <button
                type="button"
                onClick={undo}
                disabled={!history.length}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 size={17} />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={!future.length}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <Redo2 size={17} />
              </button>
            </div>

            <div className="toolbar-spacer" />

            <div className="toolbar-group">
              <button
                type="button"
                aria-pressed={interior}
                className={interior ? 'active-toggle' : ''}
                onClick={() => setInterior(!interior)}
                title="Toggle Eye-Level View"
              >
                {interior ? <Camera size={16} /> : <Eye size={16} />}
                <span>{interior ? 'Overview' : 'Interior view'}</span>
              </button>
              <button type="button" onClick={save} title="Save room layout">
                <Save size={16} /> <span>{saved ? 'Saved!' : 'Save'}</span>
              </button>
              <button type="button" onClick={screenshot} title="Export high-res image">
                <Download size={16} /> <span>Image</span>
              </button>
            </div>
          </div>

          {/* WebGL 3D Canvas */}
          <Canvas
            key={interior ? 'interior-mode' : 'overview-mode'}
            fallback={
              <div className="webgl-fallback">
                <h3>3D Rendering Requires WebGL</h3>
                <p>Please use a modern browser with hardware graphics acceleration enabled.</p>
              </div>
            }
            shadows="soft"
            dpr={[1, 2]}
            gl={{
              preserveDrawingBuffer: true,
              antialias: true,
              toneMapping: THREE.ACESFilmicToneMapping,
            }}
            onCreated={({ gl }) => {
              gl.toneMappingExposure = 1.12
            }}
            camera={{
              position: interior ? [room.width * 0.36, 1.45, room.depth * 0.38] : [7.2, 5.4, 8.2],
              fov: interior ? 65 : 38,
            }}
          >
            <RoomScene
              room={room}
              selectedId={selectedId}
              setSelectedId={setSelectedId}
              moveItem={moveItem}
              onDrag={onDrag}
              dragging={dragging}
              interior={interior}
              roomType={selectedTemplate}
            />
          </Canvas>

          {!room.items.length && (
            <div className="empty-room-note">
              Choose an item from the left catalog or select a furnished template
            </div>
          )}
        </div>

        {/* Right Panel: Room & Selection Customizer */}
        <aside className="designer-panel room-panel" aria-label="Room Controls Panel">
          <div className="panel-header">
            <span className="panel-step">02</span>
            <div>
              <h2>Customize</h2>
              <p>Dimensions, finishes, and selected object.</p>
            </div>
          </div>

          {/* Room Dimensions */}
          <div className="panel-section">
            <h3 className="section-title">
              <Sliders size={15} /> Room Dimensions
            </h3>
            <label className="range-label">
              <span>Width</span>
              <strong>{room.width}m</strong>
              <input
                type="range"
                aria-label="Room width"
                min="4"
                max="10"
                step="0.5"
                value={room.width}
                onChange={(e) => commit((current) => ({ ...current, width: Number(e.target.value) }))}
              />
            </label>
            <label className="range-label">
              <span>Depth</span>
              <strong>{room.depth}m</strong>
              <input
                type="range"
                aria-label="Room depth"
                min="4"
                max="10"
                step="0.5"
                value={room.depth}
                onChange={(e) => commit((current) => ({ ...current, depth: Number(e.target.value) }))}
              />
            </label>
          </div>

          {/* Wall & Floor Finishes */}
          <div className="panel-section">
            <h3 className="section-title">
              <Palette size={15} /> Finishes & Colors
            </h3>
            <div className="color-control">
              <label>Wall Plaster</label>
              <input
                aria-label="Wall colour"
                type="color"
                value={room.wallColor}
                onChange={(e) => commit((current) => ({ ...current, wallColor: e.target.value }))}
              />
              <span>{room.wallColor}</span>
            </div>
            <div className="color-control">
              <label>Hardwood Floor</label>
              <input
                aria-label="Floor colour"
                type="color"
                value={room.floorColor}
                onChange={(e) => commit((current) => ({ ...current, floorColor: e.target.value }))}
              />
              <span>{room.floorColor}</span>
            </div>
          </div>

          {/* Selected Item Controls */}
          <div className="panel-section">
            <h3 className="section-title">
              <Maximize2 size={15} /> Item Selection
            </h3>
            <label className="select-label">
              <span>Selected Object</span>
              <select
                aria-label="Select room item"
                value={selectedId ?? ''}
                onChange={(e) => setSelectedId(e.target.value || null)}
              >
                <option value="">None (Click object in room)</option>
                {room.items.map((item, idx) => (
                  <option key={item.id} value={item.id}>
                    {item.name || item.kind} #{idx + 1}
                  </option>
                ))}
              </select>
            </label>

            {selected ? (
              <div className="selected-tools">
                <div className="selected-badge">
                  <strong>{selected.name || selected.kind}</strong>
                  <span className="badge-tag">{selected.kind}</span>
                </div>

                {/* Color customizer */}
                <div className="color-control item-color-control">
                  <label>Finish / Accent</label>
                  <input
                    aria-label="Item color"
                    type="color"
                    value={selected.color}
                    onChange={(e) => updateSelected((item) => ({ ...item, color: e.target.value }))}
                  />
                  <span>{selected.color}</span>
                </div>

                {/* Scale Slider */}
                <label className="range-label">
                  <span>Scale / Size</span>
                  <strong>{Math.round((selected.scale || 1) * 100)}%</strong>
                  <input
                    type="range"
                    aria-label="Scale"
                    min="0.5"
                    max="1.8"
                    step="0.05"
                    value={selected.scale || 1}
                    onChange={(e) =>
                      updateSelected((item) => ({
                        ...item,
                        scale: Number(e.target.value),
                      }))
                    }
                  />
                </label>

                {/* Rotation Slider */}
                <label className="range-label">
                  <span>Rotation</span>
                  <strong>{Math.round((((selected.rotation || 0) * 180) / Math.PI) % 360)}°</strong>
                  <input
                    type="range"
                    aria-label="Rotation angle"
                    min="0"
                    max={Math.PI * 2}
                    step={Math.PI / 36}
                    value={(selected.rotation || 0) % (Math.PI * 2)}
                    onChange={(e) =>
                      updateSelected((item) => ({
                        ...item,
                        rotation: Number(e.target.value),
                      }))
                    }
                  />
                </label>

                {/* Coordinate Inputs */}
                <div className="position-controls">
                  <label>
                    <span>Pos X (m)</span>
                    <input
                      aria-label="Position X"
                      type="number"
                      step="0.1"
                      value={Number(selected.x.toFixed(2))}
                      onChange={(e) => {
                        if (Number.isFinite(e.target.valueAsNumber)) {
                          updateSelected((i) => ({ ...i, x: e.target.valueAsNumber }))
                        }
                      }}
                    />
                  </label>
                  <label>
                    <span>Pos Z (m)</span>
                    <input
                      aria-label="Position Z"
                      type="number"
                      step="0.1"
                      value={Number(selected.z.toFixed(2))}
                      onChange={(e) => {
                        if (Number.isFinite(e.target.valueAsNumber)) {
                          updateSelected((i) => ({ ...i, z: e.target.valueAsNumber }))
                        }
                      }}
                    />
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="action-buttons-grid">
                  <button
                    type="button"
                    onClick={() =>
                      updateSelected((item) => ({ ...item, rotation: (item.rotation || 0) + Math.PI / 4 }))
                    }
                  >
                    <RotateCw size={15} /> Rotate 45°
                  </button>
                  <button type="button" onClick={duplicateSelected} title="Duplicate (Ctrl+D)">
                    <Copy size={15} /> Duplicate
                  </button>
                </div>

                <button
                  type="button"
                  className="danger-btn"
                  onClick={removeSelected}
                  title="Remove selected item (Delete)"
                >
                  <Trash2 size={15} /> Remove item
                </button>
              </div>
            ) : (
              <div className="no-selection-hint">
                <p>Click any object in the 3D room to adjust its position, rotation, scale, or color.</p>
              </div>
            )}
          </div>

          {/* Reset Room Button */}
          <button
            type="button"
            className="reset-room-btn"
            onClick={() => {
              if (window.confirm('Clear all objects and reset room to empty?')) {
                commit(() => generateRoomTemplate('empty'))
                setSelectedId(null)
              }
            }}
          >
            Clear room
          </button>
        </aside>
      </section>
    </div>
  )
}
